"use server";

import Kavenegar from "kavenegar";

const apikey = process.env.KAVENEGAR_API!;

const kavenegar = Kavenegar.KavenegarApi({
  apikey,
});

function convertPersianDigitsToEnglish(input: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return input.replace(/[۰-۹]/g, (char) => String(persianDigits.indexOf(char)));
}

// todo: handle rejection
export const sendOtpSms = async (phoneNumber: string, otp: string) => {
  try {
    kavenegar.VerifyLookup(
      {
        receptor: convertPersianDigitsToEnglish(phoneNumber),
        token: otp,
        template: "pacsaz",
      },
      function (response, status) {
        console.log(response);
        console.log(status);
      },
    );

    return { success: "Code Sent." };
  } catch (error) {
    console.error("Error Sending SMS: " + error);
    return { error: "Error Sending SMS" };
  }
};
