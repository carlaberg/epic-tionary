import { z } from "zod";

export const MessageSchema = z.object({
  content: z
    .string({
      required_error: "Must be a string",
    })
    .trim()
    .min(1, "Name cannot be empty"),
});
