import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import cors from "cors";
import helmet from "helmet";

// Construct DATABASE_URL dynamically for runtime application-level PostgreSQL connection
if (!process.env.DATABASE_URL) {
  const dbUser = process.env.SQL_USER;
  const dbPassword = process.env.SQL_PASSWORD;
  const dbName = process.env.SQL_DB_NAME;
  const dbHost = process.env.SQL_HOST;

  if (dbUser && dbHost && dbName) {
    if (dbHost.startsWith("/")) {
      process.env.DATABASE_URL = `postgresql://${dbUser}:${encodeURIComponent(dbPassword || "")}@localhost/${dbName}?host=${encodeURIComponent(dbHost)}`;
    } else {
      process.env.DATABASE_URL = `postgresql://${dbUser}:${encodeURIComponent(dbPassword || "")}@${dbHost}/${dbName}`;
    }
    console.log("Dynamically constructed DATABASE_URL for application user connection.");
  }
}

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "zwdha-super-secret-key-123456";

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Daily Gift IP helper
const getClientIp = (req: any): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    } else if (Array.isArray(forwarded)) {
      return forwarded[0].trim();
    }
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
};

// In-memory simple rate limiting for public endpoints (order creation, coupon checks, reviews)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
function rateLimit(limit: number, windowMs: number, errorMsg: string) {
  return (req: any, res: any, next: any) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const limitData = rateLimits.get(ip);

    if (!limitData || now > limitData.resetAt) {
      rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (limitData.count >= limit) {
      return res.status(429).json({ error: errorMsg });
    }

    limitData.count++;
    next();
  };
}

// Authentication Middleware for Admin
function authenticateAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "غير مصرح لك بالدخول، الرجاء تسجيل الدخول أولاً" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    req.adminUsername = decoded.username;
    next();
  } catch (err) {
    return res.status(401).json({ error: "جلسة منتهية الصلاحية، يرجى تسجيل الدخول مجدداً" });
  }
}

// SMTP Email Sender Helper
async function sendOrderEmail(order: any, pack: any) {
  try {
    const settingsList = await prisma.setting.findMany();
    const settings = settingsList.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const user = settings.smtp_user;
    const pass = settings.smtp_pass;
    const host = settings.smtp_host || "smtp.gmail.com";
    const port = parseInt(settings.smtp_port || "587");
    const secure = settings.smtp_secure === "true";
    const receiver = settings.smtp_receiver || "elfashikh5@gmail.com";

    if (!user || !pass) {
      console.log("SMTP Credentials not configured. Skipping email notification.");
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const orderTime = new Date(order.createdAt).toLocaleString("ar-EG", { timeZone: "Asia/Riyadh" });

    const htmlContent = `
      <div style="direction: rtl; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; padding: 28px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 28px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold;">طلب جديد في زودها | ZWDHA</h1>
        </div>
        <p style="font-size: 16px; color: #444; line-height: 1.6;">تلقيت طلباً جديداً من متجر زودها SMM. إليك التفاصيل الكاملة للطلب:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 28px; font-size: 15px;">
          <tr style="border-bottom: 1px solid #f2f2f2;">
            <td style="padding: 12px 8px; font-weight: bold; color: #555; width: 140px;">رقم الطلب:</td>
            <td style="padding: 12px 8px; color: #222; font-family: monospace; font-size: 16px;">${order.id}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f2f2f2;">
            <td style="padding: 12px 8px; font-weight: bold; color: #555;">اسم العميل:</td>
            <td style="padding: 12px 8px; color: #222; font-weight: 500;">${order.customerName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f2f2f2;">
            <td style="padding: 12px 8px; font-weight: bold; color: #555;">رقم الواتساب:</td>
            <td style="padding: 12px 8px;">
              <a href="https://wa.me/${order.whatsappNumber}" target="_blank" style="color: #25d366; font-weight: bold; text-decoration: none;">
                ${order.whatsappNumber} 📱
              </a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f2f2f2;">
            <td style="padding: 12px 8px; font-weight: bold; color: #555;">الباقة المطلوبة:</td>
            <td style="padding: 12px 8px; color: #e1306c; font-weight: bold;">${order.packageName} (${order.platform})</td>
          </tr>
          <tr style="border-bottom: 1px solid #f2f2f2;">
            <td style="padding: 12px 8px; font-weight: bold; color: #555;">سعر الطلب:</td>
            <td style="padding: 12px 8px; color: #222; font-weight: bold;">${order.price} ${order.currency}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f2f2f2;">
            <td style="padding: 12px 8px; font-weight: bold; color: #555;">رابط الصفحة/الحساب:</td>
            <td style="padding: 12px 8px;">
              <a href="${order.pageUrl}" target="_blank" style="color: #0095f6; font-weight: 500; text-decoration: underline; word-break: break-all;">
                ${order.pageUrl}
              </a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f2f2f2;">
            <td style="padding: 12px 8px; font-weight: bold; color: #555;">وقت الطلب:</td>
            <td style="padding: 12px 8px; color: #666;">${orderTime}</td>
          </tr>
        </table>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://wa.me/${order.whatsappNumber}" target="_blank" style="background: #25d366; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3); font-size: 16px;">
            💬 تواصل مع العميل عبر واتساب فوراً
          </a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 36px 0 16px 0;" />
        <p style="font-size: 12px; color: #aaa; text-align: center; margin: 0;">هذا الإيميل تم إرساله تلقائياً من متجر زودها SMM لحماية وإدارة طلباتك.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"متجر زودها SMM" <${user}>`,
      to: receiver,
      subject: `🔔 طلب جديد من ${order.customerName} - ${order.packageName}`,
      html: htmlContent,
    });

    console.log(`Email alert sent successfully to ${receiver}`);
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
}

// -------------------------------------------------------------
// PUBLIC REST APIs
// -------------------------------------------------------------

// Fetch Packages
app.get("/api/packages", async (req, res) => {
  try {
    const showHidden = req.query.all === "true";
    let whereClause: any = { isHidden: false };

    // If request includes valid token, we can optionally show hidden
    if (showHidden && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, JWT_SECRET);
        whereClause = {}; // show everything for admin
      } catch (e) {}
    }

    const packages = await prisma.package.findMany({
      where: whereClause,
      orderBy: { sortOrder: "asc" },
    });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: "فشل تحميل الباقات" });
  }
});

