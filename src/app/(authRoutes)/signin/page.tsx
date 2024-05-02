"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

export default function SignIn() {
  //Extract data from session
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign Out</button>
      </>
    );
  }
  return (
    <>
      Not signed In <br />
      <button onClick={() => signIn()}>Sign In</button>
    </>
  );
}
