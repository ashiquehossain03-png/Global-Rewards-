

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Globe, ShieldCheck, ChevronRight, Check, X, Crown, CheckCircle2, Building2, FileCheck, Shield, Wifi, Trophy, Cpu, Download, FileText, Star, Users, ArrowRight } from 'lucide-react';
import { UserProfile, ViewState } from '../types';
import { CURRENCY_SYMBOL, APP_NAME, VIP_COST, VIP_DURATION_MONTHS, VIP_REFERRAL_TARGET } from '../constants';

interface DashboardProps {
  user: UserProfile;
  onNavigate: (view: ViewState) => void;
  onInstall?: () => void;
  onUpgrade?: (method: 'PAID' | 'TASK') => void;
}

// Enhanced Mock Data for Income vs Expenditure
const weeklyData = [
  { name: 'Mon', income: 950, expense: 0 },
  { name: 'Tue', income: 1900, expense: 500 },
  { name: 'Wed', income: 950, expense: 2000 }, // Withdrawal day
  { name: 'Thu', income: 2850, expense: 0 },
  { name: 'Fri', income: 950, expense: 150 },
  { name: 'Sat', income: 1450, expense: 0 },
  { name: 'Sun', income: 0, expense: 0 }, // Current day (updated dynamically)
];

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onInstall, onUpgrade }) => {
  const [selectedTier, setSelectedTier] = useState<'Basic' | 'Premium' | 'VIP'>('Premium');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Update chart data for current day based on real-time user stats
  const currentChartData = weeklyData.map(item => ({ ...item }));
  currentChartData[6].income = user.dailyAdsWatched * 95; 

  // Calculate Weekly Totals for Indicators
  const weeklyIncome = currentChartData.reduce((acc, curr) => acc + curr.income, 0);
  const weeklyExpense = currentChartData.reduce((acc, curr) => acc + curr.expense, 0);

  const tiers = {
    Basic: {
      color: 'gray',
      badge: 'Free Forever',
      dailyLimit: 5,
      rate: 50,
      features: [
        { label: 'Local Ad Access', available: true },
        { label: 'Standard Support', available: true },
        { label: 'International Ads (US/EU)', available: false },
        { label: 'Priority Withdrawal', available: false },
        { label: 'Dedicated Account Manager', available: false },
      ]
    },
    Premium: {
      color: 'indigo',
      badge: 'Most Popular',
      dailyLimit: 10,
      rate: 95,
      features: [
        { label: 'Local Ad Access', available: true },
        { label: 'Priority Support', available: true },
        { label: 'International Ads (US/EU)', available: true },
        { label: 'Priority Withdrawal', available: true },
        { label: 'Dedicated Account Manager', available: false },
      ]
    },
    VIP: {
      color: 'yellow',
      badge: 'High Income',
      dailyLimit: 20,
      rate: 150,
      features: [
        { label: 'Global Ad Access', available: true },
        { label: '24/7 VIP Support', available: true },
        { label: 'High-Ticket Ads', available: true },
        { label: 'Instant Withdrawal', available: true },
        { label: 'Dedicated Account Manager', available: true },
      ]
    }
  };

  const currentTierData = tiers[selectedTier];

  const handleUpgradeClick = () => {
      if (selectedTier === 'VIP') {
          setShowUpgradeModal(true);
      } else {
          alert("Currently, direct upgrade is only available for VIP. Please select VIP.");
      }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
        <div className="flex items-center space-x-2 mt-2">
            <div className="flex items-center text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded border border-green-100">
                <ShieldCheck size={14} className="mr-1" />
                <span>Account Verified</span>
            </div>
            {user.accountLevel === 'VIP' && (
                <div className="flex items-center text-xs text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-100">
                    <Crown size={14} className="mr-1 fill-amber-700" />
                    <span>VIP Member</span>
                </div>
            )}
            <div className="flex items-center text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100">
                <Wifi size={14} className="mr-1" />
                <span>Secure Connection</span>
            </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign size={64} className="text-primary" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Balance</p>
          <h3 className="text-3xl font-bold text-gray-900">{CURRENCY_SYMBOL}{user.balance.toLocaleString()}</h3>
          <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
            <TrendingUp size={16} className="mr-1" />
            <span>+12.5% vs last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Today's Ads</p>
          <h3 className="text-3xl font-bold text-gray-900">{user.dailyAdsWatched} <span className="text-lg text-gray-400 font-normal">/ {user.accountLevel === 'VIP' ? 20 : 10}</span></h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${(user.dailyAdsWatched / (user.accountLevel === 'VIP' ? 20 : 10)) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20">
            <Globe size={64} className="text-white" />
          </div>
          <p className="text-indigo-100 font-medium mb-1">Account Tier</p>
          <h3 className="text-3xl font-bold mb-2 flex items-center">
             {user.accountLevel}
             {user.accountLevel === 'VIP' && <Crown size={24} className="ml-2 text-yellow-400 fill-yellow-400" />}
          </h3>
          {user.vipExpiry ? (
               <p className="text-indigo-100 text-xs opacity-90">Valid until: {new Date(user.vipExpiry).toLocaleDateString()}</p>
          ) : (
               <p className="text-indigo-100 text-sm opacity-90">Access to high-paying EU & US ads enabled.</p>
          )}
        </div>
      </div>

      {/* Proforma / Company Rules Widget */}
      <div 
        onClick={() => onNavigate(ViewState.PROFORMA)}
        className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors shadow-sm"
      >
        <div className="flex items-center">
            <div className="bg-blue-100 text-blue-700 p-3 rounded-xl mr-4 border border-blue-200">
                <FileText size={24} />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">Company Proforma & Rules</h3>
                <p className="text-xs text-gray-500">View Legal, Income Levels & Policies</p>
            </div>
        </div>
        <ChevronRight className="text-gray-400" />
      </div>

      {/* Install App Widget */}
      <div 
        onClick={onInstall}
        className="bg-gray-100 border border-gray-200 p-4 rounded-2xl flex items-center justify-between cursor-pointer active:bg-gray-200 transition-colors"
      >
        <div className="flex items-center">
            <div className="bg-indigo-600 text-white p-3 rounded-xl mr-4 shadow-sm">
                <Download size={24} />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">Install App</h3>
                <p className="text-xs text-gray-500">Add to Home Screen for faster access</p>
            </div>
        </div>
        <ChevronRight className="text-gray-400" />
      </div>

      {/* Cash Flow Analytics Chart */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 flex items-center">
                <Activity className="mr-2 text-indigo-600" size={20} />
                Financial Flow (Weekly)
            </h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">Last 7 Days</span>
        </div>

        {/* Summary Indicators */}
        <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-green-50 rounded-xl p-3 border border-green-100">
                <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1 flex items-center">
                    <TrendingUp size={12} className="mr-1"/> Income
                </p>
                <p className="text-lg font-bold text-gray-900">{CURRENCY_SYMBOL}{weeklyIncome.toLocaleString()}</p>
            </div>
            <div className="flex-1 bg-red-50 rounded-xl p-3 border border-red-100">
                <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1 flex items-center">
                    <TrendingDown size={12} className="mr-1"/> Expenditure
                </p>
                <p className="text-lg font-bold text-gray-900">{CURRENCY_SYMBOL}{weeklyExpense.toLocaleString()}</p>
            </div>
        </div>

        {/* Dual Flow Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area 
                type="monotone" 
                dataKey="income" 
                name="Income"
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                name="Expenditure"
                stroke="#EF4444" 
                fillOpacity={1} 
                fill="url(#colorExpense)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mining Widget */}
      <div 
        onClick={() => onNavigate(ViewState.MINING)}
        className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between text-white cursor-pointer shadow-lg transform transition-transform hover:scale-[1.02] border border-green-500/30 overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
        <div className="flex items-center relative z-10">
            <div className="bg-green-500/20 p-3 rounded-xl mr-4 border border-green-500/50">
                <Cpu size={24} className="text-green-400" />
            </div>
            <div>
                <h3 className="font-bold text-lg flex items-center text-green-50">
                    Bitcoin Cloud Mining
                    <span className="ml-2 text-[10px] bg-green-500 text-black px-1.5 font-bold rounded">ACTIVE</span>
                </h3>
                <p className="text-gray-400 text-sm">Offline Yield: 0.2 BTC/Day</p>
            </div>
        </div>
        <ChevronRight className="text-white/80" />
      </div>

      {/* Live Ranking Widget */}
      <div 
        onClick={() => onNavigate(ViewState.LEADERBOARD)}
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 flex items-center justify-between text-white cursor-pointer shadow-lg transform transition-transform hover:scale-[1.02]"
      >
        <div className="flex items-center">
            <div className="bg-yellow-500/20 p-3 rounded-xl mr-4 border border-yellow-500/30">
                <Trophy size={24} className="text-yellow-400" />
            </div>
            <div>
                <h3 className="font-bold text-lg flex items-center text-yellow-50">
                    Live Rankings
                    <span className="ml-2 text-[10px] bg-red-500 text-white px-1.5 rounded animate-pulse">LIVE</span>
                </h3>
                <p className="text-gray-400 text-sm">Check your position & Promote Profile</p>
            </div>
        </div>
        <ChevronRight className="text-white/80" />
      </div>
      
      {/* Account Tiers */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Membership Tiers</h3>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                  {(Object.keys(tiers) as Array<keyof typeof tiers>).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedTier === tier ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                      >
                          {tier}
                      </button>
                  ))}
              </div>
          </div>
          
          <div className={`p-6 rounded-xl relative overflow-hidden transition-colors duration-300 ${
              selectedTier === 'VIP' ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200' :
              selectedTier === 'Premium' ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200' :
              'bg-gray-50 border border-gray-200'
          }`}>
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h4 className={`text-xl font-bold ${
                          selectedTier === 'VIP' ? 'text-amber-800' :
                          selectedTier === 'Premium' ? 'text-indigo-800' :
                          'text-gray-800'
                      }`}>
                          {selectedTier} Plan
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          selectedTier === 'VIP' ? 'bg-yellow-200 text-yellow-800' :
                          selectedTier === 'Premium' ? 'bg-indigo-200 text-indigo-800' :
                          'bg-gray-200 text-gray-600'
                      }`}>
                          {currentTierData.badge}
                      </span>
                  </div>
                  <div className="text-right">
                      <p className="text-sm text-gray-500">Rate per Ad</p>
                      <p className={`text-2xl font-bold ${
                          selectedTier === 'VIP' ? 'text-amber-600' :
                          selectedTier === 'Premium' ? 'text-indigo-600' :
                          'text-gray-600'
                      }`}>
                          {CURRENCY_SYMBOL}{currentTierData.rate}
                      </p>
                  </div>
              </div>

              <div className="space-y-3">
                  {currentTierData.features.map((feature, i) => (
                      <div key={i} className="flex items-center text-sm">
                          {feature.available ? (
                              <CheckCircle2 size={16} className={`mr-2 ${
                                  selectedTier === 'VIP' ? 'text-amber-600' :
                                  selectedTier === 'Premium' ? 'text-indigo-600' :
                                  'text-gray-500'
                              }`} />
                          ) : (
                              <X size={16} className="mr-2 text-gray-300" />
                          )}
                          <span className={feature.available ? 'text-gray-700 font-medium' : 'text-gray-400 line-through'}>
                              {feature.label}
                          </span>
                      </div>
                  ))}
              </div>

              {user.accountLevel === selectedTier ? (
                  <div className="mt-6 w-full py-3 bg-white/50 border border-white/50 rounded-xl text-center font-bold text-gray-500 text-sm flex items-center justify-center">
                      <Check size={16} className="mr-1" /> Current Plan
                  </div>
              ) : (
                  <button 
                    onClick={handleUpgradeClick}
                    className={`mt-6 w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center ${
                      selectedTier === 'VIP' ? 'bg-gradient-to-r from-yellow-500 to-amber-600' :
                      selectedTier === 'Premium' ? 'bg-indigo-600' :
                      'bg-gray-800'
                  }`}>
                      {selectedTier === 'Basic' ? 'Downgrade' : 'Upgrade Now'} 
                      {selectedTier === 'VIP' && <Crown size={16} className="ml-2" />}
                  </button>
              )}
          </div>
      </div>

      {/* VIP Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200 border border-yellow-200">
                 {/* Decorative Header */}
                 <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-20">
                         <Crown size={80} className="text-white rotate-12" />
                     </div>
                     <div className="relative z-10 text-white">
                         <div className="flex justify-between items-start">
                             <div>
                                <h2 className="text-2xl font-bold flex items-center">
                                    <Crown className="mr-2 fill-yellow-200" /> Unlock VIP Status
                                </h2>
                                <p className="text-yellow-100 text-sm mt-1">Get 20 Ads/Day + Instant Withdrawal</p>
                             </div>
                             <button onClick={() => setShowUpgradeModal(false)} className="text-white/80 hover:text-white bg-black/20 p-2 rounded-full">
                                 <X size={20} />
                             </button>
                         </div>
                     </div>
                 </div>

                 <div className="p-6">
                     <p className="text-center text-gray-600 text-sm mb-6">Choose how you want to upgrade to VIP for <span className="font-bold text-gray-900">{VIP_DURATION_MONTHS} Months</span>:</p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         
                         {/* Option 1: Free Task */}
                         <div className="border-2 border-dashed border-indigo-200 bg-indigo-50 rounded-2xl p-4 flex flex-col items-center text-center relative hover:bg-indigo-100/50 transition-colors">
                             <div className="bg-indigo-200 p-2 rounded-full mb-3 text-indigo-700">
                                 <Users size={24} />
                             </div>
                             <h3 className="font-bold text-indigo-900">Task Based (Free)</h3>
                             <p className="text-xs text-indigo-600 mb-4 h-8 flex items-center">Refer {VIP_REFERRAL_TARGET} friends to unlock VIP for free.</p>
                             
                             <div className="w-full mb-4">
                                 <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                                     <span>Progress</span>
                                     <span>{user.referrals} / {VIP_REFERRAL_TARGET}</span>
                                 </div>
                                 <div className="w-full bg-white rounded-full h-2">
                                     <div 
                                        className="bg-indigo-600 h-2 rounded-full transition-all" 
                                        style={{ width: `${Math.min((user.referrals / VIP_REFERRAL_TARGET) * 100, 100)}%` }}
                                     ></div>
                                 </div>
                             </div>
                             
                             <button 
                                onClick={() => {
                                    if(user.referrals >= VIP_REFERRAL_TARGET) {
                                        onUpgrade?.('TASK');
                                        setShowUpgradeModal(false);
                                    }
                                }}
                                disabled={user.referrals < VIP_REFERRAL_TARGET}
                                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all mt-auto ${
                                    user.referrals >= VIP_REFERRAL_TARGET 
                                    ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                             >
                                 {user.referrals >= VIP_REFERRAL_TARGET ? 'Claim VIP Now' : 'Keep Referring'}
                             </button>
                         </div>

                         {/* Option 2: Paid */}
                         <div className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-4 flex flex-col items-center text-center relative hover:shadow-md transition-shadow">
                             <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                 BEST VALUE
                             </div>
                             <div className="bg-yellow-200 p-2 rounded-full mb-3 text-yellow-800">
                                 <Star size={24} className="fill-yellow-600" />
                             </div>
                             <h3 className="font-bold text-yellow-900">Paid Subscription</h3>
                             <p className="text-xs text-yellow-700 mb-4 h-8 flex items-center">Instant upgrade. Valid for 6 months.</p>
                             
                             <div className="my-auto">
                                 <p className="text-3xl font-bold text-gray-900">{CURRENCY_SYMBOL}{VIP_COST}</p>
                                 <p className="text-[10px] text-gray-500 line-through">Original Price: {CURRENCY_SYMBOL}2000</p>
                             </div>

                             <button 
                                onClick={() => {
                                    onUpgrade?.('PAID');
                                    setShowUpgradeModal(false);
                                }}
                                className="w-full py-2.5 bg-black text-yellow-400 rounded-xl text-xs font-bold shadow-lg mt-4 hover:bg-gray-900 transition-colors flex items-center justify-center"
                             >
                                 Pay & Upgrade <ArrowRight size={12} className="ml-1" />
                             </button>
                         </div>

                     </div>
                 </div>
                 
                 <div className="bg-gray-50 p-3 text-center text-[10px] text-gray-400 border-t border-gray-100">
                     By upgrading, you agree to the VIP Terms of Service. Payments are non-refundable.
                 </div>
             </div>
        </div>
      )}
      
      {/* Compliance Footer */}
      <div className="mt-8 border-t border-gray-200 pt-8 px-2">
          <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center">
                  <Building2 className="text-gray-400 mr-3" size={24} />
                  <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Registered Entity</p>
                      <p className="text-xs font-semibold text-gray-700">{APP_NAME} Pvt Ltd</p>
                      <p className="text-[10px] text-gray-500">CIN: U72900KA2024PTC...</p>
                  </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center">
                  <FileCheck className="text-gray-400 mr-3" size={24} />
                  <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Tax Compliant</p>
                      <p className="text-xs font-semibold text-gray-700">GST & TDS Filed</p>
                      <p className="text-[10px] text-gray-500">TAN: BLRG12345C</p>
                  </div>
              </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4 grayscale opacity-60">
             <div className="flex items-center text-[10px] font-bold text-gray-500">
                <Shield size={12} className="mr-1" /> SSL Secured
             </div>
             <div className="h-3 w-px bg-gray-300"></div>
             <div className="flex items-center text-[10px] font-bold text-gray-500">
                <Wifi size={12} className="mr-1" /> 256-bit Encryption
             </div>
          </div>
      </div>
    </div>
  );
};