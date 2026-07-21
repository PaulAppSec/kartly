import { prisma } from "./prisma.js";

export const announcementRepo = {
  forSeller(sellerId: string) {
    return prisma.announcement.findUnique({ where: { sellerId } });
  },
  upsert(sellerId: string, template: string) {
    return prisma.announcement.upsert({
      where: { sellerId },
      update: { template },
      create: { sellerId, template },
    });
  },
};
