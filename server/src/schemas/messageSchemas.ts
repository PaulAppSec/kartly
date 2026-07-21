import { z } from "zod";

export const messageSchema = z.object({
  toId: z.string().min(1).max(80),
  body: z.string().min(1).max(2000),
});

export type MessageInput = z.infer<typeof messageSchema>;
