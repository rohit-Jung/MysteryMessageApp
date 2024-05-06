import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, code } = await req.json();
    // console.log(username, code);
    //Find the user
    const user = await UserModel.findOne({
      username,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No user found with this username",
        },
        {
          status: 404,
        }
      );
    }

    //Check for code is valid and not expired
    const isValidCode = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isValidCode && isCodeNotExpired) {
      //update the verified status
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();

        return NextResponse.json(
          {
            success: true,
            message: "User verified successfully",
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          {
            success: true,
            message: "User was already verified",
          },
          {
            status: 200,
          }
        );
      }
    } else if (!isCodeNotExpired) {
      //Expiry date exceeded
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code has expired. Please signup again to receive code.",
        },
        {
          status: 400,
        }
      );
    } else {
      //Incorret verify code
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect verification code",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error: any) {
    console.error("Error verifying code", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error verifying code",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