// Track Order by Page/Account URL (Public)
app.post(
  "/api/orders/track",
  rateLimit(20, 60 * 1000, "تم إرسال عدد كبير من طلبات التتبع، الرجاء الانتظار دقيقة"),
  async (req, res) => {
    try {
      const { pageUrl } = req.body;
      if (!pageUrl || typeof pageUrl !== "string" || !pageUrl.trim()) {
        return res.status(400).json({ error: "الرجاء إدخال رابط الحساب أو الصفحة" });
      }

      const normalizeUrl = (url: string) => {
        let clean = url.trim().toLowerCase();
        clean = clean.replace(/^(https?:\/\/)?(www\.)?/, "");
        clean = clean.replace(/^@/, "");
        clean = clean.replace(/\/+$/, "");
        return clean;
      };

      const normalizedSearch = normalizeUrl(pageUrl);
      if (!normalizedSearch) {
        return res.status(400).json({ error: "الرجاء إدخال رابط الحساب أو الصفحة بشكل صحيح" });
      }

      // Fetch orders
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" }
      });

      // Filter to find matching page URL
      const matchedOrders = orders.filter(order => {
        const normStored = normalizeUrl(order.pageUrl);
        return normStored === normalizedSearch || 
               normStored.includes(normalizedSearch) || 
               normalizedSearch.includes(normStored);
      });

      if (matchedOrders.length === 0) {
        return res.status(404).json({ error: "لم يتم العثور على أي طلبات مرتبطة برابط هذا الحساب أو الصفحة" });
      }

      // Return the most recent matching order
      const latestOrder = matchedOrders[0];
      res.json(latestOrder);
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ أثناء تتبع الطلب" });
    }
  }
);

// Create Order (Public)
app.post(
  "/api/orders",
  rateLimit(5, 60 * 1000, "تم إرسال عدد كبير من الطلبات من هذا الجهاز، الرجاء الانتظار دقيقة"),
  async (req, res) => {
    try {
      const { 
        customerName, 
        whatsappNumber, 
        pageUrl, 
        packageId, 
        couponCode,
        paymentMethod,
        paymentSender,
        paymentAmount,
        paymentScreenshot
      } = req.body;

      if (!customerName || !whatsappNumber || !pageUrl || !packageId) {
        return res.status(400).json({ error: "جميع الحقول مطلوبة لتسجيل الطلب" });
      }

      // Input sanitization
      const cleanName = customerName.replace(/[<>]/g, "").trim();
      const cleanPhone = whatsappNumber.replace(/[^\d+]/g, "").trim();
      const cleanUrl = pageUrl.trim();

      // Find Package
      const pack = await prisma.package.findUnique({ where: { id: packageId } });
      if (!pack) {
        return res.status(404).json({ error: "الباقة المطلوبة غير متوفرة" });
      }

      // Calculate final price
      let basePrice = pack.price;
      if (pack.discount) {
        basePrice = basePrice * (1 - pack.discount / 100);
      }

      // Check Coupon
      let finalPrice = basePrice;
      let appliedCouponId = null;
      if (couponCode) {
        const coupon = await prisma.coupon.findFirst({
          where: { code: couponCode.toUpperCase().trim() },
        });
        if (coupon && coupon.active) {
          const isExpired = coupon.expiresAt && new Date() > coupon.expiresAt;
          const isMaxed = coupon.maxUses !== null && coupon.useCount >= coupon.maxUses;
          
          if (!isExpired && !isMaxed) {
            appliedCouponId = coupon.id;
            let discountAmount = 0;
            if (coupon.discountType === "FIXED") {
              discountAmount = coupon.discountValue;
            } else {
              discountAmount = basePrice * (coupon.discountPercent / 100);
            }
            finalPrice = Math.max(0, basePrice - discountAmount);
          }
        }
      }

      // Round to 2 decimals
      finalPrice = Math.round(finalPrice * 100) / 100;

      // Get Default Store Currency from Settings (or EGP)
      const currencySetting = await prisma.setting.findUnique({ where: { key: "currency_default" } });
      const currency = currencySetting ? currencySetting.value : "EGP";

      // Find or create Customer
      let customer = await prisma.customer.findUnique({ where: { phone: cleanPhone } });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            phone: cleanPhone,
            name: cleanName,
          },
        });
      } else {
        if (customer.name !== cleanName) {
          await prisma.customer.update({
            where: { phone: cleanPhone },
            data: { name: cleanName },
          });
        }
      }

      // Create Order
      const newOrder = await prisma.order.create({
        data: {
          customerName: cleanName,
          whatsappNumber: cleanPhone,
          pageUrl: cleanUrl,
          packageId: pack.id,
          packageName: pack.name,
          platform: pack.platform,
          price: finalPrice,
          currency,
          status: "New",
          paymentMethod: paymentMethod || null,
          paymentSender: paymentSender || null,
          paymentAmount: paymentAmount ? parseFloat(paymentAmount) : null,
          paymentScreenshot: paymentScreenshot || null,
          paymentStatus: paymentMethod ? "في انتظار المراجعة" : null,
        },
      });

      // Update coupon use count if one was applied
      if (appliedCouponId) {
        const couponToUpdate = await prisma.coupon.findUnique({ where: { id: appliedCouponId } });
        if (couponToUpdate) {
          const nextUseCount = couponToUpdate.useCount + 1;
          const stillActive = couponToUpdate.maxUses !== null && nextUseCount >= couponToUpdate.maxUses ? false : couponToUpdate.active;
          await prisma.coupon.update({
            where: { id: appliedCouponId },
            data: {
              useCount: nextUseCount,
              active: stillActive
            }
          });
        }
      }

      // Create Initial Order History
      await prisma.orderHistory.create({
        data: {
          orderId: newOrder.id,
          status: "New",
          notes: paymentMethod 
            ? `تم تسجيل الطلب وإرفاق إثبات الدفع عن طريق (${paymentMethod}) وهو بانتظار المراجعة من قبل الإدارة.`
            : "تم تسجيل الطلب بنجاح وهو بانتظار التواصل والتنفيذ.",
        },
      });

      // Create Security Activity Log
      await prisma.activityLog.create({
        data: {
          action: "ORDER_CREATE",
          details: `تم إنشاء طلب جديد برقم ${newOrder.id} للعميل ${cleanName} برقم هاتف ${cleanPhone}`,
          ip: getClientIp(req),
        },
      });

      // Increment stats
      const statsCompletedStr = await prisma.setting.findUnique({ where: { key: "stat_completed_orders" } });
      if (statsCompletedStr) {
        const currentCount = parseInt(statsCompletedStr.value) || 33567;
        await prisma.setting.update({
          where: { key: "stat_completed_orders" },
          data: { value: (currentCount + 1).toString() },
        });
      }

      // Dynamic unique coupon generation for this customer's NEXT purchase
      // Get all packages of same platform (sorted by sortOrder)
      const platformPackages = await prisma.package.findMany({
        where: { platform: pack.platform, isHidden: false },
        orderBy: { sortOrder: "asc" }
      });

      // Find current package rank index
      const packageIndex = platformPackages.findIndex(p => p.id === pack.id);
      const tierIndex = packageIndex !== -1 ? packageIndex + 1 : 1;

      // Fetch dynamic step discount from store settings (defaults to 50)
      const couponStepSetting = await prisma.setting.findUnique({ where: { key: "coupon_discount_step" } });
      const couponStepAmount = couponStepSetting ? parseFloat(couponStepSetting.value) || 50 : 50;
      const couponValue = tierIndex * couponStepAmount; // Dynamic EGP per grade level

      // Generate a highly secure unique code
      const generateUniqueCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let resCode = "";
        for (let i = 0; i < 6; i++) {
          resCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `ZWDHA-${resCode}`;
      };

      let uniqueCouponCode = generateUniqueCode();
      let exists = await prisma.coupon.findUnique({ where: { code: uniqueCouponCode } });
      while (exists) {
        uniqueCouponCode = generateUniqueCode();
        exists = await prisma.coupon.findUnique({ where: { code: uniqueCouponCode } });
      }

      const generatedCoupon = await prisma.coupon.create({
        data: {
          code: uniqueCouponCode,
          discountType: "FIXED",
          discountValue: couponValue,
          discountPercent: 0,
          maxUses: 1,
          active: true,
          expiresAt: null // Stay forever active until they use it once
        }
      });

      // Trigger Email Notification (Non-blocking)
      sendOrderEmail(newOrder, pack);

      const responseMessage = paymentMethod 
        ? "تم استلام طلبك وإيصال الدفع بنجاح. سيقوم فريقنا بمراجعة عملية الدفع، وسيبدأ تنفيذ طلبك فور التأكد من عملية الدفع."
        : "تم تسجيل طلبك بنجاح! سيقوم فريق الدعم الفني بالتواصل معك عبر الواتساب لإكمال الطلب.";

      res.status(201).json({
        success: true,
        message: responseMessage,
        order: newOrder,
        generatedCoupon,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "حدث خطأ أثناء تسجيل طلبك، الرجاء المحاولة مرة أخرى" });
    }
  }
);

