import { Dieline, DielineSettings, DielineImage as Image } from "@repo/db";

export interface DielineType extends Dieline {
  settings: DielineSettings;
  dielineImage: Image | null;
  modelImage: Image | null;
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
