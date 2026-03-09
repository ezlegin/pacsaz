import { getVariables } from "@repo/store/editor/variables.store";

const variableKeys = getVariables().map((v) => v.name);
export const allowedVariables = [
  "width",
  "twoWidth",
  "height",
  "twoHeight",
  "length",
  "twoLength",
  "safeOffset",
  "selfWidth",
  "selfHeight",
  ...variableKeys,
] as const;

const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function validateMathExpression(expr: string) {
  // 1️⃣ Basic allowed characters
  const allowedChars = /^[0-9a-zA-Z_+\-*/().\s]+$/;
  if (!allowedChars.test(expr)) {
    return false;
  }

  // 2️⃣ Tokenize
  const tokens = expr
    .replace(/\s+/g, "")
    .match(/[a-zA-Z_][a-zA-Z0-9_]*|\d+(\.\d+)?|[+\-*/()]?/g)
    ?.filter(Boolean);

  if (!tokens || tokens.length === 0) return false;

  // 3️⃣ Parentheses balance
  let balance = 0;
  for (const t of tokens) {
    if (t === "(") balance++;
    if (t === ")") balance--;
    if (balance < 0) return false;
  }
  if (balance !== 0) return false;

  // 4️⃣ Validate variables
  for (const token of tokens) {
    if (identifierRegex.test(token)) {
      if (!allowedVariables.includes(token as any)) {
        return false;
      }
    }
  }

  // 5️⃣ Prevent consecutive operators
  if (/[+\-*/]{2,}/.test(expr.replace(/\s+/g, ""))) {
    return false;
  }

  // 6️⃣ Cannot end with operator
  if (/[+\-*/]$/.test(expr.trim())) {
    return false;
  }

  return true;
}
