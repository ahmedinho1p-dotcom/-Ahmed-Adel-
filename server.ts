import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "zwdha-super-secret-key-123456";

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

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
      if (couponCode) {
        const coupon = await prisma.coupon.findFirst({
          where: { code: couponCode.toUpperCase().trim(), active: true },
        });
        if (coupon) {
          finalPrice = basePrice * (1 - coupon.discountPercent / 100);
        }
      }

      // Round to 2 decimals
      finalPrice = Math.round(finalPrice * 100) / 100;

      // Get Default Store Currency from Settings (or EGP)
      const currencySetting = await prisma.setting.findUnique({ where: { key: "currency_default" } });
      const currency = currencySetting ? currencySetting.value : "EGP";

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

      // Increment stats
      const statsCompletedStr = await prisma.setting.findUnique({ where: { key: "stat_completed_orders" } });
      if (statsCompletedStr) {
        const currentCount = parseInt(statsCompletedStr.value) || 33567;
        await prisma.setting.update({
          where: { key: "stat_completed_orders" },
          data: { value: (currentCount + 1).toString() },
        });
      }

      // Trigger Email Notification (Non-blocking)
      sendOrderEmail(newOrder, pack);

      const responseMessage = paymentMethod 
        ? "تم استلام طلبك وإيصال الدفع بنجاح. سيقوم فريقنا بمراجعة عملية الدفع، وسيبدأ تنفيذ طلبك فور التأكد من عملية الدفع."
        : "تم تسجيل طلبك بنجاح! سيقوم فريق الدعم الفني بالتواصل معك عبر الواتساب لإكمال الطلب.";

      res.status(201).json({
        success: true,
        message: responseMessage,
        order: newOrder,
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
      where: { code: code.toUpperCase().trim(), active: true },
    });

    if (!coupon) {
      return res.status(404).json({ error: "كود الخصم غير موجود أو منتهي الصلاحية" });
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
    });
  } catch (error) {
    res.status(500).json({ error: "فشل التحقق من كود الخصم" });
  }
});

// Daily Gift IP helper
const getClientIp = (req: any) => {
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

    // Find latest claim by this IP in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastClaim = await prisma.giftClaim.findFirst({
      where: {
        ip: ip,
        createdAt: {
          gte: oneDayAgo
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (lastClaim) {
      const elapsed = Date.now() - lastClaim.createdAt.getTime();
      const timeLeftMs = (24 * 60 * 60 * 1000) - elapsed;
      const timeLeftSeconds = Math.max(0, Math.ceil(timeLeftMs / 1000));
      return res.json({
        canClaim: false,
        timeLeftSeconds,
        giftConfig,
        lastClaim
      });
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

    // Double check 24h claiming window
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastClaim = await prisma.giftClaim.findFirst({
      where: {
        ip: ip,
        createdAt: {
          gte: oneDayAgo
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (lastClaim) {
      const elapsed = Date.now() - lastClaim.createdAt.getTime();
      const timeLeftMs = (24 * 60 * 60 * 1000) - elapsed;
      const timeLeftSeconds = Math.max(0, Math.ceil(timeLeftMs / 1000));
      return res.status(400).json({
        error: "عذراً، لقد قمت باستلام هديتك اليومية بالفعل من هذا الجهاز",
        timeLeftSeconds
      });
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
app.get("/api/orders", authenticateAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "فشل تحميل قائمة الطلبات" });
  }
});

app.patch("/api/orders/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // New | Contacted | Completed | Cancelled
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "فشل تحديث حالة الطلب" });
  }
});

app.patch("/api/orders/:id/payment", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, internalNotes } = req.body;
    const updated = await prisma.order.update({
      where: { id },
      data: { 
        paymentStatus,
        internalNotes
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
    const { code, discountPercent, active } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ error: "الكود ونسبة الخصم مطلوبة" });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return res.status(400).json({ error: "هذا الكود متواجد بالفعل" });
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountPercent: parseFloat(discountPercent) || 0,
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
app.get("/api/stats", authenticateAdmin, async (req, res) => {
  try {
    const allOrders = await prisma.order.findMany();
    const allPackages = await prisma.package.findMany();

    const stats = {
      totalOrders: allOrders.length,
      statusNew: allOrders.filter((o) => o.status === "New").length,
      statusContacted: allOrders.filter((o) => o.status === "Contacted").length,
      statusCompleted: allOrders.filter((o) => o.status === "Completed").length,
      statusCancelled: allOrders.filter((o) => o.status === "Cancelled").length,
      totalRevenue: allOrders.filter((o) => o.status === "Completed").reduce((sum, o) => sum + o.price, 0),
      // Orders split by platform
      platforms: {
        Facebook: allOrders.filter((o) => o.platform === "Facebook").length,
        Instagram: allOrders.filter((o) => o.platform === "Instagram").length,
        YouTube: allOrders.filter((o) => o.platform === "YouTube").length,
        "Google Reviews": allOrders.filter((o) => o.platform === "Google Reviews").length,
      },
      // Packages count
      totalPackages: allPackages.length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "فشل تجميع الإحصائيات" });
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
        customerName: "أحمد مجدي (صاحب متجر ملابس)",
        rating: 5,
        content: "الخدمة سريعة جداً وممتازة، طلبت 5000 متابع ووصلوا في أقل من 6 ساعات وبدون أي نقصان. خدمة العملاء على الواتساب قمة في الاحترام والدعم الفني متواجد على مدار الساعة.",
      },
      {
        customerName: "منى السيد (مصممة ديكور)",
        rating: 5,
        content: "جربت تقييمات جوجل ماب لشركتي والنتيجة كانت رائعة، الترتيب ارتفع والتقييمات كلها من حسابات حقيقية وبتعليقات ممتازة. شكراً زودها وسرعتهم خرافية!",
      },
      {
        customerName: "كريم الدالي (يوتيوبر)",
        rating: 5,
        content: "يوتيوب كنت خايف جداً من النقصان وقناتي تتقفل بس المشتركين ثابتين وفعلت الربح بفضل الله ثم موقع زودها. الأسعار مقارنة بالسوق تعتبر الأفضل والأكثر أماناً بلا منازع.",
      },
      {
        customerName: "ياسمين عمرو (خبيرة تجميل)",
        rating: 5,
        content: "المصداقية هي أهم حاجة، زودها ملتزمين بالوقت والخدمة ممتازة والدعم الفني بيرد بسرعة كبيرة. هتعامل معاهم دايماً في كل شغلي على السوشيال ميديا.",
      },
    ];

    for (const rev of defaultReviews) {
      await prisma.review.create({ data: rev });
    }
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
