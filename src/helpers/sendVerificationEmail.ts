import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Mystery Message: Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return {
      success: true,
      message: "Verification Email Send Successfully ",
    };
  } catch (emailError) {
    console.log("Sending verification email failed: " + emailError);
    return {
      success: false,
      message: "Sending verification email failed: " + emailError,
    };
  }
}
