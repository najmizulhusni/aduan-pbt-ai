import React, { useState, useCallback, useRef, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2, 
  Trash2,
  Building2,
  Send,
  Info,
  ShieldCheck,
  Mail,
  MessageCircle,
  MapPin,
  Download,
  ExternalLink,
  Phone,
  HelpCircle,
  X,
  Calendar,
  Layers,
  ChevronRight,
  ClipboardEdit,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";

interface ContactInfo {
  email: string;
  whatsapp: string;
  website: string;
  phone: string;
}

interface AIResponse {
  formalLetter: string;
  emailTemplate: string;
  contactInfo: ContactInfo;
  problemTitle: string;
  department: string;
  severityScore: number;
  impactAnalysis: string;
  technicalNotes: string[];
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [councilName, setCouncilName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [userName, setUserName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [editableLetter, setEditableLetter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTatacara, setShowTatacara] = useState(false);
  const [lang, setLang] = useState<'ms' | 'en'>('ms');
  const [showApp, setShowApp] = useState(false);
  
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const todayDate = new Date().toLocaleDateString(lang === 'ms' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'long', year: 'numeric' });

  const translations = {
    ms: {
      guide: "Panduan",
      beta: "BETA 2030",
      headline: "Suara Rakyat, Tindakan PBT",
      subheadline: "Transformasikan aduan anda kepada laporan teknikal profesional. AI membantu anda menapis data dan menghubungi pihak berkuasa dalam sesaat.",
      councilLabel: "Nama PBT Kawasan",
      councilPlaceholder: "Cth: MBIP, MBSA, DBKL",
      locationLabel: "Lokasi Terperinci",
      locationPlaceholder: "Cth: Taman Universiti, Skudai",
      nameLabel: "Nama Pengadu (Tandatangan)",
      namePlaceholder: "Masukkan nama penuh anda",
      uploadLabel: "Bukti Gambar Kerosakan",
      uploadButton: "Muat naik di sini",
      uploadSize: "Saiz Maksimum 10MB",
      replaceImage: "Ganti Gambar",
      generateBtn: "Jana Analisis Pintar",
      generatingBtn: "Menjalankan Analisis AI...",
      techInfoTitle: "Teknologi Google Gemini",
      techInfoDesc: "Sistem menggunakan Vision AI untuk mengaudit kerosakan fizikal dan menjana laporan teknikal mengikut piawaian PBT.",
      hubTitle: "Hub Keputusan Strategik",
      severityLabel: "Skor Kerosakan",
      qualityLabel: "Penarafan Kualiti",
      impactLabel: "Analisis Impak & Risiko",
      statusLabel: "Status Persekitaran",
      auditTitle: "Audit Teknikal Visual",
      emailLabel: "Emel PBT",
      whatsappLabel: "WhatsApp",
      officialDoc: "Dokumen Rasmi",
      copyBtn: "Salin Laporan",
      copiedBtn: "Salin!",
      pdfBtn: "PDF",
      actionBarReady: "Sedia Untuk Menghantar",
      sendEmailBtn: "Hantar via Emel",
      sendWsBtn: "WhatsApp",
      howToTitle: "Tatacara Penggunaan",
      howToSub: "Portal Kerjasama Komuniti",
      step1T: "Muat Naik Visual",
      step1D: "Ambil gambar kerosakan secara jelas sebagai bahan bukti utama.",
      step2T: "Analisis Kecerdasan",
      step2D: "Sistem AI akan mengaudit kerosakan dan mengenalpasti jabatan PBT yang tepat.",
      step3T: "Semakan & Edit",
      step3D: "Semak draf surat rasmi yang dijana dan lakukan pindaan jika perlu.",
      step4T: "Tindakan Pantas",
      step4D: "Hantar laporan melalui emel atau WhatsApp secara terus kepada agensi.",
      understandBtn: "FAHAM & MULAKAN",
      heroTitle: "Revolusi Audit Infrastruktur Awam",
      heroSub: "Platform AI pertama di Malaysia yang membolehkan rakyat memulakan tindakan sivik dalam masa saat. Snap, Analisis, dan Lapor.",
      heroCta: "Mula Lapor Sekarang",
      watchDemo: "Lihat Tatacara",
      problemTitle: "Pemerkasaan Komuniti & PBT",
      problemText: "AduanPBT.ai direka untuk menyokong aspirasi Malaysia Madani dengan merapatkan jurang antara suara rakyat dan kecekapan operasi PBT. Kami membantu komuniti membuat laporan yang berkualiti tinggi dan membantu PBT memproses data dengan lebih pantas.",
      statsUserLabel: "Potensi Impak (DOSM)",
      statsReportLabel: "Kepantasan Laporan",
      statsCouncilLabel: "PBT Seluruh Malaysia",
      statsAccuracyLabel: "Kos Laporan",
      statsUserVal: "34.1J",
      statsReportVal: "< 1 Min",
      statsCouncilVal: "155",
      statsAccuracyVal: "RM 0",
      feature1: "Audit Automatik",
      feature2: "Hubungan PBT",
      feature3: "Draf Surat Rasmi",
      syncTitle: "Sinkronisasi Komuniti",
      syncDesc: "Laporan pintar dihantar ke Majlis Perbandaran.",
      verifiedAudit: "AUDIT TERVERIFIKASI",
      malaysiaPbt: "PBT MALAYSIA",
      communitySync: "SINKRONISASI KOMUNITI",
      reportSent: "Laporan dihantar ke Majlis.",
      footerRights: "Hak Cipta Terpelihara.",
      errorImage: "Sila muat naik gambar kerosakan.",
      errorCouncil: "Sila nyatakan nama PBT (cth: MBIP, MBSA).",
      errorGen: "Gagal menjana analisis.",
      errorGeneric: "Gagal menjana analisis. Sila pastikan gambar dan nama PBT adalah tepat.",
      loadingSteps: [
        "Menganalisis imej visual...",
        "Mengecam kerosakan infrastruktur...",
        "Menilai tahap keselamatan awam...",
        "Mencari info perhubungan PBT...",
        "Menjana draf surat rasmi..."
      ]
    },
    en: {
      guide: "Guide",
      beta: "BETA 2030",
      headline: "Public Voice, Council Action",
      subheadline: "Transform your complaints into professional technical reports. AI helps you filter data and contact authorities in seconds.",
      councilLabel: "Local Council Name",
      councilPlaceholder: "E.g.: MBIP, MBSA, DBKL",
      locationLabel: "Detailed Location",
      locationPlaceholder: "E.g.: Taman Universiti, Skudai",
      nameLabel: "Reporter Name (Signature)",
      namePlaceholder: "Enter your full name",
      uploadLabel: "Damage Image Evidence",
      uploadButton: "Upload here",
      uploadSize: "Maximum Size 10MB",
      replaceImage: "Replace Image",
      generateBtn: "Generate Smart Analysis",
      generatingBtn: "Running AI Analysis...",
      techInfoTitle: "Google Gemini Technology",
      techInfoDesc: "The system uses Vision AI to audit physical damage and generate technical reports according to council standards.",
      hubTitle: "Strategic Decision Hub",
      severityLabel: "Damage Score",
      qualityLabel: "Quality Rating",
      impactLabel: "Impact & Risk Analysis",
      statusLabel: "Environment Status",
      auditTitle: "Visual Technical Audit",
      emailLabel: "Council Email",
      whatsappLabel: "WhatsApp",
      officialDoc: "Official Document",
      copyBtn: "Copy Report",
      copiedBtn: "Copied!",
      pdfBtn: "PDF",
      actionBarReady: "Ready to Send",
      sendEmailBtn: "Send via Email",
      sendWsBtn: "WhatsApp",
      howToTitle: "How to Use",
      howToSub: "Community Collaboration Portal",
      step1T: "Upload Visual",
      step1D: "Take a clear picture of the damage as primary evidence.",
      step2T: "Intelligence Analysis",
      step2D: "The AI system will audit the damage and identify the precise council department.",
      step3T: "Review & Edit",
      step3D: "Review the generated formal letter draft and make amendments if necessary.",
      step4T: "Rapid Action",
      step4D: "Send the report via email or WhatsApp directly to the agency.",
      understandBtn: "UNDERSTAND & START",
      heroTitle: "Revolutionizing Public Audit",
      heroSub: "Malaysia's first AI platform empowering citizens to trigger civic action in seconds. Snap, Analyze, and Report.",
      heroCta: "Start Reporting",
      watchDemo: "How it Works",
      problemTitle: "Empowering Community & PBT",
      problemText: "AduanPBT.ai is designed to support the Malaysia Madani aspiration by bridging the gap between citizen voices and PBT operational efficiency. We help communities create high-quality reports and assist councils in processing data faster.",
      statsUserLabel: "Impact Potential (DOSM)",
      statsReportLabel: "Report Speed",
      statsCouncilLabel: "Malaysia-wide PBT",
      statsAccuracyLabel: "Report Cost",
      statsUserVal: "34.1M",
      statsReportVal: "< 1 Min",
      statsCouncilVal: "155",
      statsAccuracyVal: "RM 0",
      feature1: "Automated Audit",
      feature2: "Council Liaison",
      feature3: "Legal Drafting",
      syncTitle: "Community Sync",
      syncDesc: "Smart report sent to Majlis Perbandaran.",
      verifiedAudit: "VERIFIED AUDIT",
      malaysiaPbt: "MALAYSIA PBT",
      communitySync: "COMMUNITY SYNC",
      reportSent: "Report sent to Council.",
      footerRights: "All Rights Reserved.",
      errorImage: "Please upload a damage image.",
      errorCouncil: "Please specify council name (e.g., MBIP, MBSA).",
      errorGen: "Failed to generate analysis.",
      errorGeneric: "Failed to generate analysis. Please ensure the image and council name are accurate.",
      loadingSteps: [
        "Analyzing visual images...",
        "Recognizing infrastructure damage...",
        "Assessing public safety level...",
        "Finding council contact info...",
        "Generating formal letter draft..."
      ]
    }
  };

  const t = translations[lang];

  const loadingSteps = t.loadingSteps;

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (result?.formalLetter) {
      setEditableLetter(result.formalLetter);
    }
  }, [result]);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Sila muat naik fail imej.");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError("Fail terlalu besar. Maksimum 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setError(null);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const generateComplaint = async () => {
    if (!image) {
      setError("Sila muat naik gambar kerosakan.");
      return;
    }

    if (!councilName.trim()) {
      setError("Sila nyatakan nama PBT (cth: MBIP, MBSA).");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image,
          councilName,
          locationName,
          userName,
          todayDate,
          language: lang
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menjana analisis.");
      }

      const data = await response.json() as AIResponse;
      setResult(data);
      setRecipientEmail(data.contactInfo?.email || "");
      setRecipientPhone(data.contactInfo?.whatsapp || data.contactInfo?.phone || "");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menjana analisis. Sila pastikan gambar dan nama PBT adalah tepat.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!editableLetter) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(editableLetter, 180);
    doc.text(splitText, 15, 20);
    doc.save(`Surat_Aduan_${councilName.replace(/\s+/g, '_')}.pdf`);
  };

  const sendEmail = () => {
    if (!result) return;
    const subject = encodeURIComponent(`ADUAN: ${result.problemTitle} - ${councilName}`);
    const body = encodeURIComponent(result.emailTemplate + "\n\n(Sila rujuk surat rasmi dalam lampiran PDF)");
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  };

  const sendWhatsApp = () => {
    if (!result) return;
    const text = encodeURIComponent(result.emailTemplate);
    const cleanPhone = recipientPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('60') ? cleanPhone : `60${cleanPhone}`;
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
  };

  const copyText = () => {
    if (editableLetter) {
      navigator.clipboard.writeText(editableLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans text-slate-900" id="sleek-dashboard">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 md:px-12 py-4 flex items-center justify-between shadow-sm z-50 sticky top-0 shrink-0">
        {isGenerating && (
          <motion.div 
            className="absolute bottom-0 left-0 h-1 bg-brand-600 z-[60]"
            initial={{ width: 0 }}
            animate={{ width: `${(loadingStep + 1) * 20}%` }}
            transition={{ duration: 0.5 }}
          />
        )}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setShowApp(false)}
            className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-200 cursor-pointer hover:rotate-12 transition-transform"
          >
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            AduanPBT<span className="text-brand-600">.ai</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <div className="flex bg-slate-100 p-1 rounded-xl items-center gap-1">
            <button 
              onClick={() => setLang('ms')}
              className={`px-3 py-1.5 rounded-lg text-[10px] transition-all font-bold ${lang === 'ms' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              BM
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg text-[10px] transition-all font-bold ${lang === 'en' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              EN
            </button>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <button 
            onClick={() => setShowTatacara(true)}
            className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-all hover:bg-brand-50 px-3 py-1.5 rounded-lg"
          >
            <HelpCircle size={18} />
            {t.guide}
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ring-1 ring-slate-200">{t.beta}</span>
        </nav>

        {/* Mobile Language Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={() => setLang(lang === 'ms' ? 'en' : 'ms')} className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg uppercase">
            {lang === 'ms' ? 'EN' : 'BM'}
          </button>
        </div>
      </header>

      {!showApp ? (
        <AnimatePresence mode="wait">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-32 px-6 md:px-12 bg-white">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-brand-50 rounded-full blur-[120px] opacity-60 z-0"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-[100px] opacity-40 z-0"></div>
              
              <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-xs font-bold mb-8 ring-1 ring-brand-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                    </span>
                    Vision 2030 Civic-Tech
                  </div>
                  <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] mb-8">
                    {t.heroTitle.split(' ').map((word, i) => (
                      <span key={i} className={i === 2 ? 'text-brand-600 block' : ''}>{word} </span>
                    ))}
                  </h1>
                  <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 leading-relaxed max-w-xl">
                    {t.heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setShowApp(true)}
                      className="h-16 px-10 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-brand-600 transition-all active:scale-95 shadow-2xl shadow-brand-200 text-sm group"
                    >
                      {t.heroCta}
                      <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => setShowTatacara(true)}
                      className="h-16 px-10 bg-white border-2 border-slate-100 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-3 hover:border-brand-200 transition-all active:scale-95 text-sm"
                    >
                      <HelpCircle />
                      {t.watchDemo}
                    </button>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-gradient-to-tr from-brand-600 to-emerald-500 rounded-[40px] opacity-10 blur-2xl"></div>
                  <div className="relative bg-slate-50 p-6 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden min-h-[440px] flex flex-col">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-100 italic shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">admin.aduanpbt.ai</div>
                    </div>

                    <div className="flex-1 grid grid-cols-12 gap-4">
                      {/* Dashboard Sidebar Mock */}
                      <div className="col-span-3 space-y-3">
                         {[1,2,3,4].map(i => <div key={i} className="h-2 w-full bg-slate-200 rounded-full"></div>)}
                      </div>

                      {/* Main UI Area */}
                      <div className="col-span-9 space-y-4">
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                              <Building2 size={20} />
                            </div>
                            <div className="space-y-1">
                              <div className="h-2 w-24 bg-slate-200 rounded-full"></div>
                              <div className="h-1.5 w-16 bg-slate-100 rounded-full"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                             <div className="h-2 w-full bg-slate-50 rounded-full"></div>
                             <div className="h-2 w-3/4 bg-slate-50 rounded-full"></div>
                          </div>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4">
                          <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-emerald-200"
                          >
                             <ShieldCheck size={28} className="mb-2" />
                             <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{t.verifiedAudit}</p>
                             <p className="text-xl font-black">98%</p>
                          </motion.div>
                          <motion.div 
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white p-6 rounded-3xl border border-brand-100 shadow-sm"
                          >
                             <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-2">
                               <MapPin size={16} />
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.malaysiaPbt}</p>
                             <p className="text-xl font-black text-slate-900 leading-none">155</p>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Alert Card */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 z-30 ring-1 ring-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-200">
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-0.5">{t.communitySync}</p>
                          <p className="text-xs font-bold text-slate-800">{t.reportSent}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="bg-slate-50 py-20 px-6 md:px-12 border-y border-slate-100">
              <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                {[
                  { label: t.statsUserLabel, val: t.statsUserVal },
                  { label: t.statsReportLabel, val: t.statsReportVal },
                  { label: t.statsCouncilLabel, val: t.statsCouncilVal },
                  { label: t.statsAccuracyLabel, val: t.statsAccuracyVal }
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Why Section */}
            <section className="py-32 px-6 md:px-12 bg-white">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{t.problemTitle}</h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                  {t.problemText}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                  <div className="p-10 bg-slate-50 rounded-[40px] space-y-4 hover:bg-brand-50 transition-colors">
                    <div className="w-12 h-12 bg-white shadow-md rounded-2xl flex items-center justify-center text-brand-600 mx-auto"><ShieldCheck /></div>
                    <h3 className="font-bold text-slate-900">{t.feature1}</h3>
                  </div>
                  <div className="p-10 bg-slate-50 rounded-[40px] space-y-4 hover:bg-brand-50 transition-colors">
                    <div className="w-12 h-12 bg-white shadow-md rounded-2xl flex items-center justify-center text-brand-600 mx-auto"><Building2 /></div>
                    <h3 className="font-bold text-slate-900">{t.feature2}</h3>
                  </div>
                  <div className="p-10 bg-slate-50 rounded-[40px] space-y-4 hover:bg-brand-50 transition-colors">
                    <div className="w-12 h-12 bg-white shadow-md rounded-2xl flex items-center justify-center text-brand-600 mx-auto"><FileText /></div>
                    <h3 className="font-bold text-slate-900">{t.feature3}</h3>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-20 px-6 md:px-12">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-10">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-brand-500" />
                  <span className="text-2xl font-bold tracking-tight text-white">
                    AduanPBT<span className="text-brand-500">.ai</span>
                  </span>
                </div>
              </div>
            </footer>
          </motion.div>
        </AnimatePresence>
      ) : (
        <main className="flex-1 flex overflow-hidden">
          {/* Left column: Input */}
        <div className="w-full md:w-5/12 bg-white border-r border-slate-100 overflow-y-auto p-8 lg:p-10 custom-scrollbar shadow-[10px_0_15px_-15px_rgba(0,0,0,0.05)]">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{t.headline}</h1>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {t.subheadline}
            </p>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                  <Building2 size={12} className="text-brand-600" />
                  {t.councilLabel}
                </label>
                <input 
                  type="text"
                  placeholder={t.councilPlaceholder}
                  value={councilName}
                  onChange={(e) => setCouncilName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-brand-50 focus:border-brand-500 outline-none transition-all text-xs font-bold placeholder:text-slate-300 shadow-sm"
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                  <MapPin size={12} className="text-brand-600" />
                  {t.locationLabel}
                </label>
                <input 
                  type="text"
                  placeholder={t.locationPlaceholder}
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-brand-50 focus:border-brand-500 outline-none transition-all text-xs font-bold placeholder:text-slate-300 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                <FileText size={12} className="text-brand-600" />
                {t.nameLabel}
              </label>
              <input 
                type="text"
                placeholder={t.namePlaceholder}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-brand-50 focus:border-brand-500 outline-none transition-all text-xs font-bold placeholder:text-slate-300 shadow-sm"
              />
            </div>


            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                <Upload size={12} className="text-brand-600" />
                {t.uploadLabel}
              </label>
              {!image ? (
                <div 
                  className="h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center p-8 text-center group hover:border-brand-500 hover:bg-brand-50 transition-all cursor-pointer shadow-sm"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" onChange={onFileChange} className="hidden" accept="image/*" ref={fileInputRef} />
                  <div className="w-12 h-12 bg-white shadow-md rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all text-brand-600">
                    <Upload size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-700">{t.uploadButton}</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-widest">{t.uploadSize}</p>
                </div>
              ) : (
                <div className="relative group rounded-2xl border-2 border-slate-100 overflow-hidden aspect-video bg-slate-50 flex items-center justify-center shadow-lg">
                  <img src={image} className="max-w-full max-h-full object-contain p-2" />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {setImage(null); setResult(null);}}
                      className="w-full py-2 bg-white/90 backdrop-blur text-red-600 rounded-lg shadow-xl hover:bg-white transition-all flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-wider"
                    >
                      <Trash2 size={14} /> {t.replaceImage}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={generateComplaint}
                disabled={isGenerating || !image || !councilName}
                className="w-full bg-slate-900 hover:bg-brand-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale shadow-xl shadow-slate-100 h-14 text-xs uppercase tracking-[0.2em]"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {isGenerating ? t.generatingBtn : t.generateBtn}
              </button>

              <AnimatePresence>
                {isGenerating && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-3 py-2"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map(i => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${i <= loadingStep ? 'bg-brand-500' : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 animate-pulse">{loadingSteps[loadingStep]}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm text-brand-600 shrink-0">
                <Info size={16} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">{t.techInfoTitle}</p>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                  {t.techInfoDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Results */}
        <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div 
                  className="h-full flex flex-col items-center justify-center text-slate-300"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  <Layers size={48} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-300">{t.hubTitle}</p>
                </motion.div>
              ) : (
                <motion.div 
                  className="max-w-4xl mx-auto space-y-10 pb-12"
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                >
                  {/* Bento Stats Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Severity Card */}
                    <motion.div 
                      className={`p-6 rounded-[32px] border shadow-sm flex flex-col justify-between h-52 transition-colors ${result.severityScore === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200 hover:border-brand-200'}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${result.severityScore === 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {result.severityScore === 0 ? t.qualityLabel : t.severityLabel}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${result.severityScore === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {result.severityScore === 0 ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                        </div>
                      </div>
                      <div className="mt-4 flex items-end gap-2">
                        <span className={`text-6xl font-black leading-none ${result.severityScore === 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {result.severityScore}
                        </span>
                        <span className={`text-sm font-bold mb-2 ${result.severityScore === 0 ? 'text-emerald-400' : 'text-slate-400'}`}>/ 10</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                        <motion.div 
                          className={`h-full ${result.severityScore === 0 ? 'bg-emerald-500' : result.severityScore > 7 ? 'bg-red-500' : result.severityScore > 4 ? 'bg-orange-500' : 'bg-brand-500'}`}
                          initial={{ width: 0 }} animate={{ width: `${result.severityScore === 0 ? 100 : result.severityScore * 10}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </motion.div>

                    {/* Impact Card */}
                    <motion.div 
                      className={`p-6 rounded-[32px] border shadow-sm flex flex-col h-52 md:col-span-2 transition-colors ${result.severityScore === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200 hover:border-brand-200'}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${result.severityScore === 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {result.severityScore === 0 ? t.statusLabel : t.impactLabel}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${result.severityScore === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                          <Layers size={16} />
                        </div>
                      </div>
                      <p className={`text-sm font-medium leading-relaxed italic ${result.severityScore === 0 ? 'text-emerald-800' : 'text-slate-600'}`}>
                        "{result.impactAnalysis}"
                      </p>
                    </motion.div>

                    {/* Technical Notes Card */}
                    <motion.div 
                      className="bg-slate-900 p-8 rounded-[32px] shadow-2xl flex flex-col md:col-span-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                          <ClipboardEdit size={16} />
                        </div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">{t.auditTitle}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {result.technicalNotes.map((note, idx) => (
                          <div key={idx} className="flex gap-4 items-start pt-4 border-t border-slate-800">
                             <span className="text-brand-500 font-black text-xs leading-none">0{idx + 1}</span>
                             <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">{note}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Contact Header */}
                  <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-1.5 focus-within:border-brand-300 transition-all p-3 bg-slate-50 rounded-2xl border border-transparent">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-400" /> {t.emailLabel}
                        </label>
                        <input 
                          value={recipientEmail} 
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          className="bg-transparent border-none p-0 text-xs w-full font-bold focus:outline-none placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5 focus-within:border-brand-300 transition-all p-3 bg-slate-50 rounded-2xl border border-transparent">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <MessageCircle size={12} className="text-slate-400" /> {t.whatsappLabel}
                        </label>
                        <input 
                          value={recipientPhone} 
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="bg-transparent border-none p-0 text-xs w-full font-bold focus:outline-none placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Letter Section */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">{t.officialDoc}</h3>
                      <div className="flex gap-2">
                        <button onClick={copyText} className="h-10 px-4 text-[10px] font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-all">
                          {copied ? <Check size={14} className="text-brand-600" /> : <Copy size={14} />} {copied ? t.copiedBtn : t.copyBtn}
                        </button>
                        <button onClick={downloadPDF} className="h-10 px-4 text-[10px] font-bold bg-slate-900 text-white rounded-xl hover:bg-black flex items-center gap-2 transition-all">
                          <Download size={14} /> {t.pdfBtn}
                        </button>
                      </div>
                    </div>
                    
                    <div className="group relative">
                      <textarea
                        value={editableLetter}
                        onChange={(e) => setEditableLetter(e.target.value)}
                        className="w-full min-h-[500px] bg-white p-12 lg:p-16 rounded-[48px] border border-slate-200 shadow-2xl focus:border-brand-200 focus:ring-0 outline-none text-sm leading-[2] text-slate-800 font-sans custom-scrollbar transition-all font-medium"
                        spellCheck="false"
                      />
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Bar */}
          <AnimatePresence>
            {result && (
              <motion.div 
                className="bg-white border-t border-slate-100 p-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_-15px_40px_-20px_rgba(0,0,0,0.1)] z-40"
                initial={{ y: 150 }} animate={{ y: 0 }} exit={{ y: 150 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100 shrink-0">
                    <Layers size={24} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.actionBarReady}</p>
                    <div className="flex items-center gap-2">
                       <h4 className="text-sm font-bold text-slate-900">{councilName}</h4>
                       <ChevronRight size={14} className="text-slate-300" />
                       <span className="text-xs font-medium text-slate-500">{result.problemTitle}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex w-full md:w-auto gap-4">
                  <button onClick={sendEmail} className="flex-1 md:flex-none h-14 px-8 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-200 text-sm whitespace-nowrap">
                    <Mail size={18} /> {t.sendEmailBtn}
                  </button>
                  <button onClick={sendWhatsApp} className="flex-1 md:flex-none h-14 px-8 bg-[#25D366] hover:bg-[#22c35e] text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-100 active:scale-95 text-sm whitespace-nowrap">
                    <MessageCircle size={18} /> {t.sendWsBtn}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    )}

      {/* Modal: Tatacara */}
      <AnimatePresence>
        {showTatacara && (
          <motion.div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-[40px] w-full max-w-xl p-10 relative shadow-2xl overflow-hidden border border-slate-100"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            >
              <button 
                onClick={() => setShowTatacara(false)}
                className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center">
                  <Info size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.howToTitle}</h2>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{t.howToSub}</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { n: "1", t: t.step1T, d: t.step1D },
                  { n: "2", t: t.step2T, d: t.step2D },
                  { n: "3", t: t.step3T, d: t.step3D },
                  { n: "4", t: t.step4T, d: t.step4D }
                ].map((step, idx) => (
                  <motion.div 
                    key={step.n} 
                    className="flex gap-6 group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    <span className="text-2xl font-black text-slate-200 group-hover:text-brand-600 transition-colors shrink-0 leading-none">0{step.n}</span>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight">{step.t}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.d}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={() => setShowTatacara(false)}
                className="w-full mt-10 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 text-sm tracking-widest"
              >
                {t.understandBtn}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        textarea:focus { box-shadow: none !important; }
      `}</style>
    </div>
  );
}

