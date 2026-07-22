import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

// FIX (fix/auth) — VULNS.md #4: seed a strong scrypt KDF hash (format
// scrypt$<salt>$<hash>) instead of cleartext, matching server/src/lib/hashing.ts.
function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const img = (slug: string) => `https://picsum.photos/seed/kartly-${slug}/800/800`;

type SeedProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
};

const CATALOG: SeedProduct[] = [
  { id: "p01", name: "Stoneware Pour-Over Set", category: "Kitchen", price: 68.0, stock: 24, description: "Hand-thrown ceramic dripper and carafe for a slow morning ritual." },
  { id: "p02", name: "Waxed Canvas Field Tote", category: "Bags", price: 124.0, stock: 12, description: "Water-resistant everyday carry with bridle-leather straps." },
  { id: "p03", name: "Brass Desk Lamp", category: "Lighting", price: 189.0, stock: 8, description: "Articulated task lamp in solid brass with a warm dimmable bulb." },
  { id: "p04", name: "Merino Ribbed Beanie", category: "Apparel", price: 42.0, stock: 60, description: "Ethically-sourced merino wool, knitted in small batches." },
  { id: "p05", name: "Cold-Press Olive Oil 500ml", category: "Pantry", price: 28.0, stock: 45, description: "Single-estate, early-harvest, peppery finish. Bottled to order." },
  { id: "p06", name: "Walnut Cutting Board", category: "Kitchen", price: 74.0, stock: 18, description: "End-grain black walnut, food-safe oil finish, built to last decades." },
  { id: "p07", name: "Linen Apron", category: "Kitchen", price: 56.0, stock: 30, description: "Stonewashed European flax with a crossback fit and deep pockets." },
  { id: "p08", name: "Recycled Glass Tumblers (set of 4)", category: "Kitchen", price: 48.0, stock: 22, description: "Each glass is unique — spun from reclaimed bottle glass." },
  { id: "p09", name: "Leather Card Wallet", category: "Accessories", price: 39.0, stock: 40, description: "Vegetable-tanned leather that patinas beautifully with use." },
  { id: "p10", name: "Hand-Dipped Beeswax Candles", category: "Home", price: 34.0, stock: 50, description: "Slow-burning, honey-scented, a warm flame for long evenings." },
  { id: "p11", name: "Speckled Dinner Plates (set of 2)", category: "Kitchen", price: 62.0, stock: 16, description: "Reactive glaze means no two plates are quite the same." },
  { id: "p12", name: "Organic Cotton Throw", category: "Home", price: 98.0, stock: 14, description: "Loom-woven, GOTS-certified, a weighty herringbone blanket." },
  { id: "p13", name: "Cast Iron Skillet 10\"", category: "Kitchen", price: 79.0, stock: 20, description: "Pre-seasoned, smooth-milled cooking surface, lifetime pan." },
  { id: "p14", name: "Botanical Print — Fern", category: "Art", price: 45.0, stock: 25, description: "Giclée print on cotton rag paper, signed edition." },
  { id: "p15", name: "Wool Felt Slippers", category: "Apparel", price: 64.0, stock: 28, description: "Boiled-wool uppers with a natural rubber sole for indoors." },
  { id: "p16", name: "Matcha Whisk & Bowl", category: "Kitchen", price: 52.0, stock: 19, description: "Bamboo chasen and a wide ceramic chawan for daily matcha." },
  { id: "p17", name: "Amber Glass Soap Dispenser", category: "Bath", price: 26.0, stock: 55, description: "Refillable pump bottle that keeps plastic off your counter." },
  { id: "p18", name: "Handwoven Seagrass Basket", category: "Home", price: 58.0, stock: 21, description: "Fair-trade woven storage that softens a hard-edged room." },
  { id: "p19", name: "Enamel Camp Mug", category: "Outdoor", price: 22.0, stock: 70, description: "Chip-resistant enamel over steel — trail-ready, dishwasher-safe." },
  { id: "p20", name: "Cedar Shoe Trees", category: "Accessories", price: 44.0, stock: 33, description: "Aromatic cedar draws moisture and keeps leather shoes shapely." },
  { id: "p21", name: "Sourdough Starter Kit", category: "Pantry", price: 36.0, stock: 27, description: "Living starter, banneton, and lame — everything but the flour." },
  { id: "p22", name: "Mohair Weighted Eye Pillow", category: "Bath", price: 32.0, stock: 38, description: "Flax and lavender filled, a small ritual for the end of the day." },
  { id: "p23", name: "Copper Watering Can", category: "Garden", price: 88.0, stock: 11, description: "Hammered copper with a long spout for reaching back-row plants." },
  { id: "p24", name: "Terracotta Herb Planters (set of 3)", category: "Garden", price: 54.0, stock: 23, description: "Unglazed terracotta that breathes — happy roots, happy basil." },
];

