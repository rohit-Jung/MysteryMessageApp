import { authOptions } from "./options";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions);

//GET and POST should be in this format only
export { handler as GET, handler as POST };
