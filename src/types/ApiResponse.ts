import { Message, User } from "@/models/User.model";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Message[];
  user?: User;
}
