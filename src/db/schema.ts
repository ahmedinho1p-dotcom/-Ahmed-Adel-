import { relations } from "drizzle-orm";
import { pgTable, text, doublePrecision, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const packages = pgTable("packages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  platform: text("platform").notNull(), // "Facebook" | "Instagram" | "YouTube" | "Google Reviews" | "TikTok"
  followersCount: text("followers_count").notNull(),
  price: doublePrecision("price").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  description: text("description").notNull(),
  gift: text("gift"),
  badge: text("badge"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  discount: doublePrecision("discount"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  pageUrl: text("page_url").notNull(),
  packageId: text("package_id").notNull(),
  packageName: text("package_name").notNull(),
  platform: text("platform").notNull(),
  price: doublePrecision("price").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull(), // "New" | "Contacted" | "Completed" | "Cancelled"
  paymentMethod: text("payment_method"),
  paymentSender: text("payment_sender"),
  paymentAmount: doublePrecision("payment_amount"),
  paymentScreenshot: text("payment_screenshot"),
  paymentStatus: text("payment_status"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const orderHistory = pgTable("order_history", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPercent: doublePrecision("discount_percent").notNull(),
  discountType: text("discount_type").default("PERCENT").notNull(),
  discountValue: doublePrecision("discount_value").default(0.0).notNull(),
  expiresAt: timestamp("expires_at"),
  minPurchase: doublePrecision("min_purchase"),
  maxUses: integer("max_uses"),
  useCount: integer("use_count").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").default(5).notNull(),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const giftClaims = pgTable("gift_claims", {
  id: text("id").primaryKey(),
  ip: text("ip").notNull(),
  targetAccount: text("target_account").notNull(),
  giftType: text("gift_type").notNull(),
  giftQty: integer("gift_qty").notNull(),
  platform: text("platform").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  details: text("details"),
  ip: text("ip"),
  adminUser: text("admin_user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relationships
export const packagesRelations = relations(packages, ({ many }) => ({
  orders: many(orders),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  package: one(packages, {
    fields: [orders.packageId],
    references: [packages.id],
  }),
  customer: one(customers, {
    fields: [orders.whatsappNumber],
    references: [customers.phone],
  }),
  history: many(orderHistory),
}));

export const orderHistoryRelations = relations(orderHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderHistory.orderId],
    references: [orders.id],
  }),
}));
