import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  //Next runs on edge so to prevent choking
  if (connection.isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "");

    //connection is an array
    connection.isConnected = db.connections[0].readyState;

    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.log("Database connection error", error);
    //Gracefully exit the process
    process.exit(1);
  }
}

export default dbConnect;