// Validate Coupon (Public)
app.post("/api/coupons/validate", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "يرجى إدخال كود الخصم" });
    }
    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return res.status(404).json({ error: "كود الخصم غير موجود" });
    }

    if (!coupon.active) {
      return res.status(400).json({ error: "عذراً، هذا الكوبون غير نشط حالياً" });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ error: "عذراً، هذا الكوبون منتهي الصلاحية" });
    }

    if (coupon.maxUses !== null && coupon.useCount >= coupon.maxUses) {
      return res.status(400).json({ error: "عذراً، تم استخدام هذا الكوبون لعدد المرات الأقصى المسموح به" });
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountPercent: coupon.discountPercent,
    });
  } catch (error) {
    res.status(500).json({ error: "فشل التحقق من كود الخصم" });
  }
});

// Daily Gift IP helper is now hoisted to the top

// GET /api/daily-gift/status
app.get("/api/daily-gift/status", async (req, res) => {
  try {
    const ip = getClientIp(req);
    
    // Fetch gift settings
    const settingsList = await prisma.setting.findMany();
    const settings = settingsList.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const giftType = settings.daily_gift_type || "لايك";
    const giftQty = parseInt(settings.daily_gift_qty || "50");
    const giftPlatform = settings.daily_gift_platform || "Instagram";
    const giftActive = settings.daily_gift_active !== "false";

    const giftConfig = {
      type: giftType,
      qty: giftQty,
      platform: giftPlatform,
      active: giftActive
    };

    // Find latest claim by this IP
    const lastClaim = await prisma.giftClaim.findFirst({
      where: {
        ip: ip
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (lastClaim) {
      const cooldownHours = parseInt(settings.daily_gift_cooldown_hours || "24");
      const cooldownMinutes = parseInt(settings.daily_gift_cooldown_minutes || "0");
      const cooldownMs = ((cooldownHours * 60) + cooldownMinutes) * 60 * 1000;
      const elapsed = Date.now() - lastClaim.createdAt.getTime();

      if (elapsed < cooldownMs) {
        const timeLeftMs = cooldownMs - elapsed;
        const timeLeftSeconds = Math.max(0, Math.ceil(timeLeftMs / 1000));
        return res.json({
          canClaim: false,
          timeLeftSeconds,
          giftConfig,
          lastClaim
        });
      }
    }

    res.json({
      canClaim: true,
      timeLeftSeconds: 0,
      giftConfig
    });
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء فحص حالة الهدية اليومية" });
  }
});

// POST /api/daily-gift/claim
app.post("/api/daily-gift/claim", async (req, res) => {
  try {
    const ip = getClientIp(req);
    const { targetAccount } = req.body;

    if (!targetAccount || typeof targetAccount !== "string" || !targetAccount.trim()) {
      return res.status(400).json({ error: "الرجاء إدخال رابط الحساب أو اسم المستخدم لتلقي الهدية" });
    }

    // Fetch gift settings
    const settingsList = await prisma.setting.findMany();
    const settings = settingsList.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const giftActive = settings.daily_gift_active !== "false";
    if (!giftActive) {
      return res.status(400).json({ error: "الهدية اليومية المجانية غير مفعلة حالياً من قبل الإدارة" });
    }

    const giftType = settings.daily_gift_type || "لايك";
    const giftQty = parseInt(settings.daily_gift_qty || "50");
    const giftPlatform = settings.daily_gift_platform || "Instagram";

    // Double check claiming window
    const lastClaim = await prisma.giftClaim.findFirst({
      where: {
        ip: ip
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (lastClaim) {
      const cooldownHours = parseInt(settings.daily_gift_cooldown_hours || "24");
      const cooldownMinutes = parseInt(settings.daily_gift_cooldown_minutes || "0");
      const cooldownMs = ((cooldownHours * 60) + cooldownMinutes) * 60 * 1000;
      const elapsed = Date.now() - lastClaim.createdAt.getTime();

      if (elapsed < cooldownMs) {
        const timeLeftMs = cooldownMs - elapsed;
        const timeLeftSeconds = Math.max(0, Math.ceil(timeLeftMs / 1000));
        return res.status(400).json({
          error: "عذراً، لقد قمت باستلام الهدية المجانية بالفعل! يرجى الانتظار حتى انتهاء المدة المحددة.",
          timeLeftSeconds
        });
      }
    }

    // Create a new claim
    const claim = await prisma.giftClaim.create({
      data: {
        ip: ip,
        targetAccount: targetAccount.trim(),
        giftType: giftType,
        giftQty: giftQty,
        platform: giftPlatform
      }
    });

    res.json({
      success: true,
      message: "تم طلب الهدية المجانية بنجاح! جاري تنفيذ الهدية لحسابك خلال دقائق معدودة.",
      claim
    });
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء طلب الهدية اليومية" });
  }
});


// Fetch Customer Reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "فشل تحميل التقييمات" });
  }
});

// Submit Review (Public)
app.post(
  "/api/reviews",
  rateLimit(2, 5 * 60 * 1000, "يمكنك إرسال تقييم واحد كل 5 دقائق"),
  async (req, res) => {
    try {
      const { customerName, rating, content } = req.body;
      if (!customerName || !rating || !content) {
        return res.status(400).json({ error: "جميع الحقول مطلوبة لإضافة تقييمك" });
      }

      const cleanName = customerName.replace(/[<>]/g, "").trim();
      const cleanContent = content.replace(/[<>]/g, "").trim();
      const numRating = Math.max(1, Math.min(5, parseInt(rating) || 5));

      const newReview = await prisma.review.create({
        data: {
          customerName: cleanName,
          rating: numRating,
          content: cleanContent,
          isApproved: true, // Default to approved so users see it, admin can delete
        },
      });

      // Update counter
      const statsReviewsStr = await prisma.setting.findUnique({ where: { key: "stat_customer_reviews" } });
      if (statsReviewsStr) {
        const currentCount = parseInt(statsReviewsStr.value) || 8742;
        await prisma.setting.update({
          where: { key: "stat_customer_reviews" },
          data: { value: (currentCount + 1).toString() },
        });
      }

      res.status(201).json({
        success: true,
        message: "شكراً لتقييمك الرائع! تم نشر تقييمك بنجاح.",
        review: newReview,
      });
    } catch (error) {
      res.status(500).json({ error: "فشل نشر التقييم" });
    }
  }
);

// Fetch Public Settings
app.get("/api/settings", async (req, res) => {
  try {
    const settingsList = await prisma.setting.findMany();
    const settingsMap = settingsList.reduce((acc: any, curr) => {
      // Exclude sensitive SMTP password from public output
      if (curr.key !== "smtp_pass") {
        acc[curr.key] = curr.value;
      }
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: "فشل تحميل إعدادات المتجر" });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED APIs (Require authenticateAdmin)
// -------------------------------------------------------------

// Admin Auth Status check
app.get("/api/admin/me", authenticateAdmin, (req: any, res) => {
  res.json({ authenticated: true, username: req.adminUsername });
});

// Admin Login
app.post(
  "/api/admin/login",
  rateLimit(5, 5 * 60 * 1000, "محاولات تسجيل دخول كثيرة خاطئة، يرجى المحاولة بعد 5 دقائق"),
  async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
      }

      const dbUsernameSetting = await prisma.setting.findUnique({ where: { key: "admin_username" } });
      const dbPasswordSetting = await prisma.setting.findUnique({ where: { key: "admin_password" } });

      const adminUser = dbUsernameSetting?.value || "admin";
      // Fallback hash of 'password123' if setting not created yet
      const defaultHash = await bcrypt.hash("password123", 10);
      const adminPassHash = dbPasswordSetting?.value || defaultHash;

      if (username !== adminUser) {
        return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      const isMatch = await bcrypt.compare(password, adminPassHash);
      if (!isMatch) {
        return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      const token = jwt.sign({ username: adminUser }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, username: adminUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "فشل تسجيل الدخول" });
    }
  }
);

// Admin Change Password
app.post("/api/admin/change-password", authenticateAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "يجب أن تكون كلمة المرور الجديدة مكونة من 6 خانات على الأقل" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.setting.upsert({
      where: { key: "admin_password" },
      update: { value: hashed },
      create: { key: "admin_password", value: hashed },
    });

    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error) {
    res.status(500).json({ error: "فشل تغيير كلمة المرور" });
  }
});

// Admin Packages API
app.post("/api/packages", authenticateAdmin, async (req, res) => {
  try {
    const { name, platform, followersCount, price, deliveryTime, description, gift, badge, isFeatured, isHidden } = req.body;
    const maxOrder = await prisma.package.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder || 0) + 1;

    const newPackage = await prisma.package.create({
      data: {
        name,
        platform,
        followersCount: followersCount.toString(),
        price: parseFloat(price) || 0,
        deliveryTime,
        description,
        gift,
        badge,
        isFeatured: !!isFeatured,
        isHidden: !!isHidden,
        sortOrder: nextOrder,
      },
    });
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(500).json({ error: "فشل إضافة الباقة" });
  }
});

app.put("/api/packages/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, platform, followersCount, price, deliveryTime, description, gift, badge, isFeatured, isHidden, discount } = req.body;

    const updated = await prisma.package.update({
      where: { id },
      data: {
        name,
        platform,
        followersCount: followersCount?.toString(),
        price: parseFloat(price) || 0,
        deliveryTime,
        description,
        gift,
        badge,
        isFeatured: !!isFeatured,
        isHidden: !!isHidden,
        discount: discount !== undefined ? parseFloat(discount) : null,
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "فشل تعديل الباقة" });
  }
});

