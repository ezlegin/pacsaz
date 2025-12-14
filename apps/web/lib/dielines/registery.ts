import { mailerBox } from "./categories/boxes/mailer-box";
import { postalCard } from "./categories/cards/postal-card";

export const dielines = {
  "postal-card": postalCard,
  "mailer-box": mailerBox,
};

export type DielineSlug = keyof typeof dielines;
