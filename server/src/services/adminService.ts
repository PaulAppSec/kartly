import { adminRepo } from "../data/adminRepo.js";

export const adminService = {
  counts() {
    return adminRepo.counts();
  },
  users() {
    return adminRepo.users();
  },
  orders() {
    return adminRepo.orders();
  },
  products() {
    return adminRepo.products();
  },
  coupons() {
    return adminRepo.coupons();
  },
  async report() {
    const orders = await adminRepo.orders();
    const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const placed = orders.filter((o) => o.status === "PLACED").length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    return {
      orderCount: orders.length,
      revenue,
      avgOrder: orders.length ? revenue / orders.length : 0,
      placed,
      delivered,
    };
  },
};
