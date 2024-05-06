import UserModel from "@/models/User.model";
import { Message } from "@/models/User.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  //extract data
  const { username, content } = await req.json();

  try {
    //Find the user
    const user = await UserModel.findOne({
      username,
    });

    //user not found
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

    //create the message and push to the db
    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message); //type assertion
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error occurred while sending message to user", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error sending messages to user",
      },
      {
        status: 500,
      }
    );
  }
}
