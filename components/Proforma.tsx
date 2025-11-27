
import React, { useState } from 'react';
import { Building2, FileText, Users, TrendingUp, AlertCircle, CheckCircle2, Globe, Zap, Briefcase, Award } from 'lucide-react';
import { CURRENCY_SYMBOL, TDS_TAX_RATE, REWARD_PER_AD } from '../constants';

export const Proforma: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'INCOME_RULES' | 'LEVEL_STRUCTURE'>('PROFILE');

  return (
    <div className="pb-24 pt-6 px-4">
      {/* Catchy Header with Colorful Logo */}
      <div className="bg-gradient-to-b from-gray-900 to-indigo-900 rounded-t-3xl p-8 text-white text-center relative overflow-hidden shadow-2xl">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-400 via-purple-900 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col items-center">
            {/* Catchy Colorful Company Logo */}
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-4 border-4 border-white/20 hover:rotate-0 transition-transform duration-500 group">
                <Globe size={48} className="text-white drop-shadow-md group-hover:animate-pulse" />
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Global
                </div>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                Global Ad Rewards
            </h1>
            <p className="text-indigo-200 text-xs mt-1 uppercase tracking-widest font-semibold">
                Digital Advertising & Marketing Pvt Ltd
            </p>
            
            <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] border border-white/10 flex items-center">
                    <Briefcase size={10} className="mr-1 text-yellow-400" /> CIN: U72900KA2024PTC88291
                </span>
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] border border-white/10 flex items-center">
                    <Award size={10} className="mr-1 text-green-400" /> ISO 9001:2015
                </span>
            </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="bg-white border-x border-b border-gray-200 p-2 flex gap-2 shadow-md relative z-20 -mt-2 rounded-b-xl mx-2">
         <button 
            onClick={() => setActiveTab('PROFILE')}
            className={`flex-1 py-3 text-[10px] font-bold uppercase rounded-lg transition-all flex flex-col items-center justify-center ${activeTab === 'PROFILE' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
         >
            <Building2 size={16} className="mb-1" />
            Company Profile
         </button>
         <button 
            onClick={() => setActiveTab('INCOME_RULES')}
            className={`flex-1 py-3 text-[10px] font-bold uppercase rounded-lg transition-all flex flex-col items-center justify-center ${activeTab === 'INCOME_RULES' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
         >
            <FileText size={16} className="mb-1" />
            Income Rules
         </button>
         <button 
            onClick={() => setActiveTab('LEVEL_STRUCTURE')}
            className={`flex-1 py-3 text-[10px] font-bold uppercase rounded-lg transition-all flex flex-col items-center justify-center ${activeTab === 'LEVEL_STRUCTURE' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
         >
            <Users size={16} className="mb-1" />
            Level Plan
         </button>
      </div>

      {/* Content Container */}
      <div className="mt-6 space-y-6">
         
         {/* TAB 1: BUSINESS PROFILE */}
         {activeTab === 'PROFILE' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 
                 {/* Visual Revenue Model */}
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                     <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 flex items-center border-l-4 border-indigo-600 pl-2">
                         Source of Income (Legal Flow)
                     </h3>
                     
                     <div className="flex flex-col items-center space-y-2 relative">
                         {/* Step 1 */}
                         <div className="w-full bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between">
                             <div className="flex items-center">
                                 <div className="bg-blue-500 text-white p-2 rounded-lg mr-3"><Globe size={16}/></div>
                                 <div>
                                     <p className="text-xs font-bold text-gray-800">International Advertisers</p>
                                     <p className="text-[9px] text-gray-500">Google, Meta, Amazon Ads</p>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <p className="text-xs font-bold text-blue-600">Pays CPM/CPC</p>
                             </div>
                         </div>
                         
                         <div className="h-4 w-0.5 bg-gray-300"></div>

                         {/* Step 2 */}
                         <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl flex items-center justify-between shadow-lg transform scale-105 z-10">
                             <div className="flex items-center">
                                 <div className="bg-white/20 p-2 rounded-lg mr-3"><Building2 size={16}/></div>
                                 <div>
                                     <p className="text-xs font-bold">Global Ad Rewards</p>
                                     <p className="text-[9px] text-indigo-200">Tech Intermediary Platform</p>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <p className="text-[10px] opacity-80">Retains 30% Fee</p>
                             </div>
                         </div>

                         <div className="h-4 w-0.5 bg-gray-300"></div>

                         {/* Step 3 */}
                         <div className="w-full bg-green-50 border border-green-100 p-3 rounded-xl flex items-center justify-between">
                             <div className="flex items-center">
                                 <div className="bg-green-500 text-white p-2 rounded-lg mr-3"><Users size={16}/></div>
                                 <div>
                                     <p className="text-xs font-bold text-gray-800">Verified Users (You)</p>
                                     <p className="text-[9px] text-gray-500">Watch Ads & Complete Tasks</p>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <p className="text-xs font-bold text-green-600">Receives 70% Share</p>
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                     <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 flex items-center border-l-4 border-yellow-500 pl-2">
                         Company Mission
                     </h3>
                     <p className="text-xs text-gray-600 leading-relaxed text-justify mb-4">
                         Global Ad Rewards is a registered digital marketing entity focused on Ad Arbitrage. We bridge the gap between premium global advertisers and authentic user engagement, ensuring transparent wealth distribution compliant with Indian Laws.
                     </p>
                     
                     <div className="grid grid-cols-2 gap-3">
                         <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                             <CheckCircle2 size={16} className="text-green-500 mr-2" />
                             <span className="text-[10px] font-semibold text-gray-700">GST Registered</span>
                         </div>
                         <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                             <CheckCircle2 size={16} className="text-green-500 mr-2" />
                             <span className="text-[10px] font-semibold text-gray-700">MSME Certified</span>
                         </div>
                         <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                             <CheckCircle2 size={16} className="text-green-500 mr-2" />
                             <span className="text-[10px] font-semibold text-gray-700">ISO 27001 (Security)</span>
                         </div>
                         <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                             <CheckCircle2 size={16} className="text-green-500 mr-2" />
                             <span className="text-[10px] font-semibold text-gray-700">Startup India</span>
                         </div>
                     </div>
                 </div>
             </div>
         )}

         {/* TAB 2: INCOME RULES */}
         {activeTab === 'INCOME_RULES' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                     <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-sm font-bold text-gray-800 uppercase flex items-center">
                            <Zap size={16} className="mr-2 text-yellow-600" /> Task Income Structure
                        </h3>
                     </div>
                     <table className="w-full text-xs">
                         <thead>
                             <tr className="bg-white border-b border-gray-100 text-gray-500">
                                 <th className="p-3 text-left">Plan</th>
                                 <th className="p-3 text-center">Ads/Day</th>
                                 <th className="p-3 text-right">Per Ad</th>
                                 <th className="p-3 text-right">Daily Income</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100 text-gray-700">
                             <tr>
                                 <td className="p-3 font-medium">Basic</td>
                                 <td className="p-3 text-center">5</td>
                                 <td className="p-3 text-right text-gray-500">{CURRENCY_SYMBOL}50</td>
                                 <td className="p-3 text-right font-bold">{CURRENCY_SYMBOL}250</td>
                             </tr>
                             <tr className="bg-indigo-50/50">
                                 <td className="p-3 font-bold text-indigo-700 flex items-center">
                                     Premium <span className="ml-1 text-[8px] bg-indigo-200 text-indigo-800 px-1 rounded">POPULAR</span>
                                 </td>
                                 <td className="p-3 text-center font-bold">10</td>
                                 <td className="p-3 text-right font-medium text-indigo-600">{CURRENCY_SYMBOL}{REWARD_PER_AD}</td>
                                 <td className="p-3 text-right font-bold text-indigo-700">{CURRENCY_SYMBOL}{REWARD_PER_AD * 10}</td>
                             </tr>
                             <tr>
                                 <td className="p-3 font-bold text-yellow-700 flex items-center">
                                     VIP <Award size={10} className="ml-1" />
                                 </td>
                                 <td className="p-3 text-center font-bold">20</td>
                                 <td className="p-3 text-right font-medium text-yellow-600">{CURRENCY_SYMBOL}150</td>
                                 <td className="p-3 text-right font-bold text-yellow-700">{CURRENCY_SYMBOL}3,000</td>
                             </tr>
                         </tbody>
                     </table>
                 </div>

                 <div className="bg-red-50 rounded-2xl p-5 border border-red-100 relative overflow-hidden">
                     <div className="absolute right-0 top-0 p-4 opacity-5">
                         <AlertCircle size={80} />
                     </div>
                     <h3 className="text-sm font-bold text-red-800 uppercase mb-3 flex items-center">
                         <AlertCircle size={16} className="mr-2" /> Govt. Tax Rules (TDS)
                     </h3>
                     <div className="space-y-2 text-xs text-red-700">
                         <p className="flex justify-between">
                             <span>TDS on Withdrawal (Section 194B):</span>
                             <span className="font-bold">{TDS_TAX_RATE * 100}%</span>
                         </p>
                         <p className="flex justify-between">
                             <span>VDA Tax (Crypto/Bitcoin):</span>
                             <span className="font-bold">30% + 1% TDS</span>
                         </p>
                         <p className="flex justify-between">
                             <span>Admin Charges:</span>
                             <span className="font-bold text-gray-900">0% (Waived)</span>
                         </p>
                     </div>
                     <div className="mt-4 pt-3 border-t border-red-200 text-[10px] text-red-600/80 leading-relaxed italic">
                         "As per Income Tax Act 1961, all payouts from task/gaming platforms are subject to deduction at source. Users must link PAN Card for tax credit (Form 26AS)."
                     </div>
                 </div>
             </div>
         )}

         {/* TAB 3: LEVEL INCOME */}
         {activeTab === 'LEVEL_STRUCTURE' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 
                 <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg mb-6 relative">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Users size={100} />
                     </div>
                     <h3 className="text-lg font-bold mb-1">Affiliate Network Plan</h3>
                     <p className="text-indigo-100 text-xs mb-4 max-w-[80%]">Earn continuous passive income from your team's daily ad activity.</p>
                     
                     <div className="flex items-center space-x-4">
                         <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                             <span className="text-[10px] text-indigo-200 block">Levels</span>
                             <span className="text-lg font-bold">3 Active</span>
                         </div>
                         <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                             <span className="text-[10px] text-indigo-200 block">Payout</span>
                             <span className="text-lg font-bold">Daily</span>
                         </div>
                     </div>
                 </div>

                 <div className="space-y-3">
                     {/* Level 1 Card */}
                     <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-500 flex justify-between items-center">
                         <div className="flex items-center">
                             <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-3">1</div>
                             <div>
                                 <h4 className="font-bold text-gray-900 text-sm">Direct Referrals</h4>
                                 <p className="text-[10px] text-gray-500">Members joined via your link</p>
                             </div>
                         </div>
                         <div className="text-right">
                             <p className="text-xs text-gray-400">Commission</p>
                             <p className="text-xl font-bold text-indigo-600">10%</p>
                         </div>
                     </div>

                     {/* Level 2 Card */}
                     <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500 flex justify-between items-center">
                         <div className="flex items-center">
                             <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-3">2</div>
                             <div>
                                 <h4 className="font-bold text-gray-900 text-sm">Team Growth</h4>
                                 <p className="text-[10px] text-gray-500">Friends of friends</p>
                             </div>
                         </div>
                         <div className="text-right">
                             <p className="text-xs text-gray-400">Commission</p>
                             <p className="text-xl font-bold text-purple-600">5%</p>
                         </div>
                     </div>

                     {/* Level 3 Card */}
                     <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-pink-500 flex justify-between items-center">
                         <div className="flex items-center">
                             <div className="bg-pink-100 text-pink-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-3">3</div>
                             <div>
                                 <h4 className="font-bold text-gray-900 text-sm">Network</h4>
                                 <p className="text-[10px] text-gray-500">Extended network chain</p>
                             </div>
                         </div>
                         <div className="text-right">
                             <p className="text-xs text-gray-400">Commission</p>
                             <p className="text-xl font-bold text-pink-600">2%</p>
                         </div>
                     </div>
                 </div>

                 <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                     <div className="flex items-center mb-2">
                         <TrendingUp size={16} className="text-yellow-600 mr-2" />
                         <span className="text-xs font-bold text-yellow-800 uppercase">Income Example</span>
                     </div>
                     <p className="text-[10px] text-yellow-700 leading-relaxed">
                         If you refer <strong>10 friends</strong> (Level 1) and they each earn {CURRENCY_SYMBOL}950/day:<br/>
                         Your Commission = 10 users × {CURRENCY_SYMBOL}950 × 10% = <strong>{CURRENCY_SYMBOL}950 Daily Passive Income</strong> without watching ads yourself.
                     </p>
                 </div>
             </div>
         )}
      </div>

      <div className="text-center mt-8 px-8">
          <p className="text-[9px] text-gray-400 font-medium">
              &copy; 2024 Global Ad Rewards Pvt Ltd. All Rights Reserved.<br/>
              Adhering to Information Technology Act, 2000 & Consumer Protection (E-Commerce) Rules, 2020.
          </p>
      </div>
    </div>
  );
};
