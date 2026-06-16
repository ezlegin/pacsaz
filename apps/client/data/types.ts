import { Dieline, DielineSettings, Image } from "@repo/db";

export interface DielineType extends Dieline {
  settings: DielineSettings;
  image: Image | null;
}

export type ServerAction =
  | {
      error: string;
      success?: undefined;
    }
  | {
      success: string;
      error?: undefined;
    };
