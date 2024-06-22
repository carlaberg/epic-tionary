import { z } from "zod";

export const UserSchema = z.object({
  username: z
    .string({
      required_error: "Username is required",
    })
    .trim()
    .min(1, "Name cannot be empty"),
  email: z
    .string({
      required_error: "Email is required",
    })
    .trim()
    .min(1, "Email cannot be empty")
    .email("Invalid email"),
  clerkId: z
    .string({
      required_error: "Username is required",
    })
    .trim()
    .min(1, "Name cannot be empty"),
});
