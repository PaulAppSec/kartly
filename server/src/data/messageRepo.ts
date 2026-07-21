import { prisma } from "./prisma.js";

const participant = {
  select: { id: true, name: true },
};

export const messageRepo = {
  // All messages the user is a party to (sent or received), newest first.
  listForUser(userId: string) {
    return prisma.message.findMany({
      where: { OR: [{ fromId: userId }, { toId: userId }] },
      orderBy: { createdAt: "desc" },
      include: { from: participant, to: participant },
    });
  },
  findById(id: string) {
    return prisma.message.findUnique({
      where: { id },
      include: { from: participant, to: participant },
    });
  },
  create(data: { fromId: string; toId: string; body: string }) {
    return prisma.message.create({ data, include: { from: participant, to: participant } });
  },
};
