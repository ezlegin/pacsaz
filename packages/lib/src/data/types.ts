export type UserType =
  | "student"
  | "designer"
  | "designStudio"
  | "printHouse"
  | "dielineMaker"
  | "packagingFactory"
  | "other";
export type FormType = "update" | "create";
export type Lang = "fa" | "en";
export type ServerResponse = Promise<
  | {
      success: string;
      error?: undefined;
    }
  | {
      error: string;
      success?: undefined;
    }
>;