async function main() {
  // Clean, FK-safe, so re-seeding is idempotent.
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      id: "u-admin",
      email: "admin@kartly.test",
      passwordHash: hashPassword("admin1234"),
      name: "Ava Admin",
      role: Role.ADMIN,
      bio: "Keeping the Kartly marketplace running.",
    },
  });

  const seller = await prisma.user.create({
    data: {
      id: "u-seller",
      email: "seller@kartly.test",
      passwordHash: hashPassword("seller1234"),
      name: "Sam Maker",
      role: Role.SELLER,
      bio: "Small-batch homewares from a workshop by the coast.",
    },
  });

  const alice = await prisma.user.create({
    data: {
      id: "u-alice",
      email: "alice@kartly.test",
      passwordHash: hashPassword("alice1234"),
      name: "Alice Nguyen",
      role: Role.CUSTOMER,
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: "u-bob",
      email: "bob@kartly.test",
      passwordHash: hashPassword("bob1234"),
      name: "Bob Ortiz",
      role: Role.CUSTOMER,
    },
  });

  const carol = await prisma.user.create({
    data: {
      id: "u-carol",
      email: "carol@kartly.test",
      passwordHash: hashPassword("carol1234"),
      name: "Carol Femi",
      role: Role.CUSTOMER,
    },
  });

  await prisma.address.createMany({
    data: [
      { id: "addr-alice", userId: alice.id, line1: "14 Marlow Street", city: "Bristol", country: "UK" },
      { id: "addr-bob", userId: bob.id, line1: "902 Pine Ave", city: "Portland", country: "USA" },
    ],
  });

  for (const p of CATALOG) {
    await prisma.product.create({
      data: {
        id: p.id,
        sellerId: seller.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: p.category,
        imageUrl: img(p.id),
      },
    });
  }

  await prisma.coupon.createMany({
    data: [
      { id: "c-welcome", code: "WELCOME10", percentOff: 10, maxUses: 1000, uses: 0 },
      { id: "c-stack", code: "STACKME", percentOff: 15, maxUses: 500, uses: 0 },
    ],
  });

  // A couple of realistic orders so the account area has history.
  const order1 = await prisma.order.create({
    data: {
      id: "o-alice-1",
      customerId: alice.id,
      total: 136.0,
      status: "DELIVERED",
      couponCode: "WELCOME10",
      items: {
        create: [
          { id: "oi-1", productId: "p01", qty: 1, unitPrice: 68.0 },
          { id: "oi-2", productId: "p06", qty: 1, unitPrice: 74.0 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      id: "o-bob-1",
      customerId: bob.id,
      total: 124.0,
      status: "PLACED",
      items: {
        create: [{ id: "oi-3", productId: "p02", qty: 1, unitPrice: 124.0 }],
      },
    },
  });

  await prisma.review.createMany({
    data: [
      { id: "rv-1", productId: "p01", authorId: alice.id, body: "The pour-over is gorgeous and pours clean. Daily use.", rating: 5 },
      { id: "rv-2", productId: "p06", authorId: bob.id, body: "Heavy, solid board. Smells faintly of walnut oil — lovely.", rating: 5 },
      { id: "rv-3", productId: "p13", authorId: carol.id, body: "Took a couple of seasons to hit its stride, but now it's my go-to.", rating: 4 },
    ],
  });

  await prisma.message.createMany({
    data: [
      { id: "m-1", fromId: alice.id, toId: seller.id, body: "Hi! Do you ship the pour-over set outside the UK?" },
      { id: "m-2", fromId: seller.id, toId: alice.id, body: "We do — Europe and North America. Thanks for asking!" },
    ],
  });

  // Silence unused-var lint while keeping the reference readable.
  void order1;

  console.log("kartly: seeded 5 users, 24 products, 2 coupons, orders, reviews, messages.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
