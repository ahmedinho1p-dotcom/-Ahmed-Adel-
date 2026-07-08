import { MessageCircle, Instagram } from "lucide-react";

export default function FloatingButtons() {
  const whatsappNumber = "01558676497";
  const formattedWhatsappNumber = "201558676497"; // standard Egyptian international format for direct chat link
  const instagramUrl = "https://www.instagram.com/zwdha.eg?igsh=dHU4bWExeGdvZmE0&utm_source=qr";

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4 animate-bounce-slow">
      {/* WhatsApp Floating Button */}
      <a
        id="btn-whatsapp-floating"
        href={`https://wa.me/${formattedWhatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        title="تواصل معنا عبر واتساب"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
        <span className="absolute right-16 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none border border-white/10 font-medium">
          راسلنا على واتساب
        </span>
      </a>

      {/* Instagram Floating Button */}
      <a
        id="btn-instagram-floating"
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        title="تابعنا على إنستقرام"
      >
        <Instagram className="w-7 h-7" />
        <span className="absolute right-16 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none border border-white/10 font-medium">
          تابعنا على إنستغرام
        </span>
      </a>
    </div>
  );
}
