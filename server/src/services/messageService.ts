import { messageRepo } from "../data/messageRepo.js";
import { userRepo } from "../data/userRepo.js";
import { HttpError } from "../middleware/errorHandler.js";
import type { MessageInput } from "../schemas/messageSchemas.js";

interface MessageRow {
  id: string;
  body: string;
  createdAt: Date;
  from: { id: string; name: string };
  to: { id: string; name: string };
}

function toDTO(m: MessageRow) {
  return {
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    from: m.from,
    to: m.to,
  };
}

export const messageService = {
  async inbox(userId: string) {
    return (await messageRepo.listForUser(userId)).map(toDTO);
  },

  // Object-level authz: only a participant may read a message; anyone else
  // gets 404 (not 403) so IDs don't leak existence. Secure baseline for #5.
  async getById(userId: string, messageId: string) {
    const msg = await messageRepo.findById(messageId);
    if (!msg || (msg.fromId !== userId && msg.toId !== userId)) {
      throw new HttpError(404, "Message not found.");
    }
    return toDTO(msg);
  },

  async send(fromId: string, input: MessageInput) {
    if (input.toId === fromId) throw new HttpError(400, "You can't message yourself.");
    const recipient = await userRepo.findById(input.toId);
    if (!recipient) throw new HttpError(404, "Recipient not found.");
    const msg = await messageRepo.create({ fromId, toId: input.toId, body: input.body });
    return toDTO(msg);
  },
};
