import { Phone, Mail, MessageCircle, Heart, ShieldCheck } from "lucide-react";

interface FooterProps {
  setView: (v: 'home' | 'info' | 'admin') => void;
  darkMode: boolean;
  whatsappNumber?: string;
}

export default function Footer({ setView, darkMode, whatsappNumber = "01124656914" }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const cleanPhone = whatsappNumber.trim();
  const waFormat = cleanPhone.startsWith("0") && cleanPhone.length === 11 ? "2" + cleanPhone : cleanPhone;

  return (
    <footer className={`border-t transition-colors duration-300 ${
      darkMode ? "bg-neutral-950 border-neutral-900 text-neutral-400" : "bg-neutral-50 border-neutral-200 text-neutral-600"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Column 1: Store Intro */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center">
                <span className="text-white font-black text-sm">Z</span>
              </div>
              <span className={`text-lg font-medium ${darkMode ? "text-white" : "text-neutral-900"}`}>
                Zawdha
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              المنصة العربية الأولى لتزويد خدمات السوشيال ميديا ومواقع التواصل الاجتماعي بجودة استثنائية وسرعة فائقة. زود تواجدك الرقمي وعزز ثقة عملائك في دقائق!
            </p>
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              darkMode ? "bg-neutral-900/50 border-neutral-800 text-neutral-300" : "bg-white border-neutral-200 text-neutral-700"
            }`}>
              <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-green-500 mb-0.5">ضمان التعويض والآمان</p>
                <p>جميع خدماتنا آمنة تماماً ولا تشكل أي خطر على حساباتكم، ومعززة بضمان تعويض مجاني.</p>
              </div>
            </div>
          </div>

          {/* Column 2: Fast Navigation */}
          <div className="space-y-4">
            <h3 className={`text-sm font-extrabold uppercase tracking-widest ${darkMode ? "text-white" : "text-neutral-900"}`}>
              روابط سريعة
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => setView('home')} 
                  className="hover:text-pink-500 transition-colors text-right w-full"
                >
                  الرئيسية ومتجر الخدمات
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView('info')} 
                  className="hover:text-pink-500 transition-colors text-right w-full"
                >
                  لماذا تختار Zawdha؟ (من نحن)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView('info')} 
                  className="hover:text-pink-500 transition-colors text-right w-full"
                >
                  الأسئلة الشائعة شروط الخدمة
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Ordering & Payment System Notice */}
          <div className="space-y-4">
            <h3 className={`text-sm font-extrabold uppercase tracking-widest ${darkMode ? "text-white" : "text-neutral-900"}`}>
              نظام معالجة الطلبات
            </h3>
            <p className="text-sm leading-relaxed">
              🚀 <span className="font-bold text-neutral-300">بدون تسجيل حساب:</span> يمكنك طلب الخدمة في 10 ثوانٍ فقط وسيقوم فريقنا بمتابعة طلبك.
            </p>
            <div className={`p-3 rounded-lg border text-xs ${
              darkMode ? "bg-neutral-900/40 border-neutral-800 text-pink-400" : "bg-neutral-100 border-neutral-200 text-purple-700"
            }`}>
              <p className="font-extrabold">🚨 طريقة الدفع والتواصل:</p>
              <p className="mt-1 font-medium">بعد إرسال طلبك بنجاح، سيقوم فريقنا بالتواصل الفوري معك عبر <span className="underline">الواتساب</span> لإرسال طرق الدفع المتاحة وتفعيل طلبك.</p>
            </div>
          </div>

          {/* Column 4: Official Contacts */}
          <div className="space-y-4">
            <h3 className={`text-sm font-extrabold uppercase tracking-widest ${darkMode ? "text-white" : "text-neutral-900"}`}>
              معلومات الاتصال والدعم
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-pink-500 shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:text-pink-500 transition-colors font-mono">{cleanPhone}</a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#25d366] shrink-0" />
                <a href={`https://wa.me/${waFormat}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#25d366] transition-colors font-mono">{cleanPhone} (واتساب)</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-pink-500 shrink-0" />
                <a href="mailto:support@zwdha.com" className="hover:text-pink-500 transition-colors font-mono">support@zwdha.com</a>
              </li>
            </ul>
          </div>

        </div>

        <hr className={`my-10 ${darkMode ? "border-neutral-900" : "border-neutral-200"}`} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {currentYear} Zawdha. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-1">
            <span>تم بكل حب</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>لخدمة عملائنا في مصر والخليج العربي</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
