import { announcementRepo } from "../data/announcementRepo.js";

export const announcementService = {
  get(sellerId: string) {
    return announcementRepo.forSeller(sellerId);
  },
  set(sellerId: string, template: string) {
    return announcementRepo.upsert(sellerId, template);
  },
};