app.delete("/api/packages/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.package.delete({ where: { id } });
    res.json({ success: true, message: "تم حذف الباقة بنجاح" });
  } catch (error) {
    res.status(500).json({ error: "فشل حذف الباقة" });
  }
});

// Reorder Packages (Drag and Drop / Up and Down sorting)
app.post("/api/packages/reorder", authenticateAdmin, async (req, res) => {
  try {
    const { packageIds } = req.body; // array of package ids in correct order
    if (!packageIds || !Array.isArray(packageIds)) {
      return res.status(400).json({ error: "تنسيق مصفوفة الترتيب غير صالح" });
    }

    for (let i = 0; i < packageIds.length; i++) {
      await prisma.package.update({
        where: { id: packageIds[i] },
        data: { sortOrder: i },
      });
    }

    res.json({ success: true, message: "تم حفظ الترتيب الجديد بنجاح" });
  } catch (error) {
    res.status(500).json({ error: "فشل تحديث الترتيب" });
  }
});

// Admin Orders API
app.get("/api/orders", authenticateAdmin, async (req: any, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        history: {
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "فشل تحميل قائمة الطلبات" });
  }
});

app.patch("/api/orders/:id/status", authenticateAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // New | Contacted | Completed | Cancelled
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // Save order history log
    await prisma.orderHistory.create({
      data: {
        orderId: id,
        status,
        notes: notes || `تم تعديل حالة الطلب إلى: ${status}`,
      },
    });

    // Save activity log
    await prisma.activityLog.create({
      data: {
        action: "ORDER_STATUS_UPDATE",
        details: `تم تعديل حالة الطلب ${id} إلى ${status}`,
        adminUser: req.adminUsername,
        ip: getClientIp(req),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "فشل تحديث حالة الطلب" });
  }
});

