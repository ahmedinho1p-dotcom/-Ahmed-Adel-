import { useState } from "react";
import { ShieldCheck, Flame, Clock, Award, Users, ChevronDown, ChevronUp, Lock, HelpCircle, Mail, Phone } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { motion, AnimatePresence } from "motion/react";

interface CompanyInfoProps {
  darkMode: boolean;
  whatsappNumber?: string;
}

export default function CompanyInfo({ darkMode, whatsappNumber = "01124656914" }: CompanyInfoProps) {
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const cleanPhone = whatsappNumber.trim();
  const waFormat = cleanPhone.startsWith("0") && cleanPhone.length === 11 ? "2" + cleanPhone : cleanPhone;

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "هل خدمات التزويد من Zawdha آمنة على حساباتي؟",
      answer: "نعم، آمنة بنسبة 100%. نعتمد في Zawdha على استراتيجيات وطرق تزويد متطابقة تماماً مع خوارزميات وسياسات منصات التواصل الاجتماعي المختلفة. لا نطلب أبداً كلمات مرور لحساباتك الشخصية، وبالتالي لا يوجد أي احتمال لتعرض حسابك للحظر أو الإغلاق.",
    },
    {
      question: "ما هي سياسة التعويض مدى الحياة للخدمات؟",
      answer: "في Zawdha، نتميز بتقديم ضمان تعويض مدى الحياة على معظم خدماتنا المميزة. في حال حدوث أي نقص طفيف أو تراجع في الأرقام لأي سبب، يمكنك التواصل معنا فوراً عبر الواتساب وسنقوم بإعادة تزويد حسابك مجاناً وبدون أي تكاليف إضافية.",
    },
    {
      question: "ما هي مدة تسليم الخدمة بعد الطلب؟",
      answer: "تختلف مدة التسليم باختلاف الباقة المطلوبة؛ فمعظم باقات إنستقرام وفيسبوك يتم البدء فيها فوراً بعد تأكيد الدفع وتكتمل في غضون دقائق أو ساعات قليلة. خدمات يوتيوب وتفعيل الأرباح تتطلب تزويداً تدريجياً لضمان الأمان الكامل، وتستغرق عادةً من يومين إلى أسبوع كحد أقصى.",
    },
    {
      question: "ما هي طرق الدفع المتاحة للطلبات؟",
      answer: "لتسهيل الأمور على عملائنا في مصر والوطن العربي، نوفر طرق دفع محلية وسريعة مثل: محفظة فودافون كاش (Vodafone Cash)، تطبيق إنستا باي (Instapay)، الحوالات البنكية المباشرة، وحوالات ويسترن يونيون الفورية. بمجرد إرسال طلبك، سيوجهك الدعم للطريقة الأسهل لك.",
    },
    {
      question: "كيف يمكنني تتبع حالة طلبي؟",
      answer: "لا حاجة للقلق أو الانتظار؛ فبمجرد تأكيد طلبك، يتم تعيين ممثل دعم فني خاص بك على الواتساب، يرسل لك لقطات شاشة دورية وإثباتات البدء بانتظام، ويجيب على جميع استفساراتك في أي وقت حتى اكتمال الخدمة تماماً.",
    },
  ];

  const features = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "سياسة التعويض مدى الحياة",
      desc: "نضمن ثبات الخدمات ومستويات الجودة؛ فإذا انخفض العدد بعد شهور، نقوم بتعويض النقص مجاناً بالكامل دون أي شروط.",
      colorClass: "text-pink-500 bg-pink-500/10"
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "أمان وسرية تامة",
      desc: "حساباتك في أيدٍ أمينة؛ جميع الطلبات تُعالج بنظام خارجي آمن تماماً، ولا نطلب كلمات مرور أو بيانات حساسة نهائياً.",
      colorClass: "text-purple-500 bg-purple-500/10"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "دعم فني بشري محترف",
      desc: "خدمة عملاء حية ومباشرة عبر الواتساب متواجدة للرد على طلباتكم وتأكيد دفعكم وبدء التزويد في أقل من 5 دقائق!",
      colorClass: "text-orange-500 bg-orange-500/10"
    },
    {
      icon: <Flame className="w-6 h-6" />,
      title: "تسليم فائق السرعة",
      desc: "نمتلك أحدث السيرفرات العالمية المتخصصة في تزويد الخدمات التفاعلية، مما يضمن البدء التلقائي والفوري لطلبك.",
      colorClass: "text-green-500 bg-green-500/10"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "طلب آمن وسهل",
      desc: "لا يتطلب متجرنا تسجيل أي حسابات معقدة أو ربط بطاقات مصرفية خطيرة. أدخل بياناتك البسيطة، وأرسل الطلب فورياً.",
      colorClass: "text-cyan-500 bg-cyan-500/10"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "خبرة وسنوات من الريادة",
      desc: "قدمنا حلولاً تسويقية متميزة وساعدنا ما يزيد عن 10,000 حساب متجر ومؤثر على تحقيق غاياتهم التجارية.",
      colorClass: "text-indigo-500 bg-indigo-500/10"
    }
  ];

  return (
    <div className={`py-16 md:py-24 transition-colors duration-300 relative overflow-hidden ${
      darkMode ? "bg-black text-white" : "bg-neutral-50 text-neutral-900"
    }`}>
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Title */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16" delay={0.1}>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-pink-500 bg-pink-500/10 px-3.5 py-1.5 rounded-full border border-pink-500/10">
            ✨ تعرف علينا أكثر
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-4">
            لماذا يثق الآلاف في Zawdha؟
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 mt-4 leading-relaxed max-w-2xl mx-auto">
            نحن لسنا مجرد موقع بيع خدمات عشوائي، بل شركة تسويق رقمي متكاملة تمتلك خبرة تفوق 5 سنوات في تزويد وتهيئة حسابات التواصل الاجتماعي لأكبر الشركات والمؤثرين في الشرق الأوسط.
          </p>
        </ScrollReveal>

        {/* Feature Bento Grid (Why Choose Us) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {features.map((feat, index) => (
            <ScrollReveal
              key={index}
              delay={index * 0.1}
              direction="up"
              distance={30}
            >
              <motion.div
                whileHover={{ y: -6, scale: 1.025 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                className={`p-6 rounded-2xl border h-full transition-all duration-300 ${
                  darkMode 
                    ? "bg-[#0b0b0c]/80 border-neutral-800 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/[0.02]" 
                    : "bg-white border-neutral-200/60 shadow-sm hover:border-pink-500/20 hover:shadow-lg hover:shadow-pink-500/[0.03]"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feat.colorClass}`}>
                  {feat.icon}
                </div>
                <h3 className={`text-base font-extrabold mb-2 ${darkMode ? "text-white" : "text-neutral-850"}`}>{feat.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="mb-24">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
            <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 text-pink-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">الأسئلة الشائعة والاستفسارات</h2>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">جمعنا لك أهم الأسئلة التي تطرأ في أذهان عملائنا الجدد لتطمئن وتطلب بثقة.</p>
          </ScrollReveal>

          <ScrollReveal className="space-y-3 max-w-3xl mx-auto" delay={0.2} direction="none">
            {faqs.map((faq, index) => (
              <ScrollReveal
                key={index}
                delay={index * 0.05}
                direction="up"
                distance={15}
              >
                <div
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    darkMode ? "border-neutral-800/80 bg-neutral-900/15" : "border-neutral-200/80 bg-white"
                  }`}
                >
                  <button
                    id={`faq-btn-${index}`}
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-right flex items-center justify-between font-extrabold text-xs sm:text-sm select-none hover:bg-neutral-800/5 dark:hover:bg-neutral-800/10 transition-colors"
                  >
                    <span className={darkMode ? "text-white" : "text-neutral-900"}>{faq.question}</span>
                    <span className="w-7 h-7 rounded-lg bg-neutral-800/5 dark:bg-neutral-800/40 flex items-center justify-center text-neutral-500 shrink-0">
                      {openFaqIndex === index ? (
                        <ChevronUp className="w-4 h-4 text-pink-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {openFaqIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className={`p-5 pt-0 text-xs sm:text-sm leading-relaxed border-t ${
                          darkMode ? "border-neutral-800/50 text-neutral-300" : "border-neutral-100 text-neutral-600"
                        }`}>
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            ))}
          </ScrollReveal>
        </div>

        {/* Legal Agreements (Terms & Privacy) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          
          {/* Terms of Service */}
          <ScrollReveal
            delay={0.1}
            direction="left"
            distance={30}
            className={`p-6 sm:p-8 rounded-3xl border ${darkMode ? "bg-neutral-900/15 border-neutral-800/60" : "bg-white border-neutral-250/50"}`}
          >
            <h3 className="text-xs sm:text-sm font-extrabold text-pink-500 mb-4 flex items-center gap-1.5">🛡️ شروط الخدمة والقوانين العامة</h3>
            <div className="text-xs space-y-3 text-neutral-400 leading-relaxed">
              <p>• بطلبك من متجر Zawdha، فإنك توافق ضمنياً على أنك قرأت وفهمت جميع تفاصيل وشروط الخدمة المحددة لكل باقة.</p>
              <p>• يُمنع منعاً باتاً تحويل حسابك أو تغيير المعرّف (Username) الخاص بالصفحة أثناء عملية التزويد النشطة، وإلا سيعتبر الطلب مكتملاً وتلقائياً.</p>
              <p>• نحن لا نتحمل مسؤولية أي نقص في الخدمات التي يتم طلبها بشكل متزامن من مزودين آخرين، حيث أن عدادنا يبدأ من لحظة بدء تنفيذنا للطلب.</p>
            </div>
          </ScrollReveal>

          {/* Privacy Policy */}
          <ScrollReveal
            delay={0.2}
            direction="right"
            distance={30}
            className={`p-6 sm:p-8 rounded-3xl border ${darkMode ? "bg-neutral-900/15 border-neutral-800/60" : "bg-white border-neutral-250/50"}`}
          >
            <h3 className="text-xs sm:text-sm font-extrabold text-pink-500 mb-4 flex items-center gap-1.5">🔒 سياسة الخصوصية وحماية البيانات</h3>
            <div className="text-xs space-y-3 text-neutral-400 leading-relaxed">
              <p>• نلتزم في Zawdha التزاماً تاماً وبأعلى المعايير القانونية بالحفاظ على خصوصية وسرية بيانات حسابات عملائنا الكرام.</p>
              <p>• لا نشارك اسمك، رقم الواتساب، رابط الحساب، أو الباقات التي تطلبها مع أي جهة خارجية أو أطراف أخرى تحت أي ظرف.</p>
              <p>• نعمل دائماً في الخفاء وبطرق تزويد غير مرئية؛ بحيث لا يمكن لأي من متابعيك أو منافسيك معرفة أنك تستخدم خدمات تزويد.</p>
            </div>
          </ScrollReveal>

        </div>

        {/* Contact Information Cards */}
        <ScrollReveal
          delay={0.1}
          direction="up"
          distance={40}
          className={`p-8 sm:p-10 rounded-3xl border text-center relative overflow-hidden group ${
            darkMode 
              ? "bg-gradient-to-r from-purple-900/10 via-pink-900/10 to-transparent border-neutral-800" 
              : "bg-white border-neutral-200 shadow-sm"
          }`}
        >
          {/* Subtle group hover glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <h3 className={`text-lg sm:text-xl font-black mb-2 ${darkMode ? "text-white" : "text-neutral-850"}`}>هل لديك مشروع خاص أو طلب تفصيلي؟</h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
            نوفر عروض أسعار خاصة وباقات تزويد عملاقة بملايين المتابعين للشركات والمؤسسات والمسوقين المحترفين. لا تتردد في الاتصال بنا!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 relative z-10">
            <motion.a
              id="info-contact-whatsapp"
              href={`https://wa.me/${waFormat}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold px-6 py-3.5 rounded-xl shadow-md text-sm transition-all"
            >
              <Phone className="w-5 h-5 fill-white" />
              <span>واتساب: {cleanPhone}</span>
            </motion.a>
            <motion.a
              id="info-contact-email"
              href="mailto:support@zwdha.com"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 font-bold px-6 py-3.5 rounded-xl border text-sm transition-all ${
                darkMode ? "border-neutral-800 hover:bg-neutral-800 text-white" : "border-neutral-200 hover:bg-neutral-100 text-neutral-900"
              }`}
            >
              <Mail className="w-5 h-5" />
              <span>support@zwdha.com</span>
            </motion.a>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
