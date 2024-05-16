import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { User } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();

  //get the session
  const session = await getServerSession(authOptions);

  //extract the user from the session
  const user: User = session?.user as User;

  //not authenticated case
  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 400 }
    );
  }

  //check for user Id
  const userId = user._id;
  const { acceptMessages } = await req.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to toggle user accept messages status",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User accept messages status toggled successfully",
        user: updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to toggle user accept messages status",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req: Request) {
  await dbConnect();

  //get the session
  const session = await getServerSession(authOptions);

  //extract the user from the session
  const user: User = session?.user as User;

  //not authenticated case
  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 400 }
    );
  }

  //check for user Id
  const userId = user._id;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch user accept messsage status",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User accept message status fetched successfully",
        isAcceptingMessages: user.isAcceptingMessage,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error feting user accept message status", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch user accept message status",
    });
  }
}
