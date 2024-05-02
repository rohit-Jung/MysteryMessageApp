import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { signIn } from "next-auth/react";

export const authOptions: NextAuthOptions = {
  //Providing credentials
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      //Auth Js makes the form itself
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },

      //Custom authorize method - because next-auth doesn't know how to authorize the user
      async authorize(credentials: any, req): Promise<any> {
        await dbConnect();

        try {
          const user = await UserModel.findOne({
            $or: [
              {
                email: credentials.identifier,
              },
              {
                username: credentials.identifier,
              },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email address");
          }

          //Since we have isVerified field
          if (!user.isVerified) {
            throw new Error("User is not verified");
          }

          //Checking password through bcrypt
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Password is incorrect");
          }
        } catch (error: any) {
          throw new Error(error.message);
        }
      },
    }),
  ],

  //Customizing the callbacks because we have may fields in user object
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
        token.username = user.username;
      }
      return token;
    },
    //Next auth usually works in session
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
        session.user.username = token.username;
      }
      return session;
    },
  },

  //Overwritng the pages
  pages: {
    signIn: "/signin",
  },

  //providing strategy
  session: {
    strategy: "jwt", //bearer strategy [those who hold the token can access]
  },

  //Secret
  secret: process.env.NEXTAUTH_SECRET,
};
