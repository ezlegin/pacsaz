/**
 * One-off helper: copies every row from the legacy MySQL `pacsaz` database into the
 * PostgreSQL database, preserving primary keys. Table and column names are matched
 * case-insensitively (MySQL lower-cased table names on Windows), so this works
 * against whatever schema Prisma just created in PostgreSQL.
 *
 * Run with:
 *   MYSQL_HOST=localhost MYSQL_USER=root MYSQL_PASSWORD=... MYSQL_DATABASE=pacsaz \
 *   DATABASE_URL=postgresql://... node scripts/mysql-to-postgres.mjs
 */
import mysql from "mysql2/promise";
import { Client } from "pg";

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name}`);
  return value;
};

const mysqlConfig = {
  host: required("MYSQL_HOST"),
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: required("MYSQL_USER"),
  password: required("MYSQL_PASSWORD"),
  database: required("MYSQL_DATABASE"),
};

const quoteIdent = (name) => `"${String(name).replace(/"/g, '""')}"`;

const CHUNK_SIZE = 200;

/** Coerce a mysql2 value into something PostgreSQL will accept for that column. */
const coerce = (value, pgColumn) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "bigint") return Number(value);

  if (pgColumn.data_type === "boolean") {
    if (typeof value === "boolean") return value;
    if (Buffer.isBuffer(value)) return value[0] === 1;
    return value === 1 || value === "1" || value === "true";
  }

  if (Buffer.isBuffer(value)) {
    return pgColumn.udt_name === "bytea" ? value : value.toString("utf8");
  }

  if (value instanceof Date) return value;

  // JSON columns come back as already-parsed objects from mysql2.
  if (typeof value === "object") return JSON.stringify(value);

  return value;
};

const main = async () => {
  const my = await mysql.createConnection({
    ...mysqlConfig,
    // Keep Prisma-style camelCase column names intact.
    supportBigNumbers: true,
  });
  const pg = new Client({ connectionString: required("DATABASE_URL") });
  await pg.connect();

  const [myTableRows] = await my.query(
    `select table_name as name from information_schema.tables
     where table_schema = ? and table_type = 'BASE TABLE'
     order by table_name`,
    [mysqlConfig.database],
  );
  const myTables = myTableRows
    .map((row) => row.name)
    .filter((name) => name.toLowerCase() !== "_prisma_migrations");

  const { rows: pgTableRows } = await pg.query(
    `select tablename from pg_tables where schemaname = 'public'`,
  );
  const pgTableByLower = new Map(
    pgTableRows.map((row) => [row.tablename.toLowerCase(), row.tablename]),
  );

  await pg.query("begin");
  // We insert tables in arbitrary order and want to keep the original foreign keys,
  // so referential integrity checks are bypassed for the duration of the load.
  await pg.query("set local session_replication_role = replica");

  // Start from a clean slate so the copy can be re-run without duplicating rows.
  const targetTables = myTables
    .map((myTable) => pgTableByLower.get(myTable.toLowerCase()))
    .filter(Boolean);
  if (targetTables.length > 0) {
    await pg.query(
      `truncate table ${targetTables.map(quoteIdent).join(", ")} restart identity cascade`,
    );
  }

  const report = [];
  const skipped = [];

  for (const myTable of myTables) {
    const pgTable = pgTableByLower.get(myTable.toLowerCase());
    if (!pgTable) {
      skipped.push(`${myTable} (no matching PostgreSQL table)`);
      continue;
    }

    const { rows: pgColumnRows } = await pg.query(
      `select column_name, data_type, udt_name
       from information_schema.columns
       where table_schema = 'public' and table_name = $1
       order by ordinal_position`,
      [pgTable],
    );
    const pgColumnByLower = new Map(
      pgColumnRows.map((row) => [row.column_name.toLowerCase(), row]),
    );

    const [myColumnRows] = await my.query(
      `select column_name as name from information_schema.columns
       where table_schema = ? and table_name = ?
       order by ordinal_position`,
      [mysqlConfig.database, myTable],
    );

    // MySQL's information_schema keys are upper-cased, hence the aliases above.
    const myColumnByLower = new Map(
      myColumnRows.map((row) => [row.name.toLowerCase(), row.name]),
    );

    // PostgreSQL column order drives the INSERT statement, so the result is stable.
    const columns = pgColumnRows
      .filter((pgColumn) =>
        myColumnByLower.has(pgColumn.column_name.toLowerCase()),
      )
      .map((pgColumn) => ({
        pgColumn,
        myColumn: myColumnByLower.get(pgColumn.column_name.toLowerCase()),
      }));

    if (columns.length === 0) {
      skipped.push(`${myTable} (no shared columns)`);
      continue;
    }

    const [myRows] = await my.query(
      `select ${columns.map((c) => `\`${c.myColumn}\``).join(", ")} from \`${myTable}\``,
    );

    for (let i = 0; i < myRows.length; i += CHUNK_SIZE) {
      const chunk = myRows.slice(i, i + CHUNK_SIZE);
      const params = [];
      const tuples = chunk.map((row) => {
        const placeholders = columns.map((column) => {
          params.push(coerce(row[column.myColumn], column.pgColumn));
          return `$${params.length}`;
        });
        return `(${placeholders.join(", ")})`;
      });

      await pg.query(
        `insert into ${quoteIdent(pgTable)}
           (${columns.map((c) => quoteIdent(c.pgColumn.column_name)).join(", ")})
         values ${tuples.join(", ")}`,
        params,
      );
    }

    const { rows: countRows } = await pg.query(
      `select count(*)::int as count from ${quoteIdent(pgTable)}`,
    );
    report.push({
      table: pgTable,
      mysql: myRows.length,
      postgres: countRows[0].count,
    });
  }

  // Explicit primary keys do not advance the identity sequences, so realign them now.
  // Join tables (_AToB) have no `id` column and are skipped before the lookup, because
  // pg_get_serial_sequence raises instead of returning NULL for a missing column.
  for (const { table } of report) {
    const { rows: idColumns } = await pg.query(
      `select 1 from information_schema.columns
       where table_schema = 'public' and table_name = $1 and column_name = 'id'`,
      [table],
    );
    if (idColumns.length === 0) continue;

    const { rows } = await pg.query(
      `select pg_get_serial_sequence(quote_ident($1), 'id') as sequence`,
      [table],
    );
    const sequence = rows[0]?.sequence;
    if (!sequence) continue;

    const { rows: maxRows } = await pg.query(
      `select coalesce(max("id"), 0)::int as max from ${quoteIdent(table)}`,
    );
    const max = maxRows[0].max;
    await pg.query(`select setval($1, $2, $3)`, [
      sequence,
      max > 0 ? max : 1,
      max > 0,
    ]);
  }

  await pg.query("set local session_replication_role = origin");
  await pg.query("commit");

  console.log("\nCopied tables:");
  for (const row of report) {
    const ok = row.mysql === row.postgres ? "ok" : "MISMATCH";
    console.log(
      `  ${ok.padEnd(9)} ${row.table.padEnd(28)} mysql=${row.mysql} postgres=${row.postgres}`,
    );
  }
  if (skipped.length) {
    console.log("\nSkipped:");
    for (const line of skipped) console.log(`  ${line}`);
  }

  const mismatches = report.filter((row) => row.mysql !== row.postgres);
  await my.end();
  await pg.end();

  if (mismatches.length) {
    console.error(`\n${mismatches.length} table(s) did not copy cleanly.`);
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
