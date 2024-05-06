"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/Schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState(""); //for displaying messages of username uniqueness
  const [checkUsername, setCheckUsername] = useState(false); //for loading state of username uniqueness
  const [isSubmitting, setIsSubmitting] = useState(false); //for the loading state of form submission

  const debounce = useDebounceCallback(setUsername, 500); //username is set after 500 millisecond
  const { toast } = useToast();
  const router = useRouter();

  //zod Implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  //checking username
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setCheckUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get(
            `/api/username-check?username=${username}`
          );
          console.log("Response From check username: ", response); //checking data
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data?.message ?? "Error checking username"
          );
        } finally {
          setCheckUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]); //username as dependency as it is set only after 500 seconds

  //submit handler
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/signup", data);
      console.log("Post request, signup: ", response); //checking the response

      //Toast message of successful signup
      toast({
        title: "Successfully signed up",
        description: response.data.message,
        duration: 5000,
      });

      //go to verify route with username as param
      router.replace(`/verify/${username}`);
    } catch (error) {
      console.error("Error Signup", error);

      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;

      toast({
        title: "Error signing up",
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center ">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Mystery Message
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control} //pass the control
              name="username"
              render={(
                { field } //render the field
              ) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e); //pass the onchange event as it is
                        debounce(e.target.value); //since we are handling the change in event using debounce (after certain time)
                      }}
                    />
                  </FormControl>
                  {checkUsername && <Loader2 className="animate-spin" />}
                  <FormDescription
                    className={`${
                      usernameMessage === "Username is available"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {" "}
                    {usernameMessage}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 animate-spin size-4" />
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          <p>
            Already a member ?{" "}
            <Link
              href={"/signin"}
              className="text-blue-600 hover:text-blue-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
