
import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, PlayCircle, Wallet as WalletIcon, Menu, Users, Cpu, User, Zap } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AdWatcher } from './components/AdWatcher';
import { Wallet } from './components/Wallet';
import { Referral } from './components/Referral';
import { SupportChat } from './components/SupportChat';
import { Leaderboard } from './components/Leaderboard';
import { Mining } from './components/Mining';
import { Login } from './components/Login';
import { Profile } from './components/Profile';
import { Proforma } from './components/Proforma';
import { ViewState, UserProfile, PaymentMethod, Transaction } from './types';
import { APP_NAME, MOCK_TRANSACTIONS, TDS_TAX_RATE, CRYPTO_TAX_RATE, BTC_PER_SECOND, OFFLINE_MINING_EFFICIENCY, DAILY_BTC_LIMIT, VIP_COST, VIP_DURATION_MONTHS, CURRENCY_SYMBOL } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [offlineEarnings, setOfflineEarnings] = useState<number>(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Default Initial State
  const defaultUser: UserProfile = {
    name: "Arjun Kumar",
    email: "arjun.k@example.com",
    balance: 1450,
    btcBalance: 0.00500000,
    totalEarned: 12500,
    dailyAdsWatched: 0,
    accountLevel: 'Premium',
    referralCode: 'ARJUN2024',
    referralEarnings: 750,
    referrals: 3,
    bankDetails: undefined,
    cryptoDetails: undefined
  };

  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [transactions, setTransactions] = useState<Transaction[]>([...MOCK_TRANSACTIONS]);

  // 1. Load Data from LocalStorage on Mount
  useEffect(() => {
    const savedUser = localStorage.getItem('gar_user_data');
    const savedTx = localStorage.getItem('gar_transactions');

    if (savedUser) {
        try {
            const parsedUser = JSON.parse(savedUser);
            // Merge with default to ensure new fields (like vipExpiry) exist if schema changes
            setUser({ ...defaultUser, ...parsedUser });
        } catch (e) {
            console.error("Failed to parse user data", e);
        }
    }
    
    if (savedTx) {
        try {
            setTransactions(JSON.parse(savedTx));
        } catch (e) {
            console.error("Failed to parse transactions", e);
        }
    }

    setIsDataLoaded(true);
  }, []);

  // 2. Save Data to LocalStorage whenever it changes
  useEffect(() => {
      if (isDataLoaded) {
          localStorage.setItem('gar_user_data', JSON.stringify(user));
          localStorage.setItem('gar_transactions', JSON.stringify(transactions));
      }
  }, [user, transactions, isDataLoaded]);

  // 3. Offline Mining & Heartbeat Logic
  useEffect(() => {
    if (!isDataLoaded) return;

    // Check for Offline Earnings
    const lastActiveTime = localStorage.getItem('lastActiveTime');
    if (lastActiveTime) {
        const lastTime = parseInt(lastActiveTime);
        if (!isNaN(lastTime)) {
            const now = Date.now();
            const diffSeconds = (now - lastTime) / 1000;
            
            // If user was away for more than 1 minute and less than 24 hours
            if (diffSeconds > 60 && diffSeconds < 86400) {
                const calculatedEarnings = diffSeconds * BTC_PER_SECOND * OFFLINE_MINING_EFFICIENCY;
                // Cap at a reasonable daily limit portion to prevent abuse
                const cappedEarnings = Math.min(calculatedEarnings, DAILY_BTC_LIMIT * 0.5);
                
                if (cappedEarnings > 0.00000001) {
                    setOfflineEarnings(cappedEarnings);
                    setUser(prev => ({
                        ...prev,
                        btcBalance: prev.btcBalance + cappedEarnings
                    }));
                }
            }
        }
    }

    // Start Heartbeat (Updates timestamp every 5 seconds)
    const heartbeat = setInterval(() => {
        localStorage.setItem('lastActiveTime', Date.now().toString());
    }, 5000);

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isDataLoaded]);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
      });
    } else {
      alert("To install on iOS: Tap 'Share' icon below and select 'Add to Home Screen'.\n\nOn Android: Tap three dots menu and select 'Install App'.");
    }
  };

  const handleLogin = useCallback((identifier: string, password: string, type: 'PHONE' | 'USER_ID') => {
    // Only check password for User ID login
    if (type === 'USER_ID' && password.length < 4) {
        alert("Password must be at least 4 characters.");
        return;
    }

    if (type === 'PHONE') {
        // If it's a new phone number login, ideally we would fetch their specific data
        // For this demo, we just update the name to show it worked
        setUser(prev => ({
            ...prev,
            name: `User ${identifier.slice(-4)}`
        }));
    }
    
    setIsAuthenticated(true);
  }, []);

  const handleUpdateProfile = useCallback((updatedFields: Partial<UserProfile>) => {
      setUser(prev => ({
          ...prev,
          ...updatedFields
      }));
  }, []);

  const handleVIPUpgrade = useCallback((method: 'PAID' | 'TASK') => {
      if (method === 'PAID') {
          if (user.balance < VIP_COST) {
              alert(`Insufficient Balance! You need ${CURRENCY_SYMBOL}${VIP_COST} to upgrade. Please earn more from ads.`);
              return;
          }
          
          const newTx: Transaction = {
              id: `sub_${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              amount: VIP_COST,
              currency: 'INR',
              type: 'WITHDRAWAL', // Debit
              status: 'COMPLETED',
              method: 'VIP Subscription Fee',
              details: `6 Month Membership Upgrade`,
              netAmount: VIP_COST // No tax on internal purchase usually, or inclusive
          };

          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + VIP_DURATION_MONTHS);

          setUser(prev => ({
              ...prev,
              balance: prev.balance - VIP_COST,
              accountLevel: 'VIP',
              vipExpiry: expiryDate.toISOString()
          }));
          setTransactions(prev => [newTx, ...prev]);
          alert("Successfully upgraded to VIP! Enjoy enhanced benefits.");

      } else if (method === 'TASK') {
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + VIP_DURATION_MONTHS);

          setUser(prev => ({
              ...prev,
              accountLevel: 'VIP',
              vipExpiry: expiryDate.toISOString()
          }));
          alert("Task Verified! VIP Status Unlocked for free.");
      }
  }, [user.balance]);

  // Use useCallback to prevent AdWatcher from re-rendering or causing loops
  const handleReward = useCallback((amount: number, network?: string) => {
    setUser(prev => ({
      ...prev,
      balance: prev.balance + amount,
      totalEarned: prev.totalEarned + amount,
      dailyAdsWatched: prev.dailyAdsWatched + 1
    }));
    
    // Use the specific network if provided by AdWatcher, otherwise fallback
    const sourceCompany = network || 'Google Ad Exchange (AdX)';

    const newTx: Transaction = {
        id: `earn_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: amount,
        currency: 'INR',
        type: 'EARNING',
        status: 'COMPLETED',
        method: sourceCompany, // This ensures valid Company Name on Invoice
        details: 'Premium Ad Campaign / Task Completion'
    };
    setTransactions(prev => [newTx, ...prev]);
  }, []);

  // Use useCallback to prevent Mining interval from resetting
  const handleMiningUpdate = useCallback((amount: number) => {
    setUser(prev => ({
      ...prev,
      btcBalance: prev.btcBalance + amount
    }));
  }, []);

  const handleWithdraw = useCallback((amount: number, method: PaymentMethod, details: string, currency: 'INR' | 'BTC') => {
    const taxRate = currency === 'BTC' ? CRYPTO_TAX_RATE : TDS_TAX_RATE;
    const tax = amount * taxRate;
    const net = amount - tax;

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: amount,
      currency: currency,
      tax: tax,
      netAmount: net,
      details: details,
      type: 'WITHDRAWAL',
      status: 'PENDING',
      method: currency === 'BTC' ? 'Direct BTC Withdrawal' : (method === PaymentMethod.BANK_TRANSFER ? 'Bank Transfer' : 'Binance (USDT)'),
      failureReason: undefined // Default to undefined
    };

    setTransactions(prev => [newTx, ...prev]);

    // Simulate Server Processing
    setTimeout(() => {
        setTransactions(prev => prev.map(t => 
            t.id === newTx.id ? { ...t, status: 'COMPLETED' } : t
        ));

        setUser(prev => ({
            ...prev,
            balance: currency === 'INR' ? prev.balance - amount : prev.balance,
            btcBalance: currency === 'BTC' ? prev.btcBalance - amount : prev.btcBalance
        }));
    }, 4000);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard user={user} onNavigate={setCurrentView} onInstall={handleInstallClick} onUpgrade={handleVIPUpgrade} />;
      case ViewState.EARN:
        return <AdWatcher user={user} onReward={handleReward} />;
      case ViewState.REFERRAL:
        return <Referral user={user} />;
      case ViewState.WALLET:
        return <Wallet user={user} transactions={transactions} onWithdraw={handleWithdraw} />;
      case ViewState.LEADERBOARD:
        return <Leaderboard user={user} />;
      case ViewState.MINING:
        return <Mining user={user} onUpdateBalance={handleMiningUpdate} />;
      case ViewState.PROFILE:
        return (
            <Profile 
                user={user} 
                onUpdateUser={handleUpdateProfile} 
                onLogout={() => {
                  setIsAuthenticated(false);
                  // Optional: clear persisted data on logout? 
                  // localStorage.removeItem('gar_user_data');
                }} 
            />
        );
      case ViewState.PROFORMA:
        return <Proforma />;
      default:
        return <Dashboard user={user} onNavigate={setCurrentView} onInstall={handleInstallClick} onUpgrade={handleVIPUpgrade} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
        currentView === view ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon size={24} className={`mb-1 transition-transform ${currentView === view ? 'scale-110' : ''}`} strokeWidth={currentView === view ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100">
      
      {/* Top Bar */}
      <header className={`backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center border-b ${currentView === ViewState.MINING ? 'bg-black/90 border-gray-800 text-white' : 'bg-white/80 border-gray-100'}`}>
        <div className="flex items-center">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mr-2 ${currentView === ViewState.MINING ? 'bg-green-500 text-black' : 'bg-indigo-600 text-white'}`}>
                G
            </div>
            <span className={`font-bold text-lg tracking-tight ${currentView === ViewState.MINING ? 'text-white' : 'text-gray-900'}`}>{APP_NAME}</span>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={() => setCurrentView(ViewState.PROFILE)}
                className={`p-2 rounded-full transition-colors overflow-hidden border border-transparent ${currentView === ViewState.PROFILE ? 'border-indigo-200 bg-indigo-50' : ''} ${currentView === ViewState.MINING ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
                {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                    <User size={20} />
                )}
            </button>
            <button className={`p-2 rounded-full ${currentView === ViewState.MINING ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                <Menu size={20} />
            </button>
        </div>
      </header>

      {/* Offline Earnings Notification */}
      {offlineEarnings > 0 && (
          <div className="absolute top-16 left-0 right-0 z-50 p-4 animate-in fade-in slide-in-from-top-4">
              <div className="bg-green-600 text-white rounded-xl shadow-lg p-4 flex justify-between items-center border border-green-500">
                  <div className="flex items-center">
                      <div className="bg-white/20 p-2 rounded-full mr-3">
                          <Zap size={20} className="text-yellow-300 fill-current" />
                      </div>
                      <div>
                          <p className="font-bold text-sm">Cloud Mining Active</p>
                          <p className="text-xs text-green-100">You earned {offlineEarnings.toFixed(8)} BTC while away!</p>
                      </div>
                  </div>
                  <button onClick={() => setOfflineEarnings(0)} className="bg-white text-green-700 px-3 py-1 rounded-lg text-xs font-bold">
                      Claim
                  </button>
              </div>
          </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto px-6 pt-6 scroll-smooth ${currentView === ViewState.MINING ? 'bg-gray-900' : ''}`}>
        {renderContent()}
      </main>

      {/* Support Chat Overlay */}
      <SupportChat />

      {/* Bottom Navigation */}
      <nav className={`border-t px-4 py-2 pb-6 sticky bottom-0 z-40 grid grid-cols-5 gap-1 ${currentView === ViewState.MINING ? 'bg-black border-gray-800' : 'bg-white border-gray-100'}`}>
        <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Home" />
        <NavItem view={ViewState.EARN} icon={PlayCircle} label="Earn" />
        <NavItem view={ViewState.MINING} icon={Cpu} label="Mining" />
        <NavItem view={ViewState.WALLET} icon={WalletIcon} label="Wallet" />
        <NavItem view={ViewState.REFERRAL} icon={Users} label="Team" />
      </nav>
      
    </div>
  );
};

export default App;
