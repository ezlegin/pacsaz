SELECT t.key, t.title, t."isRecommended", t.level,
       p.monthly, p."threeMonth", p.annual,
       f.monthly AS "dlMonthly"
FROM "Tarrif" t
LEFT JOIN "Price" p ON p."tarrifId" = t.id
LEFT JOIN "FairDownload" f ON f."tarrifId" = t.id
ORDER BY t.level;
