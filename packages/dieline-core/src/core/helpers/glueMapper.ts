import { GLUES } from "../../data/consts";

export function glueMapper(widthMM: number, heightMM: number) {
  const total = widthMM + heightMM;
  const threshold = heightMM * 0.2; //20% of height

  let glue: number;

  switch (true) {
    case total < 140:
      glue = GLUES.sm;
      break;
    case total < 250:
      glue = GLUES.md;
      break;
    case total < 350:
      glue = GLUES.lg;
      break;
    case total < 450:
      glue = GLUES.xl;
      break;
    default:
      glue = GLUES.xxl;
      break;
  }

  if (glue >= heightMM - threshold) {
    glue = heightMM / 2.5;
  }

  return glue;
}
