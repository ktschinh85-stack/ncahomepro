
import React, { useState, useEffect, useMemo } from 'react';
import { SERVICES, PROJECTS, TESTIMONIALS } from './constants';
import { generateArchitectureRender, checkProAuth, requestProAuth } from './services/geminiService';
import { RenderConfig, ImageData } from './types';

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // AI Render State
  const [originalImg, setOriginalImg] = useState<ImageData | null>(null);
  const [refImg, setRefImg] = useState<ImageData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [config, setConfig] = useState<RenderConfig>({
    style: 'Modern (Hiện đại)',
    location: 'trên một đường phố Việt Nam',
    lighting: 'sáng rực rỡ',
    weather: 'trong xanh',
    customPrompt: '',
    imageCount: 3, // Updated default to 3 options as requested
    aspectRatio: '16:9',
    model: 'gemini-2.5-flash-image',
    resolution: '1K'
  });

  // Construction Calculator State
  const [calcWidth, setCalcWidth] = useState<number>(5);
  const [calcLength, setCalcLength] = useState<number>(20);
  const [calcFloors, setCalcFloors] = useState<number>(2);
  const [calcBasement, setCalcBasement] = useState<boolean>(false);
  const [calcFoundation, setCalcFoundation] = useState<'single' | 'pile'>('single');
  const [calcRoof, setCalcRoof] = useState<'tole' | 'iron' | 'concrete'>('tole');
  const [calcPackage, setCalcPackage] = useState<'construction' | 'full'>('full');
  const [calcQuality, setCalcQuality] = useState<'average' | 'good' | 'premium'>('average');

  const logoUrl = "https://i.postimg.cc/SxL06Ztv/LOGO-NCA.jpg";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'orig' | 'ref') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = { base64, mimeType: file.type };
        if (type === 'orig') setOriginalImg(data);
        else setRefImg(data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRender = async () => {
    if (!originalImg) {
      alert("Vui lòng tải lên ảnh gốc kiến trúc!");
      return;
    }

    if (config.model === 'gemini-3-pro-image-preview') {
      const isAuth = await checkProAuth();
      if (!isAuth) {
        await requestProAuth();
        return;
      }
    }

    setIsGenerating(true);
    setResults([]);
    try {
      const imgs = await generateArchitectureRender(originalImg, refImg, config);
      setResults(imgs);
      const section = document.getElementById('ai-results');
      section?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi render. Vui lòng thử lại!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculator Logic
  const calcResults = useMemo(() => {
    const s = calcWidth * calcLength;
    const foundArea = calcFoundation === 'single' ? s * 0.4 : s * 0.5;
    const floorsArea = s * calcFloors;
    const basementArea = calcBasement ? s * 1.5 : 0;
    
    let roofCoeff = 0.3;
    if (calcRoof === 'iron') roofCoeff = 0.7;
    if (calcRoof === 'concrete') roofCoeff = 0.5;
    const roofArea = s * roofCoeff;

    const totalArea = foundArea + floorsArea + basementArea + roofArea;

    let unitPrice = 0;
    if (calcPackage === 'construction') {
      unitPrice = calcQuality === 'premium' ? 3800000 : (calcQuality === 'good' ? 3800000 : 3500000);
    } else {
      if (calcQuality === 'average') unitPrice = 4750000;
      else if (calcQuality === 'good') unitPrice = 5500000;
      else unitPrice = 6500000;
    }

    const totalPrice = totalArea * unitPrice;

    return {
      foundArea,
      floorsArea,
      basementArea,
      roofArea,
      totalArea,
      totalPrice
    };
  }, [calcWidth, calcLength, calcFloors, calcBasement, calcFoundation, calcRoof, calcPackage, calcQuality]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-glass shadow-lg py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-3">
              <img 
                src={logoUrl} 
                alt="NCA Homepro Logo" 
                className={`transition-all duration-300 ${isScrolled ? 'h-10' : 'h-14'} w-auto object-contain rounded-lg`} 
              />
              <span className={`text-2xl font-extrabold text-ncaGold tracking-tighter font-title hidden md:inline-block`}>
                NCA <span className={isScrolled ? 'text-white' : 'text-ncaGreen'}>HOMEPRO</span>
              </span>
            </a>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold uppercase tracking-widest">
            <a href="#about" className={`hover-gold ${isScrolled ? 'text-white' : 'text-ncaGreen'}`}>Về chúng tôi</a>
            <a href="#services" className={`hover-gold ${isScrolled ? 'text-white' : 'text-ncaGreen'}`}>Dịch vụ</a>
            <a href="#ai-studio" className={`hover-gold ${isScrolled ? 'text-white' : 'text-ncaGreen'}`}>AI Render</a>
            <a href="#projects" className={`hover-gold ${isScrolled ? 'text-white' : 'text-ncaGreen'}`}>Dự án</a>
            <a href="#calculator" className={`hover-gold ${isScrolled ? 'text-white' : 'text-ncaGreen'}`}>Báo giá m2</a>
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <a href="tel:0982016085" className={`font-bold flex items-center gap-2 ${isScrolled ? 'text-white' : 'text-ncaGreen'}`}>
              <i className="fas fa-phone-alt text-ncaGold"></i> 0982.016.085
            </a>
            <a href="#quote" className="bg-ncaGold hover:bg-ncaGoldDark text-white px-6 py-2.5 rounded-full font-bold shadow-lg transition-all uppercase text-xs tracking-wider">
              Báo giá nhanh
            </a>
          </div>

          <button className="lg:hidden text-ncaGreen text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} ${isScrolled ? 'text-white' : 'text-ncaGreen'}`}></i>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-ncaGreen text-white p-6 absolute top-full left-0 right-0 shadow-2xl animate-fade-in">
            <nav className="flex flex-col gap-4 text-center font-bold">
              <a href="#about" onClick={() => setMobileMenuOpen(false)}>Về chúng tôi</a>
              <a href="#services" onClick={() => setMobileMenuOpen(false)}>Dịch vụ</a>
              <a href="#ai-studio" onClick={() => setMobileMenuOpen(false)}>AI Render</a>
              <a href="#projects" onClick={() => setMobileMenuOpen(false)}>Dự án</a>
              <a href="#calculator" onClick={() => setMobileMenuOpen(false)}>Tính giá m2</a>
              <a href="tel:0982016085" className="text-ncaGold">0982.016.085</a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ncaGreen/90 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-white text-left">
          <div className="max-w-2xl animate-slide-up">
            <span className="inline-block px-4 py-1 bg-ncaGold text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Chất lượng vượt trội hơn cả lời hứa
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Kiến trúc Xanh <br/>
              & Nội thất <span className="text-ncaGold italic">Thông minh</span>
            </h1>
            <p className="text-xl opacity-90 mb-10 font-light border-l-4 border-ncaGold pl-6">
              Thiết kế và thi công trọn gói nhà phố, biệt thự sân vườn chuyên nghiệp tại Hà Nội. Đưa công nghệ AI vào kiến tạo ngôi nhà của bạn.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#ai-studio" className="bg-ncaGold text-white px-8 py-4 rounded-full font-bold hover:bg-ncaGoldDark transition-all shadow-xl uppercase text-sm tracking-widest">
                Trải nghiệm AI Render
              </a>
              <a href="#projects" className="bg-white text-ncaGreen px-8 py-4 rounded-full font-bold hover:bg-slate-100 transition-all uppercase text-sm shadow-lg">
                Dự án tiêu biểu
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* AI Design Studio Section */}
      <section id="ai-studio" className="py-24 bg-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-ncaGreen mb-4 font-title uppercase tracking-tight">NCA AI Design Studio</h2>
            <div className="h-1.5 w-24 bg-ncaGold mx-auto mb-6"></div>
            <p className="text-slate-600 max-w-2xl mx-auto">Tải ảnh ngôi nhà hiện tại của bạn và để AI của chúng tôi gợi ý những bản phối kiến trúc xanh hiện đại nhất.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-slate-200">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-ncaGreen uppercase tracking-widest">1. Ảnh Gốc (Kiến trúc)</label>
                    <div className="relative aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl overflow-hidden flex items-center justify-center group">
                      {originalImg ? (
                        <img src={`data:${originalImg.mimeType};base64,${originalImg.base64}`} className="w-full h-full object-cover" alt="Original" />
                      ) : (
                        <div className="text-center p-4">
                          <i className="fas fa-cloud-upload-alt text-3xl text-slate-300 mb-2"></i>
                          <p className="text-[10px] text-slate-400">Nhấn để tải ảnh</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'orig')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-ncaGreen uppercase tracking-widest">2. Ảnh Tham Chiếu (Style)</label>
                    <div className="relative aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl overflow-hidden flex items-center justify-center group">
                      {refImg ? (
                        <img src={`data:${refImg.mimeType};base64,${refImg.base64}`} className="w-full h-full object-cover" alt="Reference" />
                      ) : (
                        <div className="text-center p-4">
                          <i className="fas fa-image text-3xl text-slate-300 mb-2"></i>
                          <p className="text-[10px] text-slate-400">Chọn phong cách học theo</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'ref')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-ncaGreen uppercase tracking-widest">Yêu cầu mô tả thêm</label>
                  <textarea 
                    value={config.customPrompt}
                    onChange={(e) => setConfig({...config, customPrompt: e.target.value})}
                    placeholder="Ví dụ: Thêm nhiều cây xanh ban công, sử dụng vật liệu gỗ tự nhiên..." 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-ncaGold outline-none h-24"
                  />
                </div>
              </div>
              <div className="bg-ncaGreen rounded-3xl p-8 text-white space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ncaGold uppercase">Phong cách</label>
                    <select value={config.style} onChange={(e) => setConfig({...config, style: e.target.value})} className="w-full bg-white/10 rounded-lg p-2 text-sm border-none outline-none">
                      <option className="text-slate-800">Modern (Hiện đại)</option>
                      <option className="text-slate-800">Luxury (Sang trọng)</option>
                      <option className="text-slate-800">Indochine (Đông Dương)</option>
                      <option className="text-slate-800">Minimalism (Tối giản)</option>
                      <option className="text-slate-800">Neo-Classic (Tân cổ điển)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ncaGold uppercase">Vị trí</label>
                    <select value={config.location} onChange={(e) => setConfig({...config, location: e.target.value})} className="w-full bg-white/10 rounded-lg p-2 text-sm border-none outline-none">
                      <option className="text-slate-800">Đường phố Việt Nam</option>
                      <option className="text-slate-800">Vùng làng quê yên tĩnh</option>
                      <option className="text-slate-800">Ngã tư sầm uất</option>
                      <option className="text-slate-800">Khu đô thị mới</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ncaGold uppercase">Ánh sáng</label>
                    <select value={config.lighting} onChange={(e) => setConfig({...config, lighting: e.target.value})} className="w-full bg-white/10 rounded-lg p-2 text-sm border-none outline-none">
                      <option className="text-slate-800">Sáng rực rỡ</option>
                      <option className="text-slate-800">Nắng chiều vàng</option>
                      <option className="text-slate-800">Hoàng hôn lãng mạn</option>
                      <option className="text-slate-800">Buổi tối lung linh</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ncaGold uppercase">Thời tiết</label>
                    <select value={config.weather} onChange={(e) => setConfig({...config, weather: e.target.value})} className="w-full bg-white/10 rounded-lg p-2 text-sm border-none outline-none">
                      <option className="text-slate-800">Trong xanh</option>
                      <option className="text-slate-800">Âm u mây phủ</option>
                      <option className="text-slate-800">Mưa nhỏ lãng mạn</option>
                      <option className="text-slate-800">Sương mù mờ ảo</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ncaGold uppercase">Số lượng</label>
                    <select value={config.imageCount} onChange={(e) => setConfig({...config, imageCount: Number(e.target.value)})} className="w-full bg-white/10 rounded-lg p-2 text-sm border-none outline-none">
                      <option className="text-slate-800">1</option>
                      <option className="text-slate-800">2</option>
                      <option className="text-slate-800">3</option>
                      <option className="text-slate-800">4</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ncaGold uppercase">Tỷ lệ</label>
                    <select value={config.aspectRatio} onChange={(e) => setConfig({...config, aspectRatio: e.target.value as any})} className="w-full bg-white/10 rounded-lg p-2 text-sm border-none outline-none">
                      <option className="text-slate-800">1:1</option>
                      <option className="text-slate-800">16:9</option>
                      <option className="text-slate-800">9:16</option>
                      <option className="text-slate-800">4:3</option>
                      <option className="text-slate-800">3:4</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ncaGold uppercase">Model</label>
                    <select value={config.model} onChange={(e) => setConfig({...config, model: e.target.value})} className="w-full bg-white/10 rounded-lg p-2 text-sm border-none outline-none">
                      <option className="text-slate-800" value="gemini-2.5-flash-image">Banana Standard</option>
                      <option className="text-slate-800" value="gemini-3-pro-image-preview">Banana Pro (High End)</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleRender}
                  disabled={isGenerating}
                  className="w-full bg-ncaGold text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-white hover:text-ncaGreen transition-all flex items-center justify-center gap-3 shadow-xl mt-4"
                >
                  {isGenerating ? <><i className="fas fa-spinner fa-spin"></i> Đang Render...</> : <><i className="fas fa-magic"></i> Tạo Bản Render Ngay</>}
                </button>
              </div>
            </div>
            {results.length > 0 && (
              <div id="ai-results" className="mt-16 animate-fade-in">
                <h3 className="text-2xl font-bold text-ncaGreen mb-8 text-center uppercase tracking-widest">Kết quả Render AI (3 Phương án)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
                  {results.map((url, i) => (
                    <div key={i} className="space-y-4">
                      <div className="group relative aspect-[16/9] rounded-2xl overflow-hidden shadow-xl cursor-zoom-in border-4 border-slate-100" onClick={() => setSelectedResult(url)}>
                        <img src={url} alt={`Result ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <i className="fas fa-search-plus text-white text-3xl"></i>
                        </div>
                        <div className="absolute top-4 left-4 bg-ncaGold text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                          Phương án {i + 1}
                        </div>
                      </div>
                      <div className="text-center">
                        <button 
                          onClick={() => setSelectedResult(url)}
                          className="text-ncaGreen font-bold hover:text-ncaGold transition-colors text-sm uppercase tracking-widest"
                        >
                          Xem chi tiết Phương án {i + 1}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quote/Lead Magnet Section */}
      <section id="quote" className="py-24 bg-ncaGreen overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-white">
              <h2 className="text-4xl font-extrabold mb-8 leading-tight font-title">Nhận Báo giá & Tư vấn <br/> <span className="text-ncaGold">Miễn phí 100%</span></h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-ncaGold flex items-center justify-center flex-shrink-0"><i className="fas fa-check"></i></div>
                  <p className="font-light opacity-90">Tư vấn phong thủy chuyên sâu theo tuổi chủ nhà.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-ncaGold flex items-center justify-center flex-shrink-0"><i className="fas fa-check"></i></div>
                  <p className="font-light opacity-90">Bản vẽ sơ bộ mặt bằng công năng tối ưu.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-ncaGold flex items-center justify-center flex-shrink-0"><i className="fas fa-check"></i></div>
                  <p className="font-light opacity-90">Dự toán chi phí chính xác, cam kết không phát sinh.</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl luxury-shadow">
                <form className="space-y-5">
                  <input type="text" placeholder="Họ và tên của bạn" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-ncaGold transition-all" />
                  <input type="tel" placeholder="Số điện thoại" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-ncaGold transition-all" />
                  <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-ncaGold transition-all text-slate-500">
                    <option>Bạn muốn thiết kế gì?</option>
                    <option>Nhà phố</option>
                    <option>Biệt thự sân vườn</option>
                    <option>Nội thất chung cư</option>
                  </select>
                  <button className="w-full bg-ncaGold text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-ncaGreen transition-all shadow-lg">Gửi thông tin ngay</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Construction Calculator Section */}
      <section id="calculator" className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-ncaGreen mb-4 font-title uppercase tracking-tight">Công cụ Tính Giá Xây Dựng</h2>
            <p className="text-ncaGold font-bold uppercase tracking-widest mb-4">Chuẩn NCA Homepro Architecture</p>
            <div className="h-1.5 w-24 bg-ncaGold mx-auto"></div>
          </div>

          <div className="max-w-6xl mx-auto bg-slate-50 rounded-[3rem] p-8 lg:p-12 shadow-2xl border border-slate-200">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Inputs */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Chiều rộng đất (m)</label>
                    <input 
                      type="number" 
                      value={calcWidth} 
                      onChange={(e) => setCalcWidth(Number(e.target.value))} 
                      className="w-full p-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-ncaGold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Chiều dài đất (m)</label>
                    <input 
                      type="number" 
                      value={calcLength} 
                      onChange={(e) => setCalcLength(Number(e.target.value))} 
                      className="w-full p-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-ncaGold" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Số tầng (Gồm trệt)</label>
                    <input 
                      type="number" 
                      value={calcFloors} 
                      onChange={(e) => setCalcFloors(Number(e.target.value))} 
                      className="w-full p-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-ncaGold" 
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer select-none bg-white p-4 rounded-2xl w-full shadow-sm">
                      <input 
                        type="checkbox" 
                        checked={calcBasement} 
                        onChange={(e) => setCalcBasement(e.target.checked)} 
                        className="w-5 h-5 accent-ncaGold"
                      />
                      <span className="text-xs font-bold text-slate-500 uppercase">Có tầng hầm (150%)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Loại móng</label>
                    <select value={calcFoundation} onChange={(e) => setCalcFoundation(e.target.value as any)} className="w-full p-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-ncaGold">
                      <option value="single">Móng đơn (40%)</option>
                      <option value="pile">Móng cọc (50%)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Loại mái</label>
                    <select value={calcRoof} onChange={(e) => setCalcRoof(e.target.value as any)} className="w-full p-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-ncaGold">
                      <option value="tole">Mái Tole (30%)</option>
                      <option value="iron">Mái Ngói kèo sắt (70%)</option>
                      <option value="concrete">Mái Bê tông CT (50%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Gói thầu</label>
                    <select value={calcPackage} onChange={(e) => setCalcPackage(e.target.value as any)} className="w-full p-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-ncaGold">
                      <option value="construction">Xây thô</option>
                      <option value="full">Trọn gói</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Chất lượng vật tư</label>
                    <select value={calcQuality} onChange={(e) => setCalcQuality(e.target.value as any)} className="w-full p-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-ncaGold">
                      <option value="average">Gói Trung bình</option>
                      <option value="good">Gói Khá</option>
                      {calcPackage === 'full' && <option value="premium">Gói Cao cấp</option>}
                    </select>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-ncaGreen rounded-[2rem] p-10 text-white flex flex-col justify-between shadow-2xl">
                <div>
                  <h3 className="text-xl font-bold mb-8 uppercase tracking-widest border-b border-white/10 pb-4">Bảng phân tích diện tích</h3>
                  <div className="space-y-4 font-light opacity-90">
                    <div className="flex justify-between items-center">
                      <span>Diện tích móng:</span>
                      <span className="font-bold text-ncaGold">{calcResults.foundArea.toFixed(1)} m²</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Diện tích các tầng:</span>
                      <span className="font-bold text-ncaGold">{calcResults.floorsArea.toFixed(1)} m²</span>
                    </div>
                    {calcBasement && (
                      <div className="flex justify-between items-center">
                        <span>Diện tích hầm:</span>
                        <span className="font-bold text-ncaGold">{calcResults.basementArea.toFixed(1)} m²</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span>Diện tích mái:</span>
                      <span className="font-bold text-ncaGold">{calcResults.roofArea.toFixed(1)} m²</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-4 text-lg">
                      <span className="font-bold">Tổng diện tích quy đổi:</span>
                      <span className="font-bold text-ncaGold">{calcResults.totalArea.toFixed(1)} m²</span>
                    </div>
                  </div>
                </div>

                <div className="mt-12 text-center bg-white/5 p-8 rounded-3xl">
                  <p className="text-xs uppercase font-bold tracking-widest text-ncaGold mb-2">Tổng chi phí dự kiến</p>
                  <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2 font-title animate-pulse">
                    {formatCurrency(calcResults.totalPrice)}
                  </div>
                  <p className="text-[10px] opacity-40 font-light italic">
                    * Con số này là ước tính tham khảo, vui lòng liên hệ NCA Homepro để có báo giá chi tiết và tối ưu nhất cho ngôi nhà của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-ncaGreen mb-4 font-title uppercase">Dịch vụ Chuyên nghiệp</h2>
            <div className="h-1.5 w-24 bg-ncaGold mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {SERVICES.map((service, index) => (
              <div key={index} className="bg-white p-12 rounded-[2rem] hover:bg-ncaGreen group transition-all duration-500 border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:bg-ncaGold transition-colors">
                  <i className={`fas ${service.icon} text-2xl text-ncaGreen group-hover:text-white`}></i>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-ncaGreen group-hover:text-white">{service.title}</h3>
                <p className="text-slate-500 group-hover:text-white/80 leading-relaxed font-light">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center mb-12">
            <h2 className="text-4xl font-extrabold text-ncaGreen mb-4 font-title uppercase">Kiệt tác Kiến trúc</h2>
            <p className="text-slate-500">Khám phá các dự án tâm huyết của đội ngũ NCA Homepro</p>
        </div>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROJECTS.map((project) => (
            <div key={project.id} className="relative group overflow-hidden rounded-3xl aspect-[3/4] shadow-xl">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-ncaGreen/90 via-ncaGreen/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 text-white">
                <span className="text-xs text-ncaGold font-bold uppercase mb-2 tracking-widest">{project.category}</span>
                <h4 className="text-2xl font-bold">{project.title}</h4>
                <div className="h-1 w-0 group-hover:w-full bg-ncaGold mt-4 transition-all duration-700"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-24 pb-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <img 
              src={logoUrl} 
              alt="NCA Homepro Logo Footer" 
              className="h-16 w-auto object-contain mb-6 grayscale brightness-200 rounded-lg"
            />
            <p className="opacity-50 font-light leading-relaxed mb-8">
              Chất lượng vượt trội hơn cả lời hứa. Kiến tạo không gian sống xanh bền vững.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-ncaGold transition-colors"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-ncaGold transition-colors"><i className="fab fa-tiktok"></i></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-ncaGold transition-colors"><i className="fab fa-youtube"></i></a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-ncaGold uppercase tracking-widest">Liên hệ</h4>
            <ul className="space-y-4 opacity-70 font-light">
              <li>Hotline: 0982.016.085</li>
              <li>Email: info@ncahomepro.vn</li>
              <li>Zalo: 0982016085</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-ncaGold uppercase tracking-widest">Địa chỉ</h4>
            <p className="opacity-70 font-light leading-relaxed">
              Trụ sở: Số 123 Phố Duy Tân, <br/>
              Cầu Giấy, Hà Nội, Việt Nam.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl h-48 border border-white/10 grayscale hover:grayscale-0 transition-all duration-700">
            <iframe 
              title="NCA Homepro Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9059737525355!2d105.78280621147942!3d21.033446487563102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab355e714647%3A0x6a16174a748c6978!2zRHV5IFTDom4sIEPhuqd1IEdp4bqleSwgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1715424000000!5m2!1svi!2s"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
            ></iframe>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-12 border-t border-white/5 text-center text-xs opacity-30">
          <p>&copy; 2024 NCA Homepro Architecture. Toàn bộ quyền sở hữu trí tuệ được bảo lưu.</p>
        </div>
      </footer>

      {/* Image Preview Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedResult(null)}>
          <button className="absolute top-10 right-10 text-white text-4xl" onClick={() => setSelectedResult(null)}><i className="fas fa-times"></i></button>
          <img src={selectedResult} alt="Full Result" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain" />
        </div>
      )}

      {/* Sticky Contacts */}
      <div className="fixed bottom-10 right-10 z-40 flex flex-col gap-4">
        <a href="https://zalo.me/0982016085" className="w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all">
          <span className="font-bold text-[10px]">ZALO</span>
        </a>
        <a href="tel:0982016085" className="w-14 h-14 bg-ncaGold text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all animate-pulse" title="0982016085">
          <i className="fas fa-phone-alt text-xl"></i>
        </a>
      </div>
    </div>
  );
};

export default App;
