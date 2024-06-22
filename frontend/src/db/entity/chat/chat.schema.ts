import { z } from "zod";

export const ChatSchema = z.object({
  members: z.array(
    z
      .string({
        required_error: "Must be a string",
      })
      .trim()
      .min(1, "Name cannot be empty")
  ),
});