app.patch("/api/orders/:id/payment", authenticateAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, internalNotes } = req.body;
    
    const dataToUpdate: any = { 
      paymentStatus,
      internalNotes,
    };

    if (paymentStatus === "مدفوع" || paymentStatus === "مقبول" || paymentStatus === "تم قبول الدفع" || paymentStatus === "مرفوض" || paymentStatus === "تم رفض الدفع") {
      dataToUpdate.reviewedAt = new Date();
    }

    const updated = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
    });

    // Save order history log
    await prisma.orderHistory.create({
      data: {
        orderId: id,
        status: updated.status,
        notes: `مراجعة الدفع: حالة الدفع الجديدة هي (${paymentStatus || "غير محدد"}) - ملاحظات الإدارة: ${internalNotes || "لا يوجد"}`,
      },
    });

    // Save activity log
    await prisma.activityLog.create({
      data: {
        action: "PAYMENT_REVIEW",
        details: `تمت مراجعة دفع الطلب ${id} وتعيين الحالة إلى ${paymentStatus}`,
        adminUser: req.adminUsername,
        ip: getClientIp(req),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "فشل تحديث بيانات الدفع للطلب" });
  }
});

// Admin Coupons API
app.get("/api/coupons", authenticateAdmin, async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: "فشل تحميل كوبونات الخصم" });
  }
});

app.post("/api/coupons", authenticateAdmin, async (req, res) => {
  try {
    const { code, discountPercent, discountType, discountValue, expiresAt, minPurchase, maxUses, active } = req.body;
    if (!code) {
      return res.status(400).json({ error: "كود الخصم مطلوب" });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return res.status(400).json({ error: "هذا الكود متواجد بالفعل" });
    }

    // Default percent and value mapping for backward/forward compatibility
    const value = discountValue !== undefined ? parseFloat(discountValue) : (discountPercent !== undefined ? parseFloat(discountPercent) : 0);
    const legacyPercent = discountType === "FIXED" ? 0 : value;

    const newCoupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountPercent: legacyPercent,
        discountType: discountType || "PERCENT",
        discountValue: value,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        active: active !== undefined ? !!active : true,
      },
    });
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ error: "فشل إنشاء كوبون الخصم" });
  }
});

app.delete("/api/coupons/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    res.json({ success: true, message: "تم حذف الكوبون بنجاح" });
  } catch (error) {
    res.status(500).json({ error: "فشل حذف الكوبون" });
  }
});

// Admin Reviews API (delete review)
app.delete("/api/reviews/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    res.json({ success: true, message: "تم حذف التقييم بنجاح" });
  } catch (error) {
    res.status(500).json({ error: "فشل حذف التقييم" });
  }
});

// Admin Save Settings
app.post("/api/settings", authenticateAdmin, async (req, res) => {
  try {
    const settings = req.body; // Key-value object
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: value as string },
        create: { key, value: value as string },
      });
    }
    res.json({ success: true, message: "تم حفظ الإعدادات بنجاح" });
  } catch (error) {
    res.status(500).json({ error: "فشل حفظ الإعدادات" });
  }
});

