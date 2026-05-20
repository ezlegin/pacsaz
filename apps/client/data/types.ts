import { Dieline, DielineSettings } from "@repo/db";

export interface DielineType extends Dieline {
  settings: DielineSettings;
}
