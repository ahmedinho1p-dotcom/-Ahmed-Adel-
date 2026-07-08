import { useState } from "react";
import { ShieldCheck, Flame, Clock, Award, Users, ChevronDown, ChevronUp, Lock, RefreshCw, HelpCircle, Mail, Phone } from "lucide-react";

interface CompanyInfoProps {
  darkMode: boolean;
}

export default function CompanyInfo({ darkMode }: CompanyInfoProps) {
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "هل خدمات التزويد من زودها آمنة على حساباتي؟",
      answer: "نعم، آمنة بنسبة 100%. نعتمد في زودها على استراتيجيات وطرق تزويد متطابقة تماماً مع خوارزميات وسياسات منصات التواصل الاجتماعي المختلفة. لا نطلب أبداً كلمات مرور لحساباتك الشخصية، وبالتالي لا يوجد أي احتمال لتعرض حسابك للحظر أو الإغلاق.",
    },
    {
      question: "ما هي سياسة التعويض مدى الحياة للخدمات؟",
      answer: "في زودها، نتميز بتقديم ضمان تعويض مدى الحياة على معظم خدماتنا المميزة. في حال حدوث أي نقص طفيف أو تراجع في الأرقام لأي سبب، يمكنك التواصل معنا فوراً عبر الواتساب وسنقوم بإعادة تزويد حسابك مجاناً وبدون أي تكاليف إضافية.",
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

  return (
    <div className={`py-12 md:py-20 transition-colors duration-300 ${
      darkMode ? "bg-black text-white" : "bg-neutral-50 text-neutral-900"
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-pink-500 bg-pink-500/10 px-3.5 py-1.5 rounded-full">
            تعرف علينا أكثر
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-4">
            لماذا يثق الآلاف في زودها ZWDHA SMM؟
          </h1>
          <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
            نحن لسنا مجرد موقع بيع خدمات عشوائي، بل شركة تسويق رقمي متكاملة تمتلك خبرة تفوق 5 سنوات في تزويد وتهيئة حسابات التواصل الاجتماعي لأكبر الشركات والمؤثرين في الشرق الأوسط.
          </p>
        </div>

        {/* Feature Bento Grid (Why Choose Us) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          
          <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200 shadow-sm"}`}>
            <div className="w-11 h-11 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">سياسة التعويض مدى الحياة</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              نضمن ثبات الخدمات ومستويات الجودة؛ فإذا انخفض العدد بعد شهور، نقوم بتعويض النقص مجاناً بالكامل دون أي شروط.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200 shadow-sm"}`}>
            <div className="w-11 h-11 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">أمان وسرية تامة</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              حساباتك في أيدٍ أمينة؛ جميع الطلبات تُعالج بنظام خارجي آمن تماماً، ولا نطلب كلمات مرور أو بيانات حساسة نهائياً.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200 shadow-sm"}`}>
            <div className="w-11 h-11 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">دعم فني بشري محترف</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              خدمة عملاء حية ومباشرة عبر الواتساب متواجدة للرد على طلباتكم وتأكيد دفعكم وبدء التزويد في أقل من 5 دقائق!
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200 shadow-sm"}`}>
            <div className="w-11 h-11 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">تسليم فائق السرعة</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              نمتلك أحدث السيرفرات العالمية المتخصصة في تزويد الخدمات التفاعلية، مما يضمن البدء التلقائي والفوري لطلبك.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200 shadow-sm"}`}>
            <div className="w-11 h-11 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">طلب آمن وسهل</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              لا يتطلب متجرنا تسجيل أي حسابات معقدة أو ربط بطاقات مصرفية خطيرة. أدخل بياناتك البسيطة، وأرسل الطلب فورياً.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200 shadow-sm"}`}>
            <div className="w-11 h-11 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">خبرة وسنوات من الريادة</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              قدمنا حلولاً تسويقية متميزة وساعدنا ما يزيد عن 10,000 حساب متجر ومؤثر على تحقيق غاياتهم التجارية.
            </p>
          </div>

        </div>

        {/* FAQ Accordion */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <HelpCircle className="w-10 h-10 text-pink-500 mx-auto" />
            <h2 className="text-2xl font-black mt-3">الأسئلة الشائعة والاستفسارات</h2>
            <p className="text-xs text-neutral-400 mt-1">جمعنا لك أهم الأسئلة التي تطرأ في أذهان عملائنا الجدد لتطمئن وتطلب بثقة.</p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                  darkMode ? "border-neutral-800 bg-neutral-900/20" : "border-neutral-200 bg-white"
                }`}
              >
                <button
                  id={`faq-btn-${index}`}
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-right flex items-center justify-between font-bold text-sm select-none hover:bg-neutral-800/10 transition-colors"
                >
                  <span className={darkMode ? "text-white" : "text-neutral-900"}>{faq.question}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-4 h-4 text-pink-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className={`p-5 pt-0 text-xs leading-relaxed border-t ${
                    darkMode ? "border-neutral-800/50 text-neutral-300" : "border-neutral-100 text-neutral-600"
                  }`}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legal Agreements (Terms & Privacy) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Terms of Service */}
          <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/30 border-neutral-800" : "bg-white border-neutral-200"}`}>
            <h3 className="text-sm font-extrabold text-pink-500 mb-3 flex items-center gap-1.5">🛡️ شروط الخدمة والقوانين العامة</h3>
            <div className="text-xs space-y-2.5 text-neutral-400 leading-relaxed">
              <p>• بطلبك من متجر زودها، فإنك توافق ضمنياً على أنك قرأت وفهمت جميع تفاصيل وشروط الخدمة المحددة لكل باقة.</p>
              <p>• يُمنع منعاً باتاً تحويل حسابك أو تغيير المعرّف (Username) الخاص بالصفحة أثناء عملية التزويد النشطة، وإلا سيعتبر الطلب مكتملاً وتلقائياً.</p>
              <p>• نحن لا نتحمل مسؤولية أي نقص في الخدمات التي يتم طلبها بشكل متزامن من مزودين آخرين، حيث أن عدادنا يبدأ من لحظة بدء تنفيذنا للطلب.</p>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className={`p-6 rounded-2xl border ${darkMode ? "bg-neutral-900/30 border-neutral-800" : "bg-white border-neutral-200"}`}>
            <h3 className="text-sm font-extrabold text-pink-500 mb-3 flex items-center gap-1.5">🔒 سياسة الخصوصية وحماية البيانات</h3>
            <div className="text-xs space-y-2.5 text-neutral-400 leading-relaxed">
              <p>• نلتزم في زودها التزاماً تاماً وبأعلى المعايير القانونية بالحفاظ على خصوصية وسرية بيانات حسابات عملائنا الكرام.</p>
              <p>• لا نشارك اسمك، رقم الواتساب، رابط الحساب، أو الباقات التي تطلبها مع أي جهة خارجية أو أطراف أخرى تحت أي ظرف.</p>
              <p>• نعمل دائماً في الخفاء وبطرق تزويد غير مرئية؛ بحيث لا يمكن لأي من متابعيك أو منافسيك معرفة أنك تستخدم خدمات تزويد.</p>
            </div>
          </div>

        </div>

        {/* Contact Information Cards */}
        <div className={`p-8 rounded-2xl border text-center ${
          darkMode ? "bg-gradient-to-r from-purple-900/10 via-pink-900/10 to-transparent border-neutral-800" : "bg-white border-neutral-200 shadow-sm"
        }`}>
          <h3 className="text-lg font-black mb-1">هل لديك مشروع خاص أو طلب تفصيلي؟</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            نوفر عروض أسعار خاصة وباقات تزويد عملاقة بملايين المتابعين للشركات والمؤسسات والمسوقين المحترفين. لا تتردد في الاتصال بنا!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6">
            <a
              id="info-contact-whatsapp"
              href="https://wa.me/201558676497"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold px-5 py-3 rounded-xl shadow-md text-sm transition-all"
            >
              <Phone className="w-4.5 h-4.5 fill-white" />
              <span>واتساب: 01558676497</span>
            </a>
            <a
              id="info-contact-email"
              href="mailto:support@zwdha.com"
              className={`flex items-center gap-2 font-bold px-5 py-3 rounded-xl border text-sm transition-all ${
                darkMode ? "border-neutral-800 hover:bg-neutral-800 text-white" : "border-neutral-200 hover:bg-neutral-100 text-neutral-900"
              }`}
            >
              <Mail className="w-4.5 h-4.5" />
              <span>الإيميل: support@zwdha.com</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