// Admin Dashboard Stats endpoint
app.get("/api/stats", authenticateAdmin, async (req: any, res) => {
  try {
    const allOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    const customersCount = await prisma.customer.count();
    const allPackages = await prisma.package.findMany();

    // Grouping orders by status
    const statusCounts = allOrders.reduce((acc: any, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    // Total revenue from completed orders (mektamel or completed)
    const completedStatuses = ["Completed", "مكتمل", "تم قبول الدفع"];
    const totalRevenue = allOrders
      .filter((o) => completedStatuses.includes(o.status))
      .reduce((sum, o) => sum + o.price, 0);

    // Platform distributions
    const platforms = allOrders.reduce((acc: any, curr) => {
      acc[curr.platform] = (acc[curr.platform] || 0) + 1;
      return acc;
    }, {});

    // Top Packages
    const packageCounts = allOrders.reduce((acc: any, curr) => {
      acc[curr.packageName] = (acc[curr.packageName] || 0) + 1;
      return acc;
    }, {});
    const topServices = Object.entries(packageCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    // Chart Stats (Daily, Weekly, Monthly)
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Last 7 days daily stats
    const dailyStats = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now.getTime() - i * oneDay);
      const label = d.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric" });
      const dayOrders = allOrders.filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate.toDateString() === d.toDateString();
      });
      return {
        label,
        count: dayOrders.length,
        revenue: dayOrders.filter(o => completedStatuses.includes(o.status)).reduce((sum, o) => sum + o.price, 0)
      };
    }).reverse();

    // Last 4 weeks weekly stats
    const weeklyStats = Array.from({ length: 4 }).map((_, i) => {
      const start = new Date(now.getTime() - (i + 1) * 7 * oneDay);
      const end = new Date(now.getTime() - i * 7 * oneDay);
      const label = `الأسبوع ${i + 1}`;
      const weekOrders = allOrders.filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate >= start && oDate < end;
      });
      return {
        label,
        count: weekOrders.length,
        revenue: weekOrders.filter(o => completedStatuses.includes(o.status)).reduce((sum, o) => sum + o.price, 0)
      };
    }).reverse();

    // Last 6 months monthly stats
    const monthlyStats = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("ar-EG", { month: "long" });
      const monthOrders = allOrders.filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate.getMonth() === d.getMonth() && oDate.getFullYear() === d.getFullYear();
      });
      return {
        label,
        count: monthOrders.length,
        revenue: monthOrders.filter(o => completedStatuses.includes(o.status)).reduce((sum, o) => sum + o.price, 0)
      };
    }).reverse();

    res.json({
      totalOrders: allOrders.length,
      statusNew: statusCounts["New"] || statusCounts["جديد"] || 0,
      statusInExecution: statusCounts["قيد التنفيذ"] || statusCounts["In Progress"] || 0,
      statusCompleted: statusCounts["Completed"] || statusCounts["مكتمل"] || 0,
      statusCancelled: statusCounts["Cancelled"] || statusCounts["ملغي"] || 0,
      statusWaitingPayment: statusCounts["بانتظار الدفع"] || 0,
      statusProofUploaded: statusCounts["تم رفع إثبات الدفع"] || 0,
      statusPaymentAccepted: statusCounts["تم قبول الدفع"] || 0,
      statusPaymentRejected: statusCounts["تم رفض الدفع"] || 0,
      statusRefunded: statusCounts["مسترجع"] || 0,
      totalRevenue,
      customersCount,
      totalPackages: allPackages.length,
      platforms,
      topServices,
      dailyStats,
      weeklyStats,
      monthlyStats,
      recentOrders: allOrders.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ error: "فشل تجميع الإحصائيات" });
  }
});

// Admin Customers Management API
app.get("/api/admin/customers", authenticateAdmin, async (req: any, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          select: {
            id: true,
            packageName: true,
            platform: true,
            price: true,
            currency: true,
            status: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const result = customers.map(c => {
      const totalSpend = c.orders.reduce((sum, o) => sum + o.price, 0);
      const completedOrdersCount = c.orders.filter(o => ["Completed", "مكتمل", "تم قبول الدفع"].includes(o.status)).length;
      const lastOrder = c.orders[0] || null;

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        createdAt: c.createdAt,
        totalOrdersCount: c.orders.length,
        completedOrdersCount,
        totalSpend,
        lastOrder,
        orders: c.orders,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "فشل تحميل قائمة العملاء" });
  }
});

// Admin Security Activity Logs API
app.get("/api/admin/activity-logs", authenticateAdmin, async (req: any, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "فشل تحميل سجل النشاطات" });
  }
});

