import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { User } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

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
  const userId = new mongoose.Types.ObjectId(user._id); //convert it to mongoose object id for aggregation

  try {
    //aggregation pipeline:
    //match id, unwind into each document according to message, sort according to createdAt date, group them
    const user = await UserModel.aggregate([
      { $match: { id: userId } },
      { $unwind: "messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Error getting messages from user",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Messages retrieved successfully",
        data: user[0].messages, //object returned by aggregation is an array
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error occured while getting user messages", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error getting messages from user",
      },
      {
        status: 500,
      }
    );
  }
}
