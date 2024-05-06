import { usernameValidation } from "@/Schemas/signUpSchema";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { NextResponse } from "next/server";
import { z } from "zod";

const usernameSchema = z.object({
  username: usernameValidation,
});

export async function GET(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);

    //Get the username query from the url
    const queryParam = {
      username: searchParams.get("username"),
    };

    //Validate with zod
    const result = usernameSchema.safeParse(queryParam);

    // console.log("Response from schema", response); //check of the data structure

    if (!result.success) {
      //Check for specific error in the username
      const usernameError = result.error.format().username?._errors || [];
      console.log(result.error.format().username?._errors);
      return NextResponse.json(
        {
          success: false,
          message:
            usernameError.length > 0
              ? usernameError.join(", ")
              : "Invalid query parameters",
        },
        {
          status: 400,
        }
      );
    }

    //extract the username from data
    const { username } = result.data;

    //Check for the existing username in database
    const existingUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already taken",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      status: "success",
      message: "Username is available",
    });
  } catch (error) {
    console.error("Error occurred while checking username", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while checking username",
      },
      {
        status: 500,
      }
    );
  }
}