// Admin Send Test Email API
app.post("/api/admin/send-test-email", authenticateAdmin, async (req: any, res) => {
  try {
    const { host, port, user, pass, secure, senderName, senderEmail, receiver } = req.body;
    
    if (!host || !port || !user || !pass || !receiver) {
      return res.status(400).json({ error: "جميع بيانات SMTP والبريد المستلم مطلوبة لتجربة الإرسال" });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: secure === "true" || secure === true,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"${senderName || "متجر زودها SMM"}" <${senderEmail || user}>`,
      to: receiver,
      subject: "📧 بريد تجريبي من لوحة تحكم زودها",
      html: `
        <div style="direction: rtl; font-family: sans-serif; text-align: right; padding: 20px;">
          <h2 style="color: #4f46e5;">تهانينا! نظام الإيميلات يعمل بنجاح 🎉</h2>
          <p>تم إرسال هذا البريد الإلكتروني لتأكيد صحة إعدادات SMTP الخاصة بمتجر زودها.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">هذه الرسالة تلقائية، يرجى عدم الرد عليها.</p>
        </div>
      `,
    });

    // Log the test email activity
    await prisma.activityLog.create({
      data: {
        action: "TEST_EMAIL",
        details: `تم إرسال إيميل تجريبي بنجاح إلى ${receiver}`,
        adminUser: req.adminUsername,
        ip: getClientIp(req),
      },
    });

    res.json({ success: true, message: "تم إرسال البريد الإلكتروني التجريبي بنجاح!" });
  } catch (error: any) {
    console.error("Test email failed:", error);
    res.status(500).json({ error: `فشل إرسال البريد التجريبي: ${error.message}` });
  }
});

// -------------------------------------------------------------
// VITE FRONTEND SERVICE & AUTO-SEEDING ON BOOT
// -------------------------------------------------------------

async function initializeApp() {
  // Overwrite or create requested admin credentials
  const admin_user = "ahmedinho";
  const admin_pass = await bcrypt.hash("Ahmed199#", 10);
  await prisma.setting.upsert({
    where: { key: "admin_username" },
    update: { value: admin_user },
    create: { key: "admin_username", value: admin_user },
  });
  await prisma.setting.upsert({
    where: { key: "admin_password" },
    update: { value: admin_pass },
    create: { key: "admin_password", value: admin_pass },
  });

  // Ensure default stats and settings exist
  const defaultSettings = [
    { key: "currency_default", value: "EGP" },
    { key: "rate_sar", value: "13.0" },
    { key: "rate_usd", value: "49.0" },
    { key: "stat_completed_orders", value: "33567" },
    { key: "stat_customer_reviews", value: "8742" },
    { key: "stat_average_rating", value: "4.9" },
    { key: "smtp_host", value: "smtp.gmail.com" },
    { key: "smtp_port", value: "587" },
    { key: "smtp_user", value: "" },
    { key: "smtp_pass", value: "" },
    { key: "smtp_secure", value: "false" },
    { key: "smtp_receiver", value: "elfashikh5@gmail.com" },
    { key: "vodafone_cash_number", value: "01124656914" },
    { key: "orange_cash_number", value: "01124656914" },
    { key: "etisalat_cash_number", value: "01124656914" },
    { key: "we_pay_number", value: "01124656914" },
    { key: "instapay_number", value: "01558676497" },
    { key: "daily_gift_type", value: "لايك" },
    { key: "daily_gift_qty", value: "50" },
    { key: "daily_gift_platform", value: "Instagram" },
    { key: "daily_gift_active", value: "true" },
    { key: "daily_gift_cooldown_hours", value: "24" },
    { key: "daily_gift_cooldown_minutes", value: "0" },
    { key: "whatsapp_number", value: "01124656914" },
  ];

  for (const setting of defaultSettings) {
    const existing = await prisma.setting.findUnique({ where: { key: setting.key } });
    if (!existing) {
      await prisma.setting.create({ data: setting });
    }
  }

  // Seed default Packages (always clear and recreate to ensure premium updates)
  await prisma.package.deleteMany();
  
  const defaultPackages = [
    // Instagram (5 packages)
    {
      name: "الباقة الفضية",
      platform: "Instagram",
      followersCount: "1,000",
      price: 150.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "زيادة ثابتة بجودة عالية مع تعويض مجاني لأي نقص، وخدمة آمنة تمامًا على حسابك.",
      gift: "كوبون خصم 10% على طلبك القادم تلقائياً!",
      badge: "Popular",
      isFeatured: false,
      sortOrder: 0,
    },
    {
      name: "الباقة الذهبية",
      platform: "Instagram",
      followersCount: "5,000",
      price: 650.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "خدمة احترافية تمنح حسابك مظهرًا أقوى مع تعويض دائم لأي نقص لضمان أفضل تجربة.",
      gift: "500 لايك إضافي مجاناً كهدية!",
      badge: "Best Seller",
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: "الباقة البلاتينية",
      platform: "Instagram",
      followersCount: "10,000",
      price: 1200.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "نتائج مستقرة بجودة ممتازة مع تعويض مدى الحياة، مصممة لتعزيز ظهور حسابك بشكل احترافي.",
      gift: "1000 لايك مجاني على منشوراتك القديمة",
      badge: "Premium",
      isFeatured: false,
      sortOrder: 2,
    },
    {
      name: "الباقة الماسية",
      platform: "Instagram",
      followersCount: "25,000",
      price: 2800.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "خدمة موثوقة وآمنة مع تعويض دائم لأي نقص، لتمنح حسابك حضورًا أقوى وثقة أكبر.",
      gift: "دعم فني خاص ذو أولوية فائقة",
      badge: "Premium",
      isFeatured: false,
      sortOrder: 3,
    },
    {
      name: "باقة النخبة",
      platform: "Instagram",
      followersCount: "50,000",
      price: 5000.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "تعزيز احترافي لحسابك مع جودة عالية وتعويض مجاني مدى الحياة لأي نقص، مع الحفاظ على أمان الحساب.",
      gift: "استشارة مجانية بالكامل لنمو حسابك وتسويقه",
      badge: "VIP",
      isFeatured: true,
      sortOrder: 4,
    },

    // Facebook (5 packages)
    {
      name: "الباقة الفضية",
      platform: "Facebook",
      followersCount: "1,000",
      price: 180.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "زيادة ثابتة بجودة عالية مع تعويض مجاني لأي نقص، وخدمة آمنة تمامًا على حسابك.",
      gift: "تحليل وتدقيق الصفحة مجاناً من خبيرنا",
      badge: "Popular",
      isFeatured: false,
      sortOrder: 5,
    },
    {
      name: "الباقة الذهبية",
      platform: "Facebook",
      followersCount: "5,000",
      price: 800.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "خدمة احترافية تمنح حسابك مظهرًا أقوى مع تعويض دائم لأي نقص لضمان أفضل تجربة.",
      gift: "تفاعل ونشاط إضافي مجاني للمنشورات",
      badge: "Best Seller",
      isFeatured: true,
      sortOrder: 6,
    },
    {
      name: "الباقة البلاتينية",
      platform: "Facebook",
      followersCount: "10,000",
      price: 1400.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "نتائج مستقرة بجودة ممتازة مع تعويض مدى الحياة، مصممة لتعزيز ظهور حسابك بشكل احترافي.",
      gift: "1000 تفاعل إضافي مجاني تماماً على آخر المنشورات",
      badge: "Premium",
      isFeatured: false,
      sortOrder: 7,
    },
    {
      name: "الباقة الماسية",
      platform: "Facebook",
      followersCount: "25,000",
      price: 3200.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "خدمة موثوقة وآمنة مع تعويض دائم لأي نقص, لتمنح حسابك حضورًا أقوى وثقة أكبر.",
      gift: "خطة مجانية لزيادة تفاعل صفحتك",
      badge: "Premium",
      isFeatured: false,
      sortOrder: 8,
    },
    {
      name: "باقة النخبة",
      platform: "Facebook",
      followersCount: "50,000",
      price: 6000.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "تعزيز احترافي لحسابك مع جودة عالية وتعويض مجاني مدى الحياة لأي نقص، مع الحفاظ على أمان الحساب.",
      gift: "حملة إعلانية تجريبية مجاناً لزيادة الانتشار",
      badge: "VIP",
      isFeatured: true,
      sortOrder: 9,
    },

    // YouTube (5 packages)
    {
      name: "الباقة الفضية",
      platform: "YouTube",
      followersCount: "1,000",
      price: 800.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "زيادة ثابتة بجودة عالية مع تعويض مجاني لأي نقص، وخدمة آمنة تمامًا على حسابك.",
      gift: "استشارة مجانية لتحسين سيو القناة والكلمات الدلالية",
      badge: "Popular",
      isFeatured: false,
      sortOrder: 10,
    },
    {
      name: "الباقة الذهبية",
      platform: "YouTube",
      followersCount: "2,500",
      price: 1500.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "خدمة احترافية تمنح حسابك مظهرًا أقوى مع تعويض دائم لأي نقص لضمان أفضل تجربة.",
      gift: "كتابة وصف احترافي لقناتك مجاناً لزيادة الأرشفة",
      badge: "Best Seller",
      isFeatured: true,
      sortOrder: 11,
    },
    {
      name: "الباقة البلاتينية",
      platform: "YouTube",
      followersCount: "5,000",
      price: 2200.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "نتائج مستقرة بجودة ممتازة مع تعويض مدى الحياة، مصممة لتعزيز ظهور حسابك بشكل احترافي.",
      gift: "ضمان تعويض مجاني ممتد لأي نقص",
      badge: "Premium",
      isFeatured: false,
      sortOrder: 12,
    },
    {
      name: "الباقة الماسية",
      platform: "YouTube",
      followersCount: "10,000",
      price: 4200.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "خدمة موثوقة وآمنة مع تعويض دائم لأي نقص، لتمنح حسابك حضورًا أقوى وثقة أكبر.",
      gift: "تصميم غلاف للقناة مجاناً بجودة فائقة",
      badge: "Premium",
      isFeatured: false,
      sortOrder: 13,
    },
    {
      name: "باقة النخبة",
      platform: "YouTube",
      followersCount: "20,000",
      price: 7500.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "تعزيز احترافي لحسابك مع جودة عالية وتعويض مجاني مدى الحياة لأي نقص، مع الحفاظ على أمان الحساب.",
      gift: "دعم فني وتوجيه كامل لمدة شهر لتحسين القناة والربح",
      badge: "VIP",
      isFeatured: true,
      sortOrder: 14,
    },

    // Google Reviews (5 packages)
    {
      name: "الباقة الفضية",
      platform: "Google Reviews",
      followersCount: "5",
      price: 125.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "زيادة ثابتة بجودة عالية مع تعويض مجاني لأي نقص، وخدمة آمنة تمامًا على حسابك.",
      gift: "اقتراح نصوص ومراجعات مجانية لنشاطك",
      badge: "Popular",
      isFeatured: false,
      sortOrder: 15,
    },
    {
      name: "الباقة الذهبية",
      platform: "Google Reviews",
      followersCount: "10",
      price: 250.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "خدمة احترافية تمنح حسابك مظهرًا أقوى مع تعويض دائم لأي نقص لضمان أفضل تجربة.",
      gift: "خطة تسويق محلي مجانية بالكامل",
      badge: "Best Seller",
      isFeatured: true,
      sortOrder: 16,
    },
    {
      name: "الباقة البلاتينية",
      platform: "Google Reviews",
      followersCount: "25",
      price: 550.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "نتائج مستقرة بجودة ممتازة مع تعويض مدى الحياة، مصممة لتعزيز ظهور حسابك بشكل احترافي.",
      gift: "حسابات نشطة وقديمة وموثوقة لضمان الثبات",
      badge: "Premium",
      isFeatured: false,
      sortOrder: 17,
    },
    {
      name: "الباقة الماسية",
      platform: "Google Reviews",
      followersCount: "50",
      price: 1100.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "خدمة موثوقة وآمنة مع تعويض دائم لأي نقص، لتمنح حسابك حضورًا أقوى وثقة أكبر.",
      gift: "تحليل وتدقيق كامل لظهور نشاطك التجاري على الخرائط",
      badge: "Premium",
      isFeatured: false,
      sortOrder: 18,
    },
    {
      name: "باقة النخبة",
      platform: "Google Reviews",
      followersCount: "100",
      price: 2100.0,
      deliveryTime: "من 30 دقيقة إلى ساعة",
      description: "تعزيز احترافي لحسابك مع جودة عالية وتعويض مجاني مدى الحياة لأي نقص، مع الحفاظ على أمان الحساب.",
      gift: "خطة إدارة السمعة الرقمية للنشاط مجاناً لمدة شهر كامل",
      badge: "VIP",
      isFeatured: true,
      sortOrder: 19,
    },
  ];

  for (const pack of defaultPackages) {
    await prisma.package.create({ data: pack });
  }

  // Seed default Reviews if empty
  const reviewCount = await prisma.review.count();
  if (reviewCount === 0) {
    const defaultReviews = [
      {
        customerName: "أحمد مجدي",
        rating: 5,
        content: "الخدمة سريعة جداً وممتازة، طلبت 5000 متابع ووصلوا في أقل من 6 ساعات وبدون أي نقصان. خدمة العملاء على الواتساب قمة في الاحترام والدعم الفني متواجد على مدار الساعة.",
      },
      {
        customerName: "منى السيد",
        rating: 5,
        content: "جربت تقييمات جوجل ماب لشركتي والنتيجة كانت رائعة، الترتيب ارتفع والتقييمات كلها من حسابات حقيقية وبتعليقات ممتازة. شكراً زودها وسرعتهم خرافية!",
      },
      {
        customerName: "كريم الدالي",
        rating: 5,
        content: "يوتيوب كنت خايف جداً من النقصان وقناتي تتقفل بس المشتركين ثابتين وفعلت الربح بفضل الله ثم موقع زودها. الأسعار مقارنة بالسوق تعتبر الأفضل والأكثر أماناً بلا منازع.",
      },
      {
        customerName: "ياسمين عمرو",
        rating: 5,
        content: "المصداقية هي أهم حاجة، زودها ملتزمين بالوقت والخدمة ممتازة والدعم الفني بيرد بسرعة كبيرة. هتعامل معاهم دايماً في كل شغلي على السوشيال ميديا.",
      },
    ];

    for (const rev of defaultReviews) {
      await prisma.review.create({ data: rev });
    }
  } else {
    // Clean up any existing reviews in the database that still have parenthetical titles
    await prisma.review.updateMany({
      where: { customerName: "أحمد مجدي (صاحب متجر ملابس)" },
      data: { customerName: "أحمد مجدي" }
    });
    await prisma.review.updateMany({
      where: { customerName: "منى السيد (مصممة ديكور)" },
      data: { customerName: "منى السيد" }
    });
    await prisma.review.updateMany({
      where: { customerName: "كريم الدالي (يوتيوبر)" },
      data: { customerName: "كريم الدالي" }
    });
    await prisma.review.updateMany({
      where: { customerName: "ياسمين عمرو (خبيرة تجميل)" },
      data: { customerName: "ياسمين عمرو" }
    });
  }

  // Seed default Coupons if empty
  const couponCount = await prisma.coupon.count();
  if (couponCount === 0) {
    const defaultCoupons = [
      { code: "ZWDHA10", discountPercent: 10.0, active: true },
      { code: "EID20", discountPercent: 20.0, active: true },
    ];
    for (const cop of defaultCoupons) {
      await prisma.coupon.create({ data: cop });
    }
  }

  console.log("App seeded and initialized successfully!");
}

// Boot setup
initializeApp().then(async () => {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ZWDHA server listening on port ${PORT}`);
  });
});
