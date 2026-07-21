import { db } from "./index.ts";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import {
  settings,
  packages,
  customers,
  orders,
  orderHistory,
  coupons,
  reviews,
  giftClaims,
  activityLogs
} from "./schema.ts";
import crypto from "crypto";

export class PrismaClient {
  setting = {
    findMany: async () => {
      try {
        return await db.select().from(settings);
      } catch (err) {
        console.error("Prisma setting.findMany failed:", err);
        throw err;
      }
    },
    findUnique: async (options: { where: { key: string } }) => {
      try {
        const res = await db.select().from(settings).where(eq(settings.key, options.where.key));
        return res[0] || null;
      } catch (err) {
        console.error("Prisma setting.findUnique failed:", err);
        throw err;
      }
    },
    update: async (options: { where: { key: string }; data: { value: string } }) => {
      try {
        const res = await db
          .update(settings)
          .set({ value: options.data.value })
          .where(eq(settings.key, options.where.key))
          .returning();
        return res[0];
      } catch (err) {
        console.error("Prisma setting.update failed:", err);
        throw err;
      }
    },
    upsert: async (options: {
      where: { key: string };
      update: { value: string };
      create: { key: string; value: string };
    }) => {
      try {
        const res = await db
          .insert(settings)
          .values({ key: options.create.key, value: options.create.value })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value: options.update.value }
          })
          .returning();
        return res[0];
      } catch (err) {
        console.error("Prisma setting.upsert failed:", err);
        throw err;
      }
    },
    create: async (options: { data: { key: string; value: string } }) => {
      try {
        const res = await db.insert(settings).values(options.data).returning();
        return res[0];
      } catch (err) {
        console.error("Prisma setting.create failed:", err);
        throw err;
      }
    }
  };

  package = {
    findMany: async (options?: { where?: any; orderBy?: any }) => {
      try {
        let q = db.select().from(packages);
        const conditions: any[] = [];
        if (options?.where) {
          if (options.where.isHidden !== undefined) {
            conditions.push(eq(packages.isHidden, options.where.isHidden));
          }
          if (options.where.platform !== undefined) {
            conditions.push(eq(packages.platform, options.where.platform));
          }
        }
        let queryWithWhere = conditions.length > 0 ? q.where(and(...conditions)) : q;
        
        let orderField: any = desc(packages.createdAt);
        if (options?.orderBy) {
          if (options.orderBy.sortOrder === "asc") {
            orderField = asc(packages.sortOrder);
          } else if (options.orderBy.sortOrder === "desc") {
            orderField = desc(packages.sortOrder);
          } else if (options.orderBy.createdAt === "desc") {
            orderField = desc(packages.createdAt);
          }
        }
        return await queryWithWhere.orderBy(orderField);
      } catch (err) {
        console.error("Prisma package.findMany failed:", err);
        throw err;
      }
    },
    findUnique: async (options: { where: { id: string } }) => {
      try {
        const res = await db.select().from(packages).where(eq(packages.id, options.where.id));
        return res[0] || null;
      } catch (err) {
        console.error("Prisma package.findUnique failed:", err);
        throw err;
      }
    },
    create: async (options: { data: any }) => {
      try {
        const id = options.data.id || crypto.randomUUID();
        const res = await db.insert(packages).values({ ...options.data, id }).returning();
        return res[0];
      } catch (err) {
        console.error("Prisma package.create failed:", err);
        throw err;
      }
    },
    update: async (options: { where: { id: string }; data: any }) => {
      try {
        const res = await db
          .update(packages)
          .set(options.data)
          .where(eq(packages.id, options.where.id))
          .returning();
        return res[0];
      } catch (err) {
        console.error("Prisma package.update failed:", err);
        throw err;
      }
    },
    delete: async (options: { where: { id: string } }) => {
      try {
        const res = await db.delete(packages).where(eq(packages.id, options.where.id)).returning();
        return res[0];
      } catch (err) {
        console.error("Prisma package.delete failed:", err);
        throw err;
      }
    },
    deleteMany: async () => {
      try {
        await db.delete(packages);
        return { count: 0 };
      } catch (err) {
        console.error("Prisma package.deleteMany failed:", err);
        throw err;
      }
    },
    aggregate: async (options: { _max: { sortOrder: boolean } }) => {
      try {
        const res = await db.select({ max: sql<number>`max(${packages.sortOrder})` }).from(packages);
        return { _max: { sortOrder: Number(res[0]?.max || 0) } };
      } catch (err) {
        console.error("Prisma package.aggregate failed:", err);
        throw err;
      }
    }
  };

  customer = {
    findUnique: async (options: { where: { phone: string } }) => {
      try {
        const res = await db.select().from(customers).where(eq(customers.phone, options.where.phone));
        return res[0] || null;
      } catch (err) {
        console.error("Prisma customer.findUnique failed:", err);
        throw err;
      }
    },
    create: async (options: { data: any }) => {
      try {
        const id = options.data.id || crypto.randomUUID();
        const res = await db.insert(customers).values({ ...options.data, id }).returning();
        return res[0];
      } catch (err) {
        console.error("Prisma customer.create failed:", err);
        throw err;
      }
    },
    update: async (options: { where: { phone: string }; data: any }) => {
      try {
        const res = await db
          .update(customers)
          .set(options.data)
          .where(eq(customers.phone, options.where.phone))
          .returning();
        return res[0];
      } catch (err) {
        console.error("Prisma customer.update failed:", err);
        throw err;
      }
    },
    findMany: async (options?: { include?: any; orderBy?: any }) => {
      try {
        let q = db.select().from(customers);
        let orderField = desc(customers.createdAt);
        if (options?.orderBy?.createdAt === "asc") {
          orderField = asc(customers.createdAt);
        }
        const results = await q.orderBy(orderField);

        if (options?.include?.orders) {
          const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
          return results.map((c: any) => {
            const customerOrders = allOrders.filter((o) => o.whatsappNumber === c.phone);
            return {
              ...c,
              orders: customerOrders
            };
          });
        }
        return results as any;
      } catch (err) {
        console.error("Prisma customer.findMany failed:", err);
        throw err;
      }
    },
    count: async () => {
      try {
        const res = await db.select({ count: sql<number>`count(*)` }).from(customers);
        return Number(res[0]?.count || 0);
      } catch (err) {
        console.error("Prisma customer.count failed:", err);
        throw err;
      }
    }
  };

  order = {
    findMany: async (options?: { where?: any; orderBy?: any; include?: any }) => {
      try {
        let q = db.select().from(orders);
        const conditions: any[] = [];
        if (options?.where) {
          if (options.where.whatsappNumber !== undefined) {
            conditions.push(eq(orders.whatsappNumber, options.where.whatsappNumber));
          }
          if (options.where.id !== undefined) {
            conditions.push(eq(orders.id, options.where.id));
          }
        }
        let queryWithWhere = conditions.length > 0 ? q.where(and(...conditions)) : q;
        let orderField = desc(orders.createdAt);
        if (options?.orderBy?.createdAt === "asc") {
          orderField = asc(orders.createdAt);
        }
        const results = await queryWithWhere.orderBy(orderField);

        if (options?.include?.history) {
          const allHistory = await db
            .select()
            .from(orderHistory)
            .orderBy(desc(orderHistory.createdAt));
          
          return results.map((orderItem) => {
            const hist = allHistory.filter((h) => h.orderId === orderItem.id);
            return {
              ...orderItem,
              history: hist
            };
          });
        }
        return results;
      } catch (err) {
        console.error("Prisma order.findMany failed:", err);
        throw err;
      }
    },
    findUnique: async (options: { where: { id: string } }) => {
      try {
        const res = await db.select().from(orders).where(eq(orders.id, options.where.id));
        return res[0] || null;
      } catch (err) {
        console.error("Prisma order.findUnique failed:", err);
        throw err;
      }
    },
    create: async (options: { data: any }) => {
      try {
        const id = options.data.id || crypto.randomUUID();
        const res = await db.insert(orders).values({ ...options.data, id }).returning();
        return res[0];
      } catch (err) {
        console.error("Prisma order.create failed:", err);
        throw err;
      }
    },
    update: async (options: { where: { id: string }; data: any }) => {
      try {
        const res = await db
          .update(orders)
          .set(options.data)
          .where(eq(orders.id, options.where.id))
          .returning();
        return res[0];
      } catch (err) {
        console.error("Prisma order.update failed:", err);
        throw err;
      }
    },
    count: async () => {
      try {
        const res = await db.select({ count: sql<number>`count(*)` }).from(orders);
        return Number(res[0]?.count || 0);
      } catch (err) {
        console.error("Prisma order.count failed:", err);
        throw err;
      }
    }
  };

  orderHistory = {
    create: async (options: { data: any }) => {
      try {
        const id = options.data.id || crypto.randomUUID();
        const res = await db.insert(orderHistory).values({ ...options.data, id }).returning();
        return res[0];
      } catch (err) {
        console.error("Prisma orderHistory.create failed:", err);
        throw err;
      }
    }
  };

  coupon = {
    findFirst: async (options: { where: { code: string } }) => {
      try {
        const res = await db.select().from(coupons).where(eq(coupons.code, options.where.code));
        return res[0] || null;
      } catch (err) {
        console.error("Prisma coupon.findFirst failed:", err);
        throw err;
      }
    },
    findUnique: async (options: { where: { code?: string; id?: string } }) => {
      try {
        if (options.where.code !== undefined) {
          const res = await db.select().from(coupons).where(eq(coupons.code, options.where.code));
          return res[0] || null;
        }
        if (options.where.id !== undefined) {
          const res = await db.select().from(coupons).where(eq(coupons.id, options.where.id));
          return res[0] || null;
        }
        return null;
      } catch (err) {
        console.error("Prisma coupon.findUnique failed:", err);
        throw err;
      }
    },
    findMany: async (options?: { orderBy?: any }) => {
      try {
        let q = db.select().from(coupons);
        let orderField = desc(coupons.createdAt);
        if (options?.orderBy?.createdAt === "asc") {
          orderField = asc(coupons.createdAt);
        }
        return await q.orderBy(orderField);
      } catch (err) {
        console.error("Prisma coupon.findMany failed:", err);
        throw err;
      }
    },
    create: async (options: { data: any }) => {
      try {
        const id = options.data.id || crypto.randomUUID();
        const res = await db.insert(coupons).values({ ...options.data, id }).returning();
        return res[0];
      } catch (err) {
        console.error("Prisma coupon.create failed:", err);
        throw err;
      }
    },
    update: async (options: { where: { id: string }; data: any }) => {
      try {
        const res = await db
          .update(coupons)
          .set(options.data)
          .where(eq(coupons.id, options.where.id))
          .returning();
        return res[0];
      } catch (err) {
        console.error("Prisma coupon.update failed:", err);
        throw err;
      }
    },
    delete: async (options: { where: { id: string } }) => {
      try {
        const res = await db.delete(coupons).where(eq(coupons.id, options.where.id)).returning();
        return res[0];
      } catch (err) {
        console.error("Prisma coupon.delete failed:", err);
        throw err;
      }
    },
    count: async () => {
      try {
        const res = await db.select({ count: sql<number>`count(*)` }).from(coupons);
        return Number(res[0]?.count || 0);
      } catch (err) {
        console.error("Prisma coupon.count failed:", err);
        throw err;
      }
    }
  };

  review = {
    findMany: async (options?: { where?: any; orderBy?: any }) => {
      try {
        let q = db.select().from(reviews);
        const conditions: any[] = [];
        if (options?.where) {
          if (options.where.isApproved !== undefined) {
            conditions.push(eq(reviews.isApproved, options.where.isApproved));
          }
        }
        let queryWithWhere = conditions.length > 0 ? q.where(and(...conditions)) : q;
        let orderField = desc(reviews.createdAt);
        if (options?.orderBy?.createdAt === "asc") {
          orderField = asc(reviews.createdAt);
        }
        return await queryWithWhere.orderBy(orderField);
      } catch (err) {
        console.error("Prisma review.findMany failed:", err);
        throw err;
      }
    },
    create: async (options: { data: any }) => {
      try {
        const id = options.data.id || crypto.randomUUID();
        const res = await db.insert(reviews).values({ ...options.data, id }).returning();
        return res[0];
      } catch (err) {
        console.error("Prisma review.create failed:", err);
        throw err;
      }
    },
    delete: async (options: { where: { id: string } }) => {
      try {
        const res = await db.delete(reviews).where(eq(reviews.id, options.where.id)).returning();
        return res[0];
      } catch (err) {
        console.error("Prisma review.delete failed:", err);
        throw err;
      }
    },
    count: async () => {
      try {
        const res = await db.select({ count: sql<number>`count(*)` }).from(reviews);
        return Number(res[0]?.count || 0);
      } catch (err) {
        console.error("Prisma review.count failed:", err);
        throw err;
      }
    },
    updateMany: async (options: { where: { customerName: string }; data: { customerName: string } }) => {
      try {
        const res = await db
          .update(reviews)
          .set({ customerName: options.data.customerName })
          .where(eq(reviews.customerName, options.where.customerName))
          .returning();
        return { count: res.length };
      } catch (err) {
        console.error("Prisma review.updateMany failed:", err);
        throw err;
      }
    }
  };

  giftClaim = {
    findFirst: async (options?: { where?: any; orderBy?: any }) => {
      try {
        let q = db.select().from(giftClaims);
        const conditions: any[] = [];
        if (options?.where) {
          if (options.where.ip !== undefined) {
            conditions.push(eq(giftClaims.ip, options.where.ip));
          }
        }
        let queryWithWhere = conditions.length > 0 ? q.where(and(...conditions)) : q;
        let orderField = desc(giftClaims.createdAt);
        if (options?.orderBy?.createdAt === "asc") {
          orderField = asc(giftClaims.createdAt);
        }
        const res = await queryWithWhere.orderBy(orderField);
        return res[0] || null;
      } catch (err) {
        console.error("Prisma giftClaim.findFirst failed:", err);
        throw err;
      }
    },
    create: async (options: { data: any }) => {
      try {
        const id = options.data.id || crypto.randomUUID();
        const res = await db.insert(giftClaims).values({ ...options.data, id }).returning();
        return res[0];
      } catch (err) {
        console.error("Prisma giftClaim.create failed:", err);
        throw err;
      }
    }
  };

  activityLog = {
    findMany: async (options?: { orderBy?: any; take?: number }) => {
      try {
        let q = db.select().from(activityLogs);
        let orderField = desc(activityLogs.createdAt);
        if (options?.orderBy?.createdAt === "asc") {
          orderField = asc(activityLogs.createdAt);
        }
        let queryWithOrder = q.orderBy(orderField);
        if (options?.take !== undefined) {
          return await queryWithOrder.limit(options.take);
        }
        return await queryWithOrder;
      } catch (err) {
        console.error("Prisma activityLog.findMany failed:", err);
        throw err;
      }
    },
    create: async (options: { data: any }) => {
      try {
        const id = options.data.id || crypto.randomUUID();
        const res = await db.insert(activityLogs).values({ ...options.data, id }).returning();
        return res[0];
      } catch (err) {
        console.error("Prisma activityLog.create failed:", err);
        throw err;
      }
    }
  };
}
