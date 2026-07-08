import React, { useState, useEffect } from "react";
import { 
  Lock, Key, Users, ShoppingBag, Landmark, Percent, Settings, Mail, Phone,
  TrendingUp, Sparkles, AlertCircle, CheckCircle, Clock, Trash2, Edit, Plus, 
  Eye, EyeOff, ArrowUp, ArrowDown, LogOut, Check, RefreshCw, MessageSquare, ExternalLink, ArrowLeft, RefreshCw as SpinIcon
} from "lucide-react";
import { Package, Order, Coupon, StoreSettings, DashboardStats } from "../types";

interface AdminPanelProps {
  darkMode: boolean;
  currency: 'EGP' | 'SAR' | 'USD';
  onSettingsUpdated: () => void;
}

export default function AdminPanel({ darkMode, currency, onSettingsUpdated }: AdminPanelProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("zwdha_admin_token"));
  const [username, setUsername] = useState("");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'stats' | 'packages' | 'orders' | 'coupons' | 'settings'>('stats');

  // Database lists
  const [packages, setPackages] = useState<Package[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({});
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Loading and Error states
  const [loadingLists, setLoadingLists] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Search and Filters for Orders
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");

  // Package Form states
  const [packageFormOpen, setPackageFormOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packName, setPackName] = useState("");
  const [packPlatform, setPackPlatform] = useState<'Facebook' | 'Instagram' | 'YouTube' | 'Google Reviews'>('Instagram');
  const [packFollowers, setPackFollowers] = useState("");
  const [packPrice, setPackPrice] = useState("");
  const [packDelivery, setPackDelivery] = useState("");
  const [packDesc, setPackDesc] = useState("");
  const [packGift, setPackGift] = useState("");
  const [packBadge, setPackBadge] = useState("");
  const [packFeatured, setPackFeatured] = useState(false);
  const [packHidden, setPackHidden] = useState(false);
  const [packDiscount, setPackDiscount] = useState("");

  // Coupon Form states
  const [couponCode, setCouponCode] = useState("");
  const [couponPercent, setCouponPercent] = useState("");

  // General Settings Form states
  const [settRateSar, setSettRateSar] = useState("");
  const [settRateUsd, setSettRateUsd] = useState("");
  const [settOrdersCount, setSettOrdersCount] = useState("");
  const [settReviewsCount, setSettReviewsCount] = useState("");
  const [settAvgRating, setSettAvgRating] = useState("");
  const [settSmtpHost, setSettSmtpHost] = useState("");
  const [settSmtpPort, setSettSmtpPort] = useState("");
  const [settSmtpUser, setSettSmtpUser] = useState("");
  const [settSmtpPass, setSettSmtpPass] = useState("");
  const [settSmtpSecure, setSettSmtpSecure] = useState(false);
  const [settSmtpReceiver, setSettSmtpReceiver] = useState("");
  const [settVodafoneCash, setSettVodafoneCash] = useState("");
  const [settOrangeCash, setSettOrangeCash] = useState("");
  const [settEtisalatCash, setSettEtisalatCash] = useState("");
  const [settWePay, setSettWePay] = useState("");
  const [settInstapay, setSettInstapay] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [editingNotesText, setEditingNotesText] = useState<{ [orderId: string]: string }>({});

  // Real-time new orders alert
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  // Fetch all administration details
  const fetchAllData = async (authToken: string) => {
    setLoadingLists(true);
    try {
      const headers = { "Authorization": `Bearer ${authToken}` };

      // Get profile
      const meRes = await fetch("/api/admin/me", { headers });
      if (!meRes.ok) {
        handleLogout();
        return;
      }
      const meData = await meRes.json();
      setUsername(meData.username);

      // Get Packages
      const packRes = await fetch("/api/packages?all=true", { headers });
      if (packRes.ok) {
        const packData = await packRes.json();
        setPackages(packData);
      }

      // Get Orders
      const orderRes = await fetch("/api/orders", { headers });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
        // Compute new orders
        const newCount = orderData.filter((o: Order) => o.status === "New").length;
        setNewOrdersCount(newCount);
      }

      // Get Coupons
      const couponRes = await fetch("/api/coupons", { headers });
      if (couponRes.ok) {
        const couponData = await couponRes.json();
        setCoupons(couponData);
      }

      // Get Settings
      const settingsRes = await fetch("/api/settings", { headers });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        setSettRateSar(settingsData.rate_sar || "13.0");
        setSettRateUsd(settingsData.rate_usd || "49.0");
        setSettOrdersCount(settingsData.stat_completed_orders || "33567");
        setSettReviewsCount(settingsData.stat_customer_reviews || "8742");
        setSettAvgRating(settingsData.stat_average_rating || "4.9");
        setSettSmtpHost(settingsData.smtp_host || "smtp.gmail.com");
        setSettSmtpPort(settingsData.smtp_port || "587");
        setSettSmtpUser(settingsData.smtp_user || "");
        setSettSmtpPass(settingsData.smtp_pass || "");
        setSettSmtpSecure(settingsData.smtp_secure === "true");
        setSettSmtpReceiver(settingsData.smtp_receiver || "elfashikh5@gmail.com");
        setSettVodafoneCash(settingsData.vodafone_cash_number || "01124656914");
        setSettOrangeCash(settingsData.orange_cash_number || "01124656914");
        setSettEtisalatCash(settingsData.etisalat_cash_number || "01124656914");
        setSettWePay(settingsData.we_pay_number || "01124656914");
        setSettInstapay(settingsData.instapay_number || "01558676497");
      }

      // Get Stats
      const statsRes = await fetch("/api/stats", { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData(token);
    }
  }, [token]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("zwdha_admin_token", data.token);
        setToken(data.token);
        setLoginUser("");
        setLoginPass("");
      } else {
        setLoginError(data.error || "خطأ في اسم المستخدم أو كلمة المرور");
      }
    } catch (err) {
      setLoginError("فشل الاتصال بالخادم، يرجى المحاولة لاحقاً");
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("zwdha_admin_token");
    setToken(null);
    setUsername("");
  };

  // Quick order status modification
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchAllData(token);
        showSuccess("تم تحديث حالة الطلب بنجاح!");
      }
    } catch (e) {
      showError("فشل تحديث حالة الطلب");
    }
  };

  // Modify payment status and notes
  const handleUpdatePayment = async (orderId: string, paymentStatus: string, internalNotes: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus, internalNotes }),
      });
      if (res.ok) {
        fetchAllData(token);
        showSuccess("تم تحديث بيانات الدفع والتحقق بنجاح!");
      } else {
        showError("فشل تحديث بيانات الدفع");
      }
    } catch (e) {
      showError("حدث خطأ أثناء حفظ التغييرات");
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!token || !window.confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllData(token);
        showSuccess("تم حذف الكوبون بنجاح");
      }
    } catch (e) {
      showError("فشل حذف الكوبون");
    }
  };

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !couponPercent) return;
    if (!token) return;

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponCode,
          discountPercent: parseFloat(couponPercent),
          active: true
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponCode("");
        setCouponPercent("");
        fetchAllData(token);
        showSuccess("تم إنشاء كود الخصم الجديد!");
      } else {
        showError(data.error || "فشل إنشاء الكوبون");
      }
    } catch (e) {
      showError("حدث خطأ أثناء الاتصال بالخادم");
    }
  };

  // Package Form Actions (Add / Edit)
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packName || !packPrice || !packFollowers) return;
    if (!token) return;

    const payload = {
      name: packName,
      platform: packPlatform,
      followersCount: packFollowers,
      price: parseFloat(packPrice),
      deliveryTime: packDelivery,
      description: packDesc,
      gift: packGift || null,
      badge: packBadge || null,
      isFeatured: packFeatured,
      isHidden: packHidden,
      discount: packDiscount ? parseFloat(packDiscount) : null,
    };

    try {
      let res;
      if (editingPackageId) {
        res = await fetch(`/api/packages/${editingPackageId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/packages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setPackageFormOpen(false);
        setEditingPackageId(null);
        clearPackageForm();
        fetchAllData(token);
        showSuccess(editingPackageId ? "تم تعديل الباقة بنجاح" : "تم إضافة الباقة الجديدة بنجاح!");
      } else {
        showError("فشل حفظ الباقة، تأكد من صحة المدخلات");
      }
    } catch (e) {
      showError("خطأ في الاتصال بالخادم");
    }
  };

  const startEditPackage = (pack: Package) => {
    setEditingPackageId(pack.id);
    setPackName(pack.name);
    setPackPlatform(pack.platform);
    setPackFollowers(pack.followersCount);
    setPackPrice(pack.price.toString());
    setPackDelivery(pack.deliveryTime);
    setPackDesc(pack.description);
    setPackGift(pack.gift || "");
    setPackBadge(pack.badge || "");
    setPackFeatured(pack.isFeatured);
    setPackHidden(pack.isHidden);
    setPackDiscount(pack.discount ? pack.discount.toString() : "");
    setPackageFormOpen(true);
  };

  const handleDeletePackage = async (id: string) => {
    if (!token || !window.confirm("هل أنت متأكد من رغبتك في حذف هذه الباقة نهائياً؟")) return;
    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllData(token);
        showSuccess("تم حذف الباقة من المتجر");
      }
    } catch (e) {
      showError("فشل حذف الباقة");
    }
  };

  const handleTogglePackageHidden = async (pack: Package) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/packages/${pack.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...pack, isHidden: !pack.isHidden }),
      });
      if (res.ok) {
        fetchAllData(token);
        showSuccess(!pack.isHidden ? "تم إخفاء الباقة عن المشترين" : "تم إظهار الباقة للمشترين");
      }
    } catch (e) {
      showError("فشل تعديل حالة العرض");
    }
  };

  const handleReorderPackage = async (index: number, direction: 'up' | 'down') => {
    if (!token) return;
    const newPackages = [...packages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newPackages.length) return;

    // Swap
    const temp = newPackages[index];
    newPackages[index] = newPackages[targetIndex];
    newPackages[targetIndex] = temp;

    setPackages(newPackages);

    try {
      const ids = newPackages.map(p => p.id);
      const res = await fetch("/api/packages/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ packageIds: ids }),
      });
      if (res.ok) {
        showSuccess("تم حفظ الترتيب الجديد للباقات");
      }
    } catch (e) {
      showError("فشل حفظ الترتيب");
    }
  };

  const clearPackageForm = () => {
    setEditingPackageId(null);
    setPackName("");
    setPackPlatform("Instagram");
    setPackFollowers("");
    setPackPrice("");
    setPackDelivery("");
    setPackDesc("");
    setPackGift("");
    setPackBadge("");
    setPackFeatured(false);
    setPackHidden(false);
    setPackDiscount("");
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const payload: any = {
      rate_sar: settRateSar,
      rate_usd: settRateUsd,
      stat_completed_orders: settOrdersCount,
      stat_customer_reviews: settReviewsCount,
      stat_average_rating: settAvgRating,
      smtp_host: settSmtpHost,
      smtp_port: settSmtpPort,
      smtp_user: settSmtpUser,
      smtp_pass: settSmtpPass,
      smtp_secure: settSmtpSecure.toString(),
      smtp_receiver: settSmtpReceiver,
      vodafone_cash_number: settVodafoneCash,
      orange_cash_number: settOrangeCash,
      etisalat_cash_number: settEtisalatCash,
      we_pay_number: settWePay,
      instapay_number: settInstapay,
    };

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchAllData(token);
        onSettingsUpdated();
        showSuccess("تم حفظ إعدادات المتجر والإيميل والعملات بنجاح!");
      } else {
        showError("فشل حفظ الإعدادات");
      }
    } catch (e) {
      showError("خطأ في الاتصال بالخادم");
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (!newAdminPassword || newAdminPassword.length < 6) {
      showError("يجب أن لا تقل كلمة المرور عن 6 أحرف");
      return;
    }
    if (!token) return;

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: newAdminPassword }),
      });
      if (res.ok) {
        setNewAdminPassword("");
        showSuccess("تم تغيير كلمة مرور الإدارة بنجاح!");
      } else {
        showError("فشل تغيير كلمة المرور");
      }
    } catch (e) {
      showError("خطأ في الاتصال");
    }
  };

  // Notification helpers
  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(""), 4000);
  };
  const showError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(""), 4000);
  };

  // Filter orders according to search & status
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.whatsappNumber.includes(orderSearch) ||
      o.packageName.toLowerCase().includes(orderSearch.toLowerCase());
    
    const matchesStatus = orderStatusFilter === "All" || o.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate order WhatsApp link
  const getWhatsAppLink = (order: Order) => {
    const cleanNumber = order.whatsappNumber.replace(/[^\d]/g, "");
    const text = encodeURIComponent(
      `السلام عليكم يا أستاذ ${order.customerName}، معك الدعم الفني لمتجر زودها ZWDHA SMM.\n\n` +
      `لقد تلقينا طلبك رقم (${order.id.slice(0,8)}) لتزويد الخدمة التالية:\n` +
      `🎁 باقة: ${order.packageName} (${order.platform})\n` +
      `💰 السعر: ${order.price} ${order.currency}\n` +
      `🔗 الرابط: ${order.pageUrl}\n\n` +
      `هل أنت جاهز لتأكيد الطلب لتزويدك بطرق السداد وتفعيل الخدمة فوراً؟`
    );
    return `https://wa.me/${cleanNumber}?text=${text}`;
  };

  // Convert Gregorian Date nicely for Arabs
  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleString("ar-EG", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  // Check login state
  if (!token) {
    return (
      <div className={`py-16 md:py-24 px-4 flex items-center justify-center min-h-[70vh] transition-colors duration-300 ${
        darkMode ? "bg-black text-white" : "bg-neutral-50 text-neutral-900"
      }`}>
        <div className={`w-full max-w-md p-8 rounded-2xl border ${
          darkMode ? "bg-neutral-900/50 border-neutral-800" : "bg-white border-neutral-200 shadow-xl"
        }`}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-900/20">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-black">بوابة إدارة زودها ZWDHA</h1>
            <p className="text-xs text-neutral-400 mt-1.5">تسجيل الدخول الآمن لإدارة الطلبات والخدمات</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold text-right flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1.5 text-right">اسم المستخدم للإدارة</label>
              <input
                id="admin-login-username"
                type="text"
                required
                placeholder="مثال: admin"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className={`w-full text-sm p-3 rounded-xl border focus:outline-none transition-all ${
                  darkMode 
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-pink-500" 
                    : "bg-white border-neutral-200 text-neutral-900 focus:border-pink-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1.5 text-right">كلمة المرور السرية</label>
              <input
                id="admin-login-password"
                type="password"
                required
                placeholder="كلمة المرور الخاصة بك"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className={`w-full text-sm p-3 rounded-xl border focus:outline-none transition-all ${
                  darkMode 
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-pink-500" 
                    : "bg-white border-neutral-200 text-neutral-900 focus:border-pink-500"
                }`}
              />
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-extrabold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-500/10"
            >
              {loginSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الدخول الآمن...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>تسجيل دخول الإدارة</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-neutral-800/10 dark:border-neutral-800/50 pt-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/";
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-pink-500 transition-colors"
            >
              <span>العودة لصفحة المتجر الرئيسية</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-8 md:py-12 transition-colors duration-300 min-h-screen ${
      darkMode ? "bg-black text-white" : "bg-neutral-50 text-neutral-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Alert for new orders */}
        {newOrdersCount > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold font-mono text-sm animate-bounce">
                {newOrdersCount}
              </div>
              <div>
                <p className="text-sm font-black">لديك طلبات جديدة معلقة!</p>
                <p className="text-xs text-neutral-400 mt-0.5">يرجى فحص الطلبات والتواصل مع العملاء عبر الواتساب فوراً.</p>
              </div>
            </div>
            <button
              id="btn-goto-orders"
              onClick={() => setActiveTab('orders')}
              className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-all cursor-pointer"
            >
              عرض الطلبات
            </button>
          </div>
        )}

        {/* Action success/error notifications */}
        {actionSuccess && (
          <div className="fixed bottom-6 right-6 z-50 p-4 bg-green-500 text-white font-bold rounded-xl shadow-2xl flex items-center gap-2.5 animate-slide-down">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="fixed bottom-6 right-6 z-50 p-4 bg-red-500 text-white font-bold rounded-xl shadow-2xl flex items-center gap-2.5 animate-slide-down">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{actionError}</span>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800/20 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-black">لوحة التحكم والمتابعة</h1>
            <p className="text-xs text-neutral-400 mt-1">مرحباً بك مجدداً، <span className="text-pink-500 font-extrabold">{username}</span>. تدير المتجر بكفاءة وأمان.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              id="admin-to-store-btn"
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/";
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <span>العودة للمتجر الرئيسي</span>
            </a>
            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all text-neutral-300 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Main Panels & Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tabs Sidebar */}
          <div className="lg:col-span-3 space-y-2 flex flex-col">
            <button
              id="admin-tab-stats"
              onClick={() => setActiveTab('stats')}
              className={`p-4 rounded-xl text-right font-bold text-sm transition-all flex items-center gap-3 border ${
                activeTab === 'stats'
                  ? "bg-pink-500/10 border-pink-500/20 text-pink-500 font-extrabold"
                  : "border-transparent text-neutral-400 hover:bg-neutral-800/40"
              }`}
            >
              <TrendingUp className="w-5 h-5 shrink-0" />
              <span>الإحصائيات والملخص</span>
            </button>

            <button
              id="admin-tab-orders"
              onClick={() => setActiveTab('orders')}
              className={`p-4 rounded-xl text-right font-bold text-sm transition-all flex items-center justify-between border ${
                activeTab === 'orders'
                  ? "bg-pink-500/10 border-pink-500/20 text-pink-500 font-extrabold"
                  : "border-transparent text-neutral-400 hover:bg-neutral-800/40"
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 shrink-0" />
                <span>إدارة طلبات العملاء</span>
              </span>
              {newOrdersCount > 0 && (
                <span className="bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full font-mono animate-pulse">
                  {newOrdersCount}
                </span>
              )}
            </button>

            <button
              id="admin-tab-packages"
              onClick={() => setActiveTab('packages')}
              className={`p-4 rounded-xl text-right font-bold text-sm transition-all flex items-center gap-3 border ${
                activeTab === 'packages'
                  ? "bg-pink-500/10 border-pink-500/20 text-pink-500 font-extrabold"
                  : "border-transparent text-neutral-400 hover:bg-neutral-800/40"
              }`}
            >
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>إدارة باقات الخدمات</span>
            </button>

            <button
              id="admin-tab-coupons"
              onClick={() => setActiveTab('coupons')}
              className={`p-4 rounded-xl text-right font-bold text-sm transition-all flex items-center gap-3 border ${
                activeTab === 'coupons'
                  ? "bg-pink-500/10 border-pink-500/20 text-pink-500 font-extrabold"
                  : "border-transparent text-neutral-400 hover:bg-neutral-800/40"
              }`}
            >
              <Percent className="w-5 h-5 shrink-0" />
              <span>كوبونات الخصم والترويج</span>
            </button>

            <button
              id="admin-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`p-4 rounded-xl text-right font-bold text-sm transition-all flex items-center gap-3 border ${
                activeTab === 'settings'
                  ? "bg-pink-500/10 border-pink-500/20 text-pink-500 font-extrabold"
                  : "border-transparent text-neutral-400 hover:bg-neutral-800/40"
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span>إعدادات المتجر العامة</span>
            </button>
          </div>

          {/* Panel Contents */}
          <div className="lg:col-span-9">
            
            {loadingLists ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-10 h-10 animate-spin text-pink-500" />
                <p className="text-sm text-neutral-400">جاري تحميل وتحديث البيانات الإدارية...</p>
              </div>
            ) : (
              <>
                {/* 1. STATS TAB */}
                {activeTab === 'stats' && stats && (
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* Stats summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      
                      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200"}`}>
                        <div className="text-xs font-bold text-neutral-400">إجمالي الطلبات المستلمة</div>
                        <div className="text-2xl font-black font-mono text-purple-500 mt-2">{stats.totalOrders}</div>
                        <p className="text-[10px] text-neutral-500 mt-1">تراكمي منذ إنشاء المتجر</p>
                      </div>

                      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200"}`}>
                        <div className="text-xs font-bold text-neutral-400">طلبات جديدة (معلقة)</div>
                        <div className="text-2xl font-black font-mono text-red-500 mt-2">{stats.statusNew}</div>
                        <p className="text-[10px] text-neutral-500 mt-1">تنتظر التواصل والمراجعة</p>
                      </div>

                      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200"}`}>
                        <div className="text-xs font-bold text-neutral-400">الطلبات المكتملة</div>
                        <div className="text-2xl font-black font-mono text-green-500 mt-2">{stats.statusCompleted}</div>
                        <p className="text-[10px] text-neutral-500 mt-1">تزويد رقمي مفعّل بالكامل</p>
                      </div>

                      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200"}`}>
                        <div className="text-xs font-bold text-neutral-400">إجمالي الأرباح المستلمة</div>
                        <div className="text-2xl font-black font-mono text-pink-500 mt-2">{stats.totalRevenue.toLocaleString()} {currency}</div>
                        <p className="text-[10px] text-neutral-500 mt-1">من الطلبات المكتملة فقط</p>
                      </div>

                    </div>

                    {/* Platform Popularity progress visual */}
                    <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200"}`}>
                      <h3 className="text-sm font-bold mb-5 text-right">مستويات الإقبال حسب المنصة الرقمية</h3>
                      <div className="space-y-4">
                        {Object.entries(stats.platforms).map(([platform, count]) => {
                          const countNum = count as number;
                          const percentage = stats.totalOrders > 0 ? (countNum / stats.totalOrders) * 100 : 0;
                          return (
                            <div key={platform} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span>{platform}</span>
                                <span className="font-mono text-neutral-400">{countNum} طلب ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="h-2.5 rounded-full bg-neutral-800 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. ORDERS TAB */}
                {activeTab === 'orders' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Filter and Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                      <div className="flex gap-2 w-full sm:w-auto">
                        {(['All', 'New', 'Contacted', 'Completed', 'Cancelled'] as const).map((st) => (
                          <button
                            key={st}
                            id={`order-status-tab-${st}`}
                            onClick={() => setOrderStatusFilter(st)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              orderStatusFilter === st
                                ? "bg-pink-500 text-white"
                                : darkMode 
                                  ? "bg-neutral-900 hover:bg-neutral-800 text-neutral-400" 
                                  : "bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
                            }`}
                          >
                            {st === 'All' ? 'الكل' : st === 'New' ? 'جديد' : st === 'Contacted' ? 'تم التواصل' : st === 'Completed' ? 'مكتمل' : 'ملغي'}
                          </button>
                        ))}
                      </div>

                      <div className="relative w-full sm:w-64">
                        <input
                          id="order-search-input"
                          type="text"
                          placeholder="ابحث بالاسم، رقم الهاتف..."
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 ${
                            darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Orders Table */}
                    <div className={`border rounded-2xl overflow-hidden ${darkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className={`font-bold ${darkMode ? "bg-neutral-900/50 text-neutral-400" : "bg-neutral-100 text-neutral-700"}`}>
                            <tr>
                              <th className="p-4">رقم المعرّف / التاريخ</th>
                              <th className="p-4">تفاصيل العميل</th>
                              <th className="p-4">الخدمة المطلوبة</th>
                              <th className="p-4">رابط الصفحة</th>
                              <th className="p-4">السعر</th>
                              <th className="p-4">الحالة والتعديل</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800/10">
                            {filteredOrders.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-neutral-500">
                                  لا توجد أي طلبات مطابقة للبحث أو معلقة حالياً.
                                </td>
                              </tr>
                            ) : (
                              filteredOrders.map((order) => (
                                <tr key={order.id} className={darkMode ? "hover:bg-neutral-900/20" : "hover:bg-neutral-50"}>
                                  
                                  <td className="p-4 space-y-1">
                                    <div className="font-mono text-[10px] text-neutral-400 uppercase select-all font-bold">#{order.id.slice(0, 8)}</div>
                                    <div className="text-[10px] text-neutral-500">{formatDate(order.createdAt)}</div>
                                  </td>

                                  <td className="p-4 space-y-1">
                                    <div className="font-bold">{order.customerName}</div>
                                    <div className="font-mono text-neutral-400">{order.whatsappNumber}</div>
                                  </td>

                                  <td className="p-4 space-y-1">
                                    <div className="font-bold">{order.packageName}</div>
                                    <span className="text-[10px] text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full font-bold">{order.platform}</span>
                                  </td>

                                  <td className="p-4 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                                    <a
                                      href={order.pageUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-cyan-500 hover:underline flex items-center gap-1 font-mono text-[11px]"
                                    >
                                      <span>افتح الرابط</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </td>

                                  <td className="p-4 font-mono font-bold text-pink-500">
                                    {order.price} {order.currency}
                                  </td>

                                  <td className="p-4 space-y-2">
                                    {/* Status dropdown */}
                                    <select
                                      id={`order-status-select-${order.id}`}
                                      value={order.status}
                                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                      className={`p-1.5 rounded-lg text-[11px] font-bold border focus:outline-none ${
                                        order.status === "New" 
                                          ? "bg-red-500/10 border-red-500/20 text-red-400" 
                                          : order.status === "Contacted"
                                            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                            : order.status === "Completed"
                                              ? "bg-green-500/10 border-green-500/20 text-green-400"
                                              : "bg-neutral-500/10 border-neutral-500/20 text-neutral-400"
                                      }`}
                                    >
                                      <option value="New">جديد 🔔</option>
                                      <option value="Contacted">تم التواصل 💬</option>
                                      <option value="Completed">مكتمل ✓</option>
                                      <option value="Cancelled">ملغي ✕</option>
                                    </select>

                                    {/* Action link for instant WhatsApp response */}
                                    <a
                                      id={`whatsapp-contact-link-${order.id}`}
                                      href={getWhatsAppLink(order)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-1 bg-[#25d366] text-white hover:bg-[#20ba5a] text-[10px] font-bold py-1.5 px-2.5 rounded-lg transition-all"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5 fill-white" />
                                      <span>رد بالواتساب</span>
                                    </a>
                                  </td>

                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PACKAGES TAB */}
                {activeTab === 'packages' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Add Package button */}
                    <div className="flex justify-end">
                      <button
                        id="admin-btn-add-package"
                        onClick={() => { clearPackageForm(); setPackageFormOpen(true); }}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-pink-500/10 cursor-pointer"
                      >
                        <Plus className="w-4.5 h-4.5" />
                        <span>إضافة باقة جديدة للمتجر</span>
                      </button>
                    </div>

                    {/* Add/Edit Form Box */}
                    {packageFormOpen && (
                      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
                        <h3 className="font-bold mb-4 text-sm">{editingPackageId ? "تعديل بيانات الباقة الحالية" : "إدخال بيانات باقة تزويد جديدة"}</h3>
                        <form onSubmit={handleSavePackage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">اسم الباقة الفرعي</label>
                            <input
                              id="pkg-form-name"
                              type="text"
                              required
                              placeholder="مثال: الباقة الفضية المميزة"
                              value={packName}
                              onChange={(e) => setPackName(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">المنصة المستهدفة</label>
                            <select
                              id="pkg-form-platform"
                              value={packPlatform}
                              onChange={(e) => setPackPlatform(e.target.value as any)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            >
                              <option value="Instagram">Instagram</option>
                              <option value="Facebook">Facebook</option>
                              <option value="YouTube">YouTube</option>
                              <option value="Google Reviews">Google Reviews</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">الكمية المقررة (الرقم أو التعداد)</label>
                            <input
                              id="pkg-form-followers"
                              type="text"
                              required
                              placeholder="مثال: 1,000 أو 50 تقييم"
                              value={packFollowers}
                              onChange={(e) => setPackFollowers(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">السعر الأساسي بـ (EGP جنيهاً)</label>
                            <input
                              id="pkg-form-price"
                              type="number"
                              required
                              placeholder="مثال: 150"
                              value={packPrice}
                              onChange={(e) => setPackPrice(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">مدة التسليم والتوصيل</label>
                            <input
                              id="pkg-form-delivery"
                              type="text"
                              required
                              placeholder="مثال: 1-2 ساعة أو فوري"
                              value={packDelivery}
                              onChange={(e) => setPackDelivery(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">نسبة الخصم المئوية الحالية (اختياري)</label>
                            <input
                              id="pkg-form-discount"
                              type="number"
                              placeholder="خصم بالنسبة (مثال: 15 لخصم 15%)"
                              value={packDiscount}
                              onChange={(e) => setPackDiscount(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-neutral-400 mb-2">نوع الهدية الإضافية المرفقة مع الباقة (التحكم بالهدية)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {([
                                { value: "", label: "❌ بدون هدية" },
                                { value: "Like", label: "❤️ لايك Like" },
                                { value: "Follow", label: "👤 متابع Follow" },
                                { value: "Both", label: "✨ الاثنين معاً (Like & Follow)" },
                              ] as const).map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setPackGift(opt.value)}
                                  className={`p-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                    packGift === opt.value
                                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent"
                                      : darkMode
                                        ? "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                                        : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            
                            {/* Allow custom gift if not one of standard options */}
                            <div className="mt-2.5">
                              <label className="block text-[10px] text-neutral-400 mb-1">أو اكتب اسم هدية مخصصة يدوياً:</label>
                              <input
                                id="pkg-form-gift"
                                type="text"
                                placeholder="مثال: زيادة 200 لايك مجاناً"
                                value={packGift}
                                onChange={(e) => setPackGift(e.target.value)}
                                className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 ${
                                  darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                                }`}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">الشارة الترويجية (اختياري)</label>
                            <select
                              id="pkg-form-badge"
                              value={packBadge}
                              onChange={(e) => setPackBadge(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            >
                              <option value="">بدون شارة</option>
                              <option value="Popular">Popular (الأكثر شعبية)</option>
                              <option value="Best Seller">Best Seller (الأكثر مبيعاً)</option>
                              <option value="Premium">Premium (ذهبي مميز)</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">وصف الباقة ومميزاتها بالتفصيل</label>
                            <textarea
                              id="pkg-form-desc"
                              rows={3}
                              placeholder="أدخل مواصفات الباقة وجودتها وثباتها..."
                              value={packDesc}
                              onChange={(e) => setPackDesc(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 resize-none ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div className="flex gap-4 md:col-span-2 pt-2 border-t border-neutral-800/20">
                            <label className="flex items-center gap-2 text-xs font-bold select-none cursor-pointer">
                              <input
                                id="pkg-form-featured"
                                type="checkbox"
                                checked={packFeatured}
                                onChange={(e) => setPackFeatured(e.target.checked)}
                                className="rounded border-neutral-800 text-pink-500"
                              />
                              <span>تمييز الباقة (تفعيل التصميم الذهبي اللامع)</span>
                            </label>

                            <label className="flex items-center gap-2 text-xs font-bold select-none cursor-pointer">
                              <input
                                id="pkg-form-hidden"
                                type="checkbox"
                                checked={packHidden}
                                onChange={(e) => setPackHidden(e.target.checked)}
                                className="rounded border-neutral-800 text-pink-500"
                              />
                              <span>إخفاء الباقة (عدم عرضها في المتجر)</span>
                            </label>
                          </div>

                          <div className="md:col-span-2 flex gap-3 justify-end pt-4">
                            <button
                              id="pkg-form-cancel"
                              type="button"
                              onClick={() => { setPackageFormOpen(false); clearPackageForm(); }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                                darkMode ? "border-neutral-800 text-neutral-400 hover:bg-neutral-800" : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                              }`}
                            >
                              إلغاء
                            </button>
                            <button
                              id="pkg-form-submit"
                              type="submit"
                              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                            >
                              حفظ الباقة فوراً
                            </button>
                          </div>

                        </form>
                      </div>
                    )}

                    {/* Catalog list */}
                    <div className={`border rounded-2xl overflow-hidden ${darkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className={`font-bold ${darkMode ? "bg-neutral-900/50 text-neutral-400" : "bg-neutral-100 text-neutral-700"}`}>
                            <tr>
                              <th className="p-4">الترتيب</th>
                              <th className="p-4">اسم الباقة</th>
                              <th className="p-4">المنصة</th>
                              <th className="p-4">السعر الأساسي</th>
                              <th className="p-4">الحالة والخيارات</th>
                              <th className="p-4 text-center">العمليات الإدارية</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800/10">
                            {packages.map((pack, index) => (
                              <tr key={pack.id} className={darkMode ? "hover:bg-neutral-900/20" : "hover:bg-neutral-50"}>
                                
                                <td className="p-4">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      id={`pkg-order-up-${pack.id}`}
                                      disabled={index === 0}
                                      onClick={() => handleReorderPackage(index, 'up')}
                                      className="p-1.5 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      id={`pkg-order-down-${pack.id}`}
                                      disabled={index === packages.length - 1}
                                      onClick={() => handleReorderPackage(index, 'down')}
                                      className="p-1.5 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>

                                <td className="p-4 font-bold text-neutral-100">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      {pack.name}
                                      {pack.isFeatured && <span className="text-[9px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-extrabold px-1.5 py-0.5 rounded">Featured</span>}
                                    </div>
                                    {pack.gift && (
                                      <div className="text-[10px] text-amber-500 dark:text-amber-400 flex items-center gap-1 font-medium">
                                        <span>🎁 الهدية:</span>
                                        <span className="font-extrabold">
                                          {pack.gift === "Like" ? "لايك Like ❤️" :
                                           pack.gift === "Follow" ? "متابع Follow 👤" :
                                           pack.gift === "Both" ? "الاثنين معاً Like & Follow ✨" :
                                           pack.gift}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td className="p-4 font-bold text-pink-500">{pack.platform}</td>

                                <td className="p-4 font-mono font-bold">{pack.price} EGP</td>

                                <td className="p-4">
                                  <button
                                    id={`pkg-toggle-hidden-${pack.id}`}
                                    onClick={() => handleTogglePackageHidden(pack)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                                      pack.isHidden 
                                        ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" 
                                        : "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                                    }`}
                                  >
                                    {pack.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    <span>{pack.isHidden ? 'مخفية عن العميل' : 'معروضة بالمتجر'}</span>
                                  </button>
                                </td>

                                <td className="p-4">
                                  <div className="flex items-center justify-center gap-2.5">
                                    <button
                                      id={`pkg-edit-btn-${pack.id}`}
                                      onClick={() => startEditPackage(pack)}
                                      className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-cyan-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                      title="تعديل الباقة"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      id={`pkg-delete-btn-${pack.id}`}
                                      onClick={() => handleDeletePackage(pack.id)}
                                      className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-red-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                      title="حذف الباقة نهائياً"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>

                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {/* 4. COUPONS TAB */}
                {activeTab === 'coupons' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Add Coupon code form */}
                    <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
                      <h3 className="font-bold mb-4 text-sm">توليد وإنشاء كوبون خصم جديد للعملاء</h3>
                      <form onSubmit={handleCreateCoupon} className="flex flex-col sm:flex-row gap-4 items-end">
                        
                        <div className="w-full sm:flex-1">
                          <label className="block text-[11px] font-bold text-neutral-400 mb-1">رمز الكوبون (رمز بالإنجليزية)</label>
                          <input
                            id="coupon-form-code"
                            type="text"
                            required
                            placeholder="مثال: ZWDHA10"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 uppercase ${
                              darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                            }`}
                          />
                        </div>

                        <div className="w-full sm:w-48">
                          <label className="block text-[11px] font-bold text-neutral-400 mb-1">نسبة الخصم المئوية %</label>
                          <input
                            id="coupon-form-percent"
                            type="number"
                            required
                            placeholder="مثال: 10"
                            value={couponPercent}
                            onChange={(e) => setCouponPercent(e.target.value)}
                            className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 ${
                              darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                            }`}
                          />
                        </div>

                        <button
                          id="coupon-form-submit"
                          type="submit"
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs hover:opacity-90 active:scale-95 shrink-0 cursor-pointer"
                        >
                          تفعيل الكوبون فوراً
                        </button>
                      </form>
                    </div>

                    {/* Coupons list */}
                    <div className={`border rounded-2xl overflow-hidden ${darkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                      <table className="w-full text-right text-xs">
                        <thead className={`font-bold ${darkMode ? "bg-neutral-900/50 text-neutral-400" : "bg-neutral-100 text-neutral-700"}`}>
                          <tr>
                            <th className="p-4">رمز الكوبون الترويجي</th>
                            <th className="p-4">قيمة الخصم %</th>
                            <th className="p-4">تاريخ الإنشاء</th>
                            <th className="p-4">العمليات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/10">
                          {coupons.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-neutral-500">
                                لا توجد أي كوبونات خصم منشأة حالياً.
                              </td>
                            </tr>
                          ) : (
                            coupons.map((coupon) => (
                              <tr key={coupon.id} className={darkMode ? "hover:bg-neutral-900/20" : "hover:bg-neutral-50"}>
                                <td className="p-4 font-mono font-bold text-lg text-pink-500 uppercase">{coupon.code}</td>
                                <td className="p-4 font-mono font-bold text-neutral-100">{coupon.discountPercent}% خصم إضافي</td>
                                <td className="p-4 text-[10px] text-neutral-400">{formatDate(coupon.createdAt)}</td>
                                <td className="p-4">
                                  <button
                                    id={`coupon-delete-btn-${coupon.id}`}
                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                    className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-red-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                    title="حذف الكوبون"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

                {/* 5. SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* General Settings Form */}
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                      
                      {/* Section A: Exchange rates */}
                      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/30 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
                        <h3 className="font-bold mb-4 text-xs flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-pink-500" />
                          سعر تحويل العملات مقابل الجنيه المصري (1 EGP)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">سعر الريال السعودي مقابل الجنيه</label>
                            <input
                              id="settings-input-sar"
                              type="text"
                              required
                              value={settRateSar}
                              onChange={(e) => setSettRateSar(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                            <p className="text-[10px] text-neutral-500 mt-1">مثال: 0.08 ريال سعودي لكل جنيه</p>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">سعر الدولار الأمريكي مقابل الجنيه</label>
                            <input
                              id="settings-input-usd"
                              type="text"
                              required
                              value={settRateUsd}
                              onChange={(e) => setSettRateUsd(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                            <p className="text-[10px] text-neutral-500 mt-1">مثال: 0.02 دولار أمريكي لكل جنيه</p>
                          </div>
                        </div>
                      </div>

                      {/* Section B: Homepage counter settings */}
                      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/30 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
                        <h3 className="font-bold mb-4 text-xs flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-pink-500" />
                          إعدادات عدادات الواجهة الرئيسية (التأثير البصري)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">الطلبات المكتملة</label>
                            <input
                              id="settings-input-completed"
                              type="number"
                              required
                              value={settOrdersCount}
                              onChange={(e) => setSettOrdersCount(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">تقييمات العملاء</label>
                            <input
                              id="settings-input-reviews"
                              type="number"
                              required
                              value={settReviewsCount}
                              onChange={(e) => setSettReviewsCount(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">التقييم العام للمتجر</label>
                            <input
                              id="settings-input-avg"
                              type="text"
                              required
                              value={settAvgRating}
                              onChange={(e) => setSettAvgRating(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:border-pink-500 font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section C: Gmail SMTP setup */}
                      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/30 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
                        <h3 className="font-bold mb-4 text-xs flex items-center gap-2">
                          <Mail className="w-4 h-4 text-pink-500" />
                          إعدادات نظام الإيميل والتنبيهات (Gmail SMTP API)
                        </h3>
                        <p className="text-[10px] text-neutral-400 mb-4">يُستخدم هذا النظام لإرسال إشعارات بريد تلقائية بمجرد تسجيل أي عميل لطلب جديد في المتجر.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">SMTP Host</label>
                            <input
                              id="settings-input-smtp-host"
                              type="text"
                              value={settSmtpHost}
                              onChange={(e) => setSettSmtpHost(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">SMTP Port</label>
                            <input
                              id="settings-input-smtp-port"
                              type="text"
                              value={settSmtpPort}
                              onChange={(e) => setSettSmtpPort(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">اسم بريد الإرسال (Gmail)</label>
                            <input
                              id="settings-input-smtp-user"
                              type="email"
                              placeholder="example@gmail.com"
                              value={settSmtpUser}
                              onChange={(e) => setSettSmtpUser(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">كلمة مرور التطبيقات (App Password)</label>
                            <input
                              id="settings-input-smtp-pass"
                              type="password"
                              placeholder="أدخل رمز مرور التطبيقات لـ Gmail"
                              value={settSmtpPass}
                              onChange={(e) => setSettSmtpPass(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">بريد استلام الإشعارات (المسؤول)</label>
                            <input
                              id="settings-input-smtp-receiver"
                              type="email"
                              value={settSmtpReceiver}
                              onChange={(e) => setSettSmtpReceiver(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-6">
                            <label className="flex items-center gap-2 text-xs font-bold select-none cursor-pointer">
                              <input
                                id="settings-input-smtp-secure"
                                type="checkbox"
                                checked={settSmtpSecure}
                                onChange={(e) => setSettSmtpSecure(e.target.checked)}
                                className="rounded border-neutral-800 text-pink-500"
                              />
                              <span>SSL/TLS Secure connection</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Section D: Store payment accounts */}
                      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/30 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
                        <h3 className="font-bold mb-4 text-xs flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-pink-500" />
                          أرقام وعناوين استقبال أموال التحويلات (الدفع عبر المتجر)
                        </h3>
                        <p className="text-[10px] text-neutral-400 mb-4">هذه هي الأرقام والعناوين التي تظهر للعملاء في واجهة الدفع عند اختيارهم الدفع عبر المتجر.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">فودافون كاش (Vodafone Cash)</label>
                            <input
                              id="settings-input-vodafone"
                              type="text"
                              required
                              value={settVodafoneCash}
                              onChange={(e) => setSettVodafoneCash(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">أورنج كاش (Orange Cash)</label>
                            <input
                              id="settings-input-orange"
                              type="text"
                              required
                              value={settOrangeCash}
                              onChange={(e) => setSettOrangeCash(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">اتصالات كاش (Etisalat Cash)</label>
                            <input
                              id="settings-input-etisalat"
                              type="text"
                              required
                              value={settEtisalatCash}
                              onChange={(e) => setSettEtisalatCash(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">WE Pay</label>
                            <input
                              id="settings-input-wepay"
                              type="text"
                              required
                              value={settWePay}
                              onChange={(e) => setSettWePay(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">إنستا باي (عنوان أو رقم InstaPay)</label>
                            <input
                              id="settings-input-instapay"
                              type="text"
                              required
                              value={settInstapay}
                              onChange={(e) => setSettInstapay(e.target.value)}
                              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none font-mono ${
                                darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          id="settings-btn-save"
                          type="submit"
                          className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg shadow-pink-500/10"
                        >
                          حفظ الإعدادات بالكامل
                        </button>
                      </div>

                    </form>

                    {/* Section D: Credentials adjustment */}
                    <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/30 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
                      <h3 className="font-bold mb-4 text-xs flex items-center gap-2">
                        <Key className="w-4 h-4 text-pink-500" />
                        تغيير كلمة مرور الإدارة لوحة التحكم
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                          <label className="block text-[11px] font-bold text-neutral-400 mb-1">كلمة المرور الجديدة (6 أحرف على الأقل)</label>
                          <input
                            id="settings-input-new-pass"
                            type="password"
                            placeholder="أدخل كلمة المرور الجديدة المعززة"
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${
                              darkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                            }`}
                          />
                        </div>
                        <button
                          id="settings-btn-change-pass"
                          type="button"
                          onClick={handleChangePassword}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          تحديث كلمة السر
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
