export interface Package {
  id: string;
  name: string;
  platform: 'Facebook' | 'Instagram' | 'YouTube' | 'Google Reviews' | 'TikTok';
  followersCount: string;
  price: number;
  deliveryTime: string;
  description: string;
  gift?: string | null;
  badge?: string | null; // "Popular" | "Best Seller" | "Premium"
  isFeatured: boolean;
  isHidden: boolean;
  discount?: number | null; // e.g. 15 for 15% off
  sortOrder: number;
  createdAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  whatsappNumber: string;
  pageUrl: string;
  packageId: string;
  packageName: string;
  platform: string;
  price: number;
  currency: string;
  status: 'New' | 'Contacted' | 'Completed' | 'Cancelled';
  paymentMethod?: string | null;
  paymentSender?: string | null;
  paymentAmount?: number | null;
  paymentScreenshot?: string | null;
  paymentStatus?: string | null;
  internalNotes?: string | null;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  createdAt: string;
}

export interface StoreSettings {
  admin_username?: string;
  currency_default?: string; // "EGP" | "SAR" | "USD"
  rate_sar?: string;
  rate_usd?: string;
  stat_completed_orders?: string;
  stat_customer_reviews?: string;
  stat_average_rating?: string;
  smtp_host?: string;
  smtp_port?: string;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_secure?: string;
  smtp_receiver?: string;
  vodafone_cash_number?: string;
  orange_cash_number?: string;
  etisalat_cash_number?: string;
  we_pay_number?: string;
  instapay_number?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  statusNew: number;
  statusContacted: number;
  statusCompleted: number;
  statusCancelled: number;
  totalRevenue: number;
  platforms: {
    Facebook: number;
    Instagram: number;
    YouTube: number;
    "Google Reviews": number;
    TikTok?: number;
    [key: string]: number | undefined;
  };
  totalPackages: number;
}
