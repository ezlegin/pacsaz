import { Dieline, DielineSettings } from "@repo/db";

export interface DielineType extends Dieline {
  settings: DielineSettings;
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
