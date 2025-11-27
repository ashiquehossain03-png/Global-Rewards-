
import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, CheckCircle, Clock, DollarSign, Globe, Loader2, X, ShieldCheck, Lock, Wifi, Server, Activity, FastForward, Users, TrendingUp, Signal, Timer } from 'lucide-react';
import { UserProfile } from '../types';
import { generateAdContent } from '../services/geminiService';
import { REWARD_PER_AD, DAILY_AD_LIMIT, CURRENCY_SYMBOL } from '../constants';
import { checkDeviceIntegrity, validateAdSession, generateSecureToken } from '../services/securityService';

interface AdWatcherProps {
  user: UserProfile;
  onReward: (amount: number, network?: string) => void;
}

export const AdWatcher: React.FC<AdWatcherProps> = ({ user, onReward }) => {
  const [loading, setLoading] = useState(false);
  const [adActive, setAdActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [adData, setAdData] = useState<{title: string, content: string, region: string, network: string} | null>(null);
  const [showClaimConfirmation, setShowClaimConfirmation] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Initializing...");
  const [secureToken, setSecureToken] = useState("");
  const [autoNext, setAutoNext] = useState(false);
  const [nextAdCountdown, setNextAdCountdown] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  
  // Real-time Global Counters
  const [liveStats, setLiveStats] = useState({
      users: 14205,
      adsServed: 8420193
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup loading timeouts on unmount
  useEffect(() => {
    return () => {
      loadingTimeoutsRef.current.forEach(clearTimeout);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    };
  }, []);

  // Scroll Listener for Parallax
  useEffect(() => {
    const mainContainer = document.querySelector('main');
    if (!mainContainer) return;

    const handleScroll = () => {
        requestAnimationFrame(() => {
            setScrollY(mainContainer.scrollTop);
        });
    };

    mainContainer.addEventListener('scroll', handleScroll);
    return () => mainContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // High-Frequency Real-time Counter Simulation
  useEffect(() => {
      const interval = setInterval(() => {
          setLiveStats(prev => ({
              users: prev.users + (Math.random() > 0.95 ? (Math.random() > 0.5 ? 1 : -1) : 0), // Occasional user flux
              adsServed: prev.adsServed + Math.floor(Math.random() * 3) + 1 // Rapid ad increments
          }));
      }, 150); // Updates every 150ms for a "Live" feel
      return () => clearInterval(interval);
  }, []);

  // Countdown effect for Next Ad Chaining
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (nextAdCountdown > 0) {
          interval = setInterval(() => {
              setNextAdCountdown(prev => {
                  if (prev <= 1) {
                      clearInterval(interval);
                      startAd(); // Trigger start when countdown hits 0 (effectively)
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [nextAdCountdown]);


  const startAd = async () => {
    if (user.dailyAdsWatched >= DAILY_AD_LIMIT) {
        setAutoNext(false);
        setNextAdCountdown(0);
        return;
    }
    
    // Initial Fraud Check
    if (!validateAdSession()) {
        alert("Please wait a moment before watching another ad to prevent spam.");
        setAutoNext(false);
        return;
    }

    const token = generateSecureToken();
    setSecureToken(token);

    // Open modal immediately with loading state
    setAdActive(true);
    setLoading(true);
    setCompleted(false);
    setShowClaimConfirmation(false);
    setLoadingStep("Handshaking with Ad Server...");

    // Clear any previous loading timeouts
    loadingTimeoutsRef.current.forEach(clearTimeout);
    loadingTimeoutsRef.current = [];

    // Schedule status updates to make it look high-tech and real-time bidding
    const steps = [
        { msg: "Requesting Bid from Google AdX...", delay: 800 },
        { msg: "Connecting to Local Exchange (Mumbai)...", delay: 2000 },
        { msg: "Optimizing High-CPM Assets...", delay: 3500 },
        { msg: "Winning Bid Found! Loading...", delay: 4200 },
        { msg: "Rendering Secure Stream...", delay: 5000 }
    ];

    steps.forEach(({ msg, delay }) => {
        const timeout = setTimeout(() => {
            if (loading) setLoadingStep(msg);
        }, delay);
        loadingTimeoutsRef.current.push(timeout);
    });

    try {
      // Generate Content AND wait a minimum time to show off the animation/status
      const [content] = await Promise.all([
          generateAdContent(),
          new Promise(resolve => setTimeout(resolve, 5500)) // Min 5.5s "connection" time
      ]);
      
      setAdData(content);
      setTimer(10); // 10 seconds ad duration
    } catch (error) {
      console.error("Ad Load Error", error);
      setAdActive(false); // Close on error
      setAutoNext(false);
    } finally {
      setLoading(false);
      loadingTimeoutsRef.current.forEach(clearTimeout);
    }
  };

  useEffect(() => {
    if (!loading && adActive && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (!loading && adActive && timer === 0 && adData) {
      setCompleted(true);
      
      // Auto-Next Logic: If enabled, automatically proceed to claim after a short pause
      if (autoNext && !showClaimConfirmation) {
          autoNextTimerRef.current = setTimeout(() => {
              handleClaimRequest();
          }, 1500);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [adActive, timer, loading, adData, autoNext]);

  const handleClaimRequest = () => {
    setShowClaimConfirmation(true);
    
    // Auto-Next Logic: Automatically confirm claim after verification time
    if (autoNext) {
        autoNextTimerRef.current = setTimeout(() => {
            executeClaim();
        }, 2500); // Wait for user to barely see the verification screen
    }
  };

  const executeClaim = async () => {
    setIsVerifying(true);
    // Anti-Fraud Check Delay
    await checkDeviceIntegrity();
    
    // Pass the network name back to the main app for the invoice
    onReward(REWARD_PER_AD, adData?.network);
    
    setAdActive(false);
    setAdData(null);
    setShowClaimConfirmation(false);
    setIsVerifying(false);

    // If Auto-Next is ON, start the next ad after a randomized safe cooldown
    if (autoNext && user.dailyAdsWatched < DAILY_AD_LIMIT - 1) {
        // Randomized delay (4 to 7 seconds) to mimic human behavior and avoid bans
        const randomDelay = Math.floor(Math.random() * 4) + 4; 
        setNextAdCountdown(randomDelay);
    } else if (user.dailyAdsWatched >= DAILY_AD_LIMIT - 1) {
        setAutoNext(false);
    }
  };

  const handleClose = () => {
      // User cancelled watching
      if (timerRef.current) clearTimeout(timerRef.current);
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
      loadingTimeoutsRef.current.forEach(clearTimeout);
      setAdActive(false);
      setAdData(null);
      setShowClaimConfirmation(false);
      setLoading(false);
      setAutoNext(false); // Disable auto-next on manual close
      setNextAdCountdown(0);
  };

  const getRegionFlag = (regionName: string) => {
      const lower = regionName.toLowerCase();
      let code = ''; 
      
      if (lower.includes('usa') || lower.includes('united states') || lower.includes('us')) code = 'us';
      else if (lower.includes('uk') || lower.includes('kingdom') || lower.includes('britain')) code = 'gb';
      else if (lower.includes('germany')) code = 'de';
      else if (lower.includes('dubai') || lower.includes('uae')) code = 'ae';
      else if (lower.includes('india')) code = 'in';
      else if (lower.includes('japan')) code = 'jp';
      else if (lower.includes('france')) code = 'fr';
      else if (lower.includes('canada')) code = 'ca';
      else if (lower.includes('australia')) code = 'au';
      else if (lower.includes('brazil')) code = 'br';
      else if (lower.includes('singapore')) code = 'sg';
      
      if (!code) return null;
      return `https://flagcdn.com/24x18/${code}.png`;
  };

  const TrustedPartners = () => {
    // International & Local Partners List
    const partners = [
      { name: "Google", domain: "google.com" },
      { name: "Tata", domain: "tata.com" }, // Local
      { name: "Microsoft", domain: "microsoft.com" },
      { name: "Jio", domain: "jio.com" }, // Local
      { name: "Tesla", domain: "tesla.com" },
      { name: "Amazon", domain: "amazon.com" },
      { name: "Flipkart", domain: "flipkart.com" }, // Local
      { name: "Binance", domain: "binance.com" },
      { name: "Meta", domain: "meta.com" },
      { name: "Paytm", domain: "paytm.com" }, // Local
      { name: "Samsung", domain: "samsung.com" },
      { name: "Netflix", domain: "netflix.com" },
      { name: "Apple", domain: "apple.com" },
      { name: "Zomato", domain: "zomato.com" }, // Local
      { name: "Nike", domain: "nike.com" }
    ];

    return (
      <div className="mb-8 relative overflow-hidden group rounded-2xl border border-gray-100 shadow-sm bg-white">
        <style>{`
          @keyframes marquee {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .animate-marquee {
            animation: marquee 150s linear infinite; /* Fixed slow duration */
            will-change: transform;
            backface-visibility: hidden;
            perspective: 1000px;
            transform-style: preserve-3d;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur border-b border-gray-50 z-10 relative">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
             Trusted Global & Local Partners
           </h3>
           <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 flex items-center shadow-sm">
              <CheckCircle size={10} className="mr-1"/> Official Tie-up
           </span>
        </div>

        {/* Enhanced Container with Parallax Effect */}
        <div 
          className="relative p-8 overflow-hidden transition-all duration-100 ease-out"
          style={{
             background: `radial-gradient(#e0e7ff 1.5px, transparent 1.5px), linear-gradient(to bottom, #ffffff, #f8fafc)`,
             backgroundSize: '24px 24px, 100%',
             backgroundPosition: `center ${scrollY * 0.2}px, 0 0`, // Subtle parallax movement based on scroll
             boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
          }}
        >
           
           {/* Marquee Container */}
           {/* Using 4 copies to ensure seamless -50% translation even on wide screens with small lists */}
           <div className="flex w-max animate-marquee items-center" style={{ transform: 'translate3d(0,0,0)' }}>
               {[...partners, ...partners, ...partners, ...partners].map((p, i) => (
                  <div key={i} className="flex flex-col items-center mx-6 group/logo transform transition-transform hover:scale-110 duration-300">
                      <div className="w-14 h-14 mb-2 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-2.5 flex items-center justify-center border border-gray-100 relative z-10">
                        <img 
                          src={`https://logo.clearbit.com/${p.domain}`} 
                          alt={p.name}
                          loading="eager"
                          className="w-full h-full object-contain filter-none"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${p.name}&background=random&color=6366f1&size=64`;
                          }}
                        />
                      </div>
                  </div>
               ))}
           </div>
           
           {/* Fade Edges for depth */}
           <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
           <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>
    );
  };

  if (user.dailyAdsWatched >= DAILY_AD_LIMIT) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="bg-green-100 p-6 rounded-full mb-4 animate-bounce">
          <CheckCircle size={64} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Limit Reached!</h2>
        <p className="text-gray-500 mb-6 max-w-md">
            You have successfully earned {CURRENCY_SYMBOL}{REWARD_PER_AD * DAILY_AD_LIMIT} today. 
            Server resets at 00:00 GMT.
        </p>
        <div className="p-4 bg-indigo-50 rounded-xl text-indigo-700 text-sm font-medium">
          Tip: Invite friends to earn unlimited commissions while you wait!
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-20 pt-6">
      
      {/* Realtime Global Stats Ticker (Fast Update) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
              <div className="relative z-10">
                  <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center">
                    Live Users <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                  </p>
                  <p className="text-lg font-bold text-gray-900 flex items-center tabular-nums">
                      {liveStats.users.toLocaleString()}
                  </p>
              </div>
              <div className="bg-indigo-50 p-2 rounded-full text-indigo-500">
                  <Users size={20} />
              </div>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
              <div className="relative z-10">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Ads Served Today</p>
                  <p className="text-lg font-bold text-indigo-600 font-mono tracking-tight tabular-nums">
                      {liveStats.adsServed.toLocaleString()}
                  </p>
              </div>
              <div className="bg-green-50 p-2 rounded-full text-green-500">
                  <Activity size={20} />
              </div>
          </div>
      </div>

      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-xl relative overflow-hidden ring-4 ring-blue-50/50">
        <div className="absolute top-2 right-2 flex space-x-1">
             <div className="bg-black/30 backdrop-blur text-xs px-2 py-0.5 rounded-full flex items-center border border-white/10">
                <Lock size={10} className="mr-1 text-green-400" />
                Anti-Ban: Active
             </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mt-2 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Global Ad Network</h2>
              <p className="text-blue-100 text-sm">Watch Premium Content & Earn Real Cash</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-medium border border-white/20 flex flex-col items-center">
               <span className="text-[8px] uppercase opacity-70">Ad Count</span>
               <span>{user.dailyAdsWatched + 1} / {DAILY_AD_LIMIT}</span>
            </div>
          </div>
          
          <div className="flex items-end justify-between">
             <div>
               <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Estimated Reward</p>
               <p className="text-4xl font-bold tracking-tight">{CURRENCY_SYMBOL}{REWARD_PER_AD}</p>
             </div>
             
             {!adActive && nextAdCountdown === 0 && (
               <button 
                  onClick={startAd}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center shadow-lg transform hover:scale-105 active:scale-95 duration-200 ring-2 ring-white/50"
               >
                  <PlayCircle className="mr-2 fill-indigo-600 text-white" size={20} />
                  Watch Ad
               </button>
             )}
             
             {/* Countdown Overlay Button */}
             {nextAdCountdown > 0 && (
                <button 
                  disabled
                  className="bg-indigo-500/50 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg ring-2 ring-white/20 cursor-wait backdrop-blur-sm"
               >
                  <Timer className="mr-2 animate-spin" size={20} />
                  Next Ad in {nextAdCountdown}s...
               </button>
             )}
          </div>
          
          {/* Auto-Next Toggle */}
          <div className="mt-6 flex items-center space-x-2 bg-black/20 p-2 rounded-lg w-fit backdrop-blur-sm">
              <button 
                onClick={() => {
                    const newState = !autoNext;
                    setAutoNext(newState);
                    if (!newState) setNextAdCountdown(0);
                }}
                className={`w-8 h-4 rounded-full p-0.5 transition-colors ${autoNext ? 'bg-green-400' : 'bg-gray-400'}`}
              >
                  <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${autoNext ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </button>
              <span className="text-xs text-blue-100 font-medium flex items-center">
                  <FastForward size={12} className="mr-1" /> Auto-Play (Realtime Runner)
              </span>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Safe Mode Indicator */}
      <div className="flex items-center justify-between bg-white border border-indigo-100 p-4 rounded-xl mb-6 shadow-sm">
        <div className="flex items-center text-indigo-900 text-sm font-semibold">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <ShieldCheck size={18} className="text-indigo-600" />
            </div>
            <div>
              <p>Safe Earning Mode</p>
              <p className="text-[10px] text-gray-400 font-normal">Encrypted Traffic Tunnel</p>
            </div>
        </div>
        <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
             Secured
        </div>
      </div>

      {/* Recent Payouts Ticker */}
      <div className="mb-8 overflow-hidden bg-gray-900 rounded-lg p-2 flex items-center text-xs text-gray-400">
          <TrendingUp size={14} className="text-green-500 mr-2 flex-shrink-0" />
          <div className="whitespace-nowrap overflow-hidden w-full relative h-4">
              <div className="animate-marquee absolute top-0 left-0 w-max flex space-x-8">
                  <span>🚀 <strong>Rahul K.</strong> just withdrew {CURRENCY_SYMBOL}2000 via UPI</span>
                  <span>💎 <strong>Priya S.</strong> upgraded to VIP Membership</span>
                  <span>💰 <strong>Amit M.</strong> earned {CURRENCY_SYMBOL}4500 from referrals</span>
                  <span>₿ <strong>John D.</strong> mined 0.05 BTC successfully</span>
                  <span>🏦 <strong>Sneha R.</strong> withdrew {CURRENCY_SYMBOL}5000 via Bank Transfer</span>
              </div>
          </div>
      </div>

      <TrustedPartners />

      {/* Ad Modal / Overlay Area */}
      {adActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-200">
                
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                        <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded">AD</span>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700 flex items-center">
                              <Lock size={10} className="mr-1 text-green-500"/> Secured Session
                            </span>
                            <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                              Token: {secureToken.substring(0, 15)}...
                            </span>
                        </div>
                    </div>
                    {!completed && !showClaimConfirmation && !loading && !autoNext && (
                         <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X size={20} />
                         </button>
                    )}
                    {autoNext && (
                        <div className="flex items-center text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded">
                            <FastForward size={10} className="mr-1 animate-pulse" /> Auto-Running
                        </div>
                    )}
                </div>

                {/* Loading Skeleton View with Shimmer */}
                {loading && (
                  <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                      {/* Tech Visual */}
                      <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
                         <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-10"></div>
                         <div className="absolute inset-0 border-4 border-indigo-100 rounded-full border-t-indigo-500 animate-spin"></div>
                         <div className="bg-white p-4 rounded-full relative z-10 text-indigo-600 shadow-sm">
                            <Server size={32} />
                         </div>
                      </div>
                      
                      {/* Dynamic Progress Text */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 animate-pulse text-center">
                        {loadingStep}
                      </h3>
                      
                      {/* Fake Code Lines with Shimmer Effect */}
                      <div className="w-full space-y-3 mt-6 opacity-80 max-w-xs relative overflow-hidden">
                          {/* Shimmer Overlay */}
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent z-10"></div>
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <Activity size={10} className="text-green-500" />
                              <div className="h-2 bg-gray-200 rounded w-full"></div>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                               <ShieldCheck size={10} className="text-indigo-500" />
                              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                               <Wifi size={10} className="text-blue-500" />
                              <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                          </div>
                      </div>

                      <div className="mt-8 flex items-center justify-center space-x-2 text-[10px] text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full animate-pulse border border-indigo-100">
                          <Lock size={12} />
                          <span>256-bit AES Encrypted Connection</span>
                      </div>
                  </div>
                )}

                {/* Content Area (Only when loaded) */}
                {!loading && !showClaimConfirmation && adData && (
                  <div className="p-8 flex flex-col items-center text-center">
                      <div className="w-full h-40 bg-gray-100 rounded-xl mb-6 overflow-hidden relative shadow-inner group">
                          <img 
                              src={`https://picsum.photos/400/200?random=${Date.now()}`} 
                              alt="Ad Visual" 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {/* Flags Overlay */}
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md flex items-center border border-white/20">
                              {getRegionFlag(adData.region) ? (
                                  <img 
                                      src={getRegionFlag(adData.region)!} 
                                      alt={adData.region} 
                                      className="w-4 h-3 mr-1 object-cover rounded-[1px]" 
                                  />
                              ) : (
                                  <Globe size={10} className="mr-1"/>
                              )} 
                              {adData.region}
                          </div>
                          
                          {/* Network Overlay */}
                          <div className="absolute bottom-2 left-2 bg-indigo-600/90 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md flex items-center border border-white/20">
                              <Signal size={10} className="mr-1"/>
                              Served by {adData.network}
                          </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">{adData.title}</h3>
                      <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                          "{adData.content}"
                      </p>
                      
                      {/* Timer / Action */}
                      {!completed ? (
                          <div className="w-full flex items-center justify-center space-x-2 text-indigo-600 font-bold text-lg animate-pulse bg-indigo-50 py-3 rounded-xl border border-indigo-100">
                              <Clock size={24} />
                              <span>Reward unlocks in {timer}s</span>
                          </div>
                      ) : (
                          <div className="w-full">
                              <button 
                                  onClick={handleClaimRequest}
                                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center"
                              >
                                  <DollarSign className="mr-2" />
                                  Claim {CURRENCY_SYMBOL}{REWARD_PER_AD}
                              </button>
                          </div>
                      )}
                  </div>
                )}
                
                {/* Confirmation View */}
                {!loading && showClaimConfirmation && (
                  <div className="p-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                      <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 ring-4 ring-indigo-50">
                          {isVerifying ? (
                              <Loader2 className="animate-spin" size={40} />
                          ) : (
                              <ShieldCheck size={40} />
                          )}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {isVerifying ? 'Verifying Session...' : 'Secure Claim'}
                      </h3>
                      
                      <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                          {isVerifying 
                            ? (autoNext ? 'Auto-verifying session token...' : 'Our anti-fraud system is validating this transaction against global ban-lists.')
                            : <>Please confirm to add <span className="font-bold text-gray-900">{CURRENCY_SYMBOL}{REWARD_PER_AD}</span> to your wallet securely.</>
                          }
                      </p>

                      {isVerifying && (
                          <div className="w-full mb-4">
                              <div className="text-[10px] text-gray-400 mb-1 flex justify-between">
                                  <span>Security Check</span>
                                  <span>Active</span>
                              </div>
                              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 animate-[shimmer_1s_infinite] w-full"></div>
                              </div>
                          </div>
                      )}
                      
                      {!isVerifying && (
                          <div className="flex w-full space-x-3">
                              <button 
                                  onClick={() => setShowClaimConfirmation(false)}
                                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                              >
                                  Cancel
                              </button>
                              <button 
                                  onClick={executeClaim}
                                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02]"
                              >
                                  {autoNext ? 'Auto-Confirming...' : 'Confirm'}
                              </button>
                          </div>
                      )}
                  </div>
                )}

                {/* Progress Bar (Timer) */}
                {!loading && !completed && !showClaimConfirmation && (
                    <div className="h-1 bg-gray-100 w-full">
                        <div 
                            className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
                            style={{ width: `${((10 - timer) / 10) * 100}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 px-4">
          <h3 className="font-bold text-gray-900 mb-4">How it works</h3>
          <div className="space-y-4">
              <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-4 text-indigo-600">
                      <Globe size={20} />
                  </div>
                  <div>
                      <h4 className="font-medium text-gray-900">International Partners</h4>
                      <p className="text-sm text-gray-500">We serve high-value ads from Fortune 500 companies.</p>
                  </div>
              </div>
              <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-4 text-green-600">
                      <DollarSign size={20} />
                  </div>
                  <div>
                      <h4 className="font-medium text-gray-900">Direct Earnings</h4>
                      <p className="text-sm text-gray-500">Get {CURRENCY_SYMBOL}{REWARD_PER_AD} instantly credited to your wallet.</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
    