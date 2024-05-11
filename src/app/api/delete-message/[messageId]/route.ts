import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { User } from "next-auth";
import { NextResponse } from "next/server";
import UserModel from "@/models/User.model";

export async function DELETE(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  //getting message id from params
  const messageId = params.messageId;

  await dbConnect();

  //get session for user login or not ?
  const session = await getServerSession(authOptions);

  const user: User = session?.user as User;

  //If not logged in return
  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 400 }
    );
  }

  try {
    //$pull operator helps removing a document on the basis of given condition, since message is an array of mongoDB document we use it
    const updatedData = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updatedData.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Message not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message deleted",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error in delete message route", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting message",
      },
      {
        status: 500,
      }
    );
  }
}
