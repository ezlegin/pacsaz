import { getVariables } from "@repo/store/editor/variables.store";

const baseVariables = [
  "width",
  "height",
  "length",
  "safeOffset",
  "selfWidth",
  "selfHeight",
] as const;

const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function validateMathExpression(expr: string) {
  const variableKeys = getVariables().map((v) => v.name);

  const allowedVariables = new Set([...baseVariables, ...variableKeys]);

  // 1. Basic allowed characters
  const allowedChars = /^[0-9a-zA-Z_+\-*/().\s]+$/;

  if (!allowedChars.test(expr)) {
    return false;
  }

  // 2. Tokenize
  const tokens = expr
    .replace(/\s+/g, "")
    .match(/[a-zA-Z_][a-zA-Z0-9_]*|\d+(\.\d+)?|[+\-*/()]?/g)
    ?.filter(Boolean);

  if (!tokens || tokens.length === 0) {
    return false;
  }

  // 3. Parentheses balance
  let balance = 0;

  for (const token of tokens) {
    if (token === "(") balance++;
    if (token === ")") balance--;

    if (balance < 0) {
      return false;
    }
  }

  if (balance !== 0) {
    return false;
  }

  // 4. Validate variables
  for (const token of tokens) {
    if (identifierRegex.test(token)) {
      if (!allowedVariables.has(token)) {
        return false;
      }
    }
  }

  // 5. Prevent consecutive operators
  if (/[+\-*/]{2,}/.test(expr.replace(/\s+/g, ""))) {
    return false;
  }

  // 6. Cannot end with operator
  if (/[+\-*/]$/.test(expr.trim())) {
    return false;
  }

  return true;
}
