import React, { useState, useEffect, useRef } from 'react';
import { 
  Link as LinkIcon, 
  RefreshCcw, 
  RotateCcw, 
  Copy, 
  ExternalLink, 
  CheckCircle2,
  MessageCircle,
  AlertCircle,
  Globe2,
  Smartphone,
  Sparkles,
  Trash2,
  XCircle
} from 'lucide-react';
import { ALL_COUNTRIES, COUNTRY_VALIDATION } from './constants';
import { HistoryEntry, Country } from './types';
import LogTable from './components/LogTable';

const App: React.FC = () => {
  const [isRTL, setIsRTL] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(ALL_COUNTRIES[0]); // Default Egypt
  const [phoneNumber, setPhoneNumber] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isValidInput, setIsValidInput] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize history from localStorage
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('whatsapp-link-history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');

  // Toggle Language
  const toggleLang = () => setIsRTL(!isRTL);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = isRTL ? 'ar' : 'en';
  }, [isRTL]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('whatsapp-link-history', JSON.stringify(history));
  }, [history]);

  // Centralized Validation Logic
  const validatePhone = (number: string, country: Country) => {
    if (!number.trim()) return { valid: false, errorMsg: '', cleanNumber: '' };

    let cleanNumber = number.replace(/\D/g, '');

    // Check if number contains digits
    if (!cleanNumber) {
      return { 
        valid: false, 
        errorMsg: isRTL ? 'الرقم يجب أن يحتوي على أرقام فقط' : 'Number must contain digits',
        cleanNumber: ''
      };
    }

    // Smart Check: If user pasted the country code
    const dialCodeNoPlus = country.dialCode.replace('+', '');
    if (cleanNumber.startsWith(dialCodeNoPlus)) {
      const tempNumber = cleanNumber.substring(dialCodeNoPlus.length);
      if (tempNumber.length > 4) {
        cleanNumber = tempNumber;
      }
    }

    // Remove leading zero
    if (cleanNumber.startsWith('0')) {
      cleanNumber = cleanNumber.substring(1);
    }

    const validation = COUNTRY_VALIDATION[country.code];
    let errorMsg = '';
    let valid = true;

    if (validation) {
        // Length Check
        if (cleanNumber.length < validation.min || cleanNumber.length > validation.max) {
            valid = false;
            const lenMsg = validation.min === validation.max 
                ? `${validation.min}` 
                : `${validation.min}-${validation.max}`;
            
            errorMsg = isRTL 
                ? `رقم ${country.nameAr} يجب أن يتكون من ${lenMsg} أرقام` 
                : `${country.name} number must be ${lenMsg} digits`;
        } 
        // Prefix Check
        else if (validation.startsWith && !validation.startsWith.some(p => cleanNumber.startsWith(p))) {
             valid = false;
             const starts = validation.startsWith.map(s => '0' + s).join(isRTL ? ' أو ' : ' or ');
             errorMsg = isRTL
                ? `رقم ${country.nameAr} يجب أن يبدأ بـ ${starts}`
                : `${country.name} number should start with ${starts}`;
        }
    } else {
        // Fallback Generic Validation
        if (cleanNumber.length < 7) {
          valid = false;
          errorMsg = isRTL ? 'الرقم قصير جداً' : 'Number is too short';
        } else if (cleanNumber.length > 15) {
          valid = false;
          errorMsg = isRTL ? 'الرقم طويل جداً' : 'Number is too long';
        }
    }

    return { valid, errorMsg, cleanNumber };
  };

  // Real-time validation effect
  useEffect(() => {
    if (!phoneNumber) {
        setIsValidInput(false);
        return;
    }
    const { valid } = validatePhone(phoneNumber, selectedCountry);
    setIsValidInput(valid);
  }, [phoneNumber, selectedCountry, isRTL]);

  // Handle Blur to show error
  const handleBlur = () => {
      if (!phoneNumber) {
        setError('');
        return;
      }
      const { valid, errorMsg } = validatePhone(phoneNumber, selectedCountry);
      if (!valid) {
          setError(errorMsg);
      } else {
          setError('');
      }
  };

  const generateLink = () => {
    setError('');
    const { valid, errorMsg, cleanNumber } = validatePhone(phoneNumber, selectedCountry);

    if (!phoneNumber) {
       setError(isRTL ? 'الرجاء إدخال رقم الهاتف' : 'Please enter a phone number');
       return;
    }

    if (!valid) {
       setError(errorMsg);
       return;
    }

    const fullNumber = `${selectedCountry.dialCode.replace('+', '')}${cleanNumber}`;
    const link = `https://wa.me/${fullNumber}`;

    setGeneratedLink(link);

    // Add to history
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      phoneNumber: `${selectedCountry.dialCode} ${cleanNumber}`,
      fullLink: link,
      timestamp: Date.now(),
      countryCode: selectedCountry.code
    };

    setHistory(prev => [newEntry, ...prev]);
  };

  const resetForm = () => {
    setPhoneNumber('');
    setGeneratedLink('');
    setCopySuccess(false);
    setError('');
    setIsValidInput(false);
    if (phoneInputRef.current) phoneInputRef.current.focus();
  };

  const copyToClipboard = () => {
    if (!generatedLink) {
       setError(isRTL ? 'قم بإنشاء الرابط أولاً' : 'Generate a link first');
       return;
    }
    navigator.clipboard.writeText(generatedLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const openWhatsAppWeb = () => {
    if (!generatedLink) {
       setError(isRTL ? 'قم بإنشاء الرابط أولاً' : 'Generate a link first');
       return;
    }
    window.open(generatedLink, '_blank');
  };

  // Helper to determine input border color
  const getInputBorderColor = () => {
      if (error) return 'border-red-500 bg-red-50 focus:ring-red-500/20';
      if (isValidInput) return 'border-green-500 bg-green-50 focus:ring-green-500/20';
      return 'border-slate-900 bg-slate-50 focus:ring-green-500/20';
  };

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-900 p-4 md:p-6 lg:p-8 font-sans ${isRTL ? 'font-[Cairo]' : 'font-[Inter]'}`}>
      
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navbar */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white border-4 border-slate-900 rounded-2xl p-4 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] gap-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-green-500 border-2 border-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                <MessageCircle size={28} className="text-white" />
             </div>
             <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
               Elias <span className="text-green-600">WhatsApp</span> Link
             </h1>
          </div>
          
          <button 
            onClick={toggleLang}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 px-4 py-2 rounded-xl font-bold transition-all active:translate-y-1"
          >
            <Globe2 size={18} />
            {isRTL ? 'English' : 'العربية'}
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* LEFT COLUMN: Generator (Span 7) */}
          <div className="lg:col-span-7">
            
            {/* Main Card */}
            <div className="bg-white border-4 border-slate-900 rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] h-full flex flex-col">
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                  <Smartphone className="text-slate-500" />
                  {isRTL ? 'منشئ الروابط' : 'Link Generator'}
                </h2>
                <p className="text-slate-500 font-medium">
                  {isRTL ? 'أدخل الرقم للبدء' : 'Enter number to start'}
                </p>
              </div>

              <div className="space-y-8 flex-1">
                
                {/* Input Section */}
                <div className="space-y-6">
                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label className="text-lg font-bold text-slate-700 block">
                      {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative md:w-1/3">
                        <select
                          value={selectedCountry.dialCode}
                          onChange={(e) => {
                            const country = ALL_COUNTRIES.find(c => c.dialCode === e.target.value);
                            if (country) {
                                setSelectedCountry(country);
                                setError('');
                            }
                          }}
                          className="w-full h-14 appearance-none bg-slate-50 border-2 border-slate-900 rounded-xl px-4 pr-8 font-bold text-lg text-slate-800 focus:outline-none focus:ring-4 focus:ring-green-500/20 cursor-pointer transition-shadow"
                          dir="ltr"
                        >
                          {ALL_COUNTRIES.map(country => (
                            <option key={country.name} value={country.dialCode}>
                              {country.flag} {country.dialCode} ({country.code})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>

                      <div className="flex-1 relative group">
                        <input
                          ref={phoneInputRef}
                          id="phone-input"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            if (error) setError('');
                          }}
                          onBlur={handleBlur}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') generateLink();
                          }}
                          placeholder={isRTL ? 'رقم الهاتف' : '100xxxxxxx'}
                          className={`w-full h-14 border-2 rounded-xl px-5 font-mono text-xl font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-300 ${getInputBorderColor()}`}
                          dir="ltr"
                        />
                        {/* Visual Validation Indicator */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all">
                             {isValidInput && !error && (
                                 <CheckCircle2 className="text-green-500 animate-in zoom-in duration-300" size={24} />
                             )}
                             {error && (
                                 <AlertCircle className="text-red-500 animate-in zoom-in duration-300" size={24} />
                             )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Error Message Area */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${error ? 'max-h-12 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                        <div className="flex items-center gap-2 text-red-500 font-bold px-1 text-sm">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    </div>
                  </div>

                  {/* Output Link Display (Always Visible) */}
                  <div className="space-y-2">
                    <label className="text-lg font-bold text-slate-700 block">
                      {isRTL ? 'رابط الواتساب' : 'WhatsApp Link'}
                    </label>
                    <div className={`flex items-center gap-3 border-2 rounded-xl p-1 pr-3 pl-3 h-14 transition-all ${generatedLink ? 'bg-green-50 border-green-500' : 'bg-slate-100 border-slate-300'}`}>
                       <LinkIcon className={generatedLink ? 'text-green-600' : 'text-slate-400'} size={20} />
                       <input 
                          readOnly
                          value={generatedLink}
                          placeholder="wa.me/xxxxxxxxxx"
                          className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-mono text-slate-700 placeholder:text-slate-400"
                          dir="ltr"
                       />
                       {generatedLink && <CheckCircle2 size={20} className="text-green-500 animate-in zoom-in" />}
                    </div>
                  </div>
                </div>

                {/* Action Buttons Grid */}
                <div className="flex flex-col gap-4 pt-4 border-t-2 border-slate-100">
                    
                    {/* Row 1: Main Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button 
                          onClick={generateLink}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold py-3 px-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles size={20} className="text-yellow-400" />
                          {isRTL ? 'إنشاء' : 'Generate'}
                        </button>
                        
                        <button 
                          onClick={resetForm}
                          className="bg-white hover:bg-red-50 border-2 border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-500 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 size={18} />
                          {isRTL ? 'مسح' : 'Reset'}
                        </button>
                    </div>

                    {/* Row 2: Output Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button 
                          onClick={copyToClipboard}
                          disabled={!generatedLink}
                          className={`font-bold py-4 px-6 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                            generatedLink 
                              ? copySuccess 
                                ? 'bg-green-100 border-green-500 text-green-700'
                                : 'bg-white border-slate-900 hover:bg-slate-50 text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]' 
                              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {copySuccess ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                          {copySuccess ? (isRTL ? 'تم النسخ' : 'Copied') : (isRTL ? 'نسخ الرابط' : 'Copy Link')}
                        </button>

                        <button 
                          onClick={openWhatsAppWeb}
                          disabled={!generatedLink}
                          className={`font-bold py-4 px-6 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                            generatedLink 
                              ? 'bg-green-500 border-slate-900 text-white hover:bg-green-600 shadow-[4px_4px_0px_0px_rgba(22,163,74,0.4)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]' 
                              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <ExternalLink size={20} />
                          {isRTL ? 'فتح واتساب ويب' : 'Open WhatsApp Web'}
                        </button>
                    </div>

                </div>

              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: History (Span 5) */}
          <div className="lg:col-span-5">
            <div className="bg-white border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] h-full min-h-[500px] flex flex-col overflow-hidden">
              <LogTable history={history} onClear={() => setHistory([])} isRTL={isRTL} />
            </div>
          </div>

        </div>
        
        <div className="text-center py-6">
           <p className="font-handwriting text-slate-400 font-medium flex items-center justify-center gap-2 text-lg">
            Elias made by love <span className="text-red-400 animate-pulse">♥</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default App;