const glueSizes = {
  sm: 12,
  md: 16,
  lg: 25,
  xl: 35,
  xxl: 50,
};

export function glueMapper(widthMM: number, heightMM: number) {
  const total = widthMM + heightMM;
  const threshold = heightMM * 0.2; //20% of height

  let glue: number;

  switch (true) {
    case total < 140:
      glue = glueSizes.sm;
      break;
    case total < 250:
      glue = glueSizes.md;
      break;
    case total < 350:
      glue = glueSizes.lg;
      break;
    case total < 450:
      glue = glueSizes.xl;
      break;
    default:
      glue = glueSizes.xxl;
      break;
  }

  if (glue >= heightMM - threshold) {
    glue = heightMM / 2.5;
  }

  return glue;
}
