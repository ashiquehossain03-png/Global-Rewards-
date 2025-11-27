import React, { useState } from 'react';
import { Copy, Share2, Gift, CheckCircle, Users, Network, Lock, ChevronRight, UserPlus, TrendingUp } from 'lucide-react';
import { UserProfile, TeamLevel } from '../types';
import { CURRENCY_SYMBOL, REFERRAL_BONUS, APP_NAME } from '../constants';

interface ReferralProps {
  user: UserProfile;
}

export const Referral: React.FC<ReferralProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'invite' | 'team'>('invite');

  // Mock Team Level Data
  const teamLevels: TeamLevel[] = [
      { level: 1, label: "Direct Referrals", commission: "10%", members: user.referrals, earnings: user.referralEarnings, unlocked: true, requirement: "None" },
      { level: 2, label: "Team Growth", commission: "5%", members: 12, earnings: 450, unlocked: user.referrals >= 5, requirement: "5 Direct Referrals" },
      { level: 3, label: "Network Leaders", commission: "2%", members: 45, earnings: 1200, unlocked: user.referrals >= 20, requirement: "20 Direct Referrals" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Join ${APP_NAME}`,
      text: `Use my code ${user.referralCode} to join ${APP_NAME} and start earning ₹950 daily!`,
      url: 'https://globaladrewards.app' // Mock URL
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopy();
    }
  };

  const recentReferrals = [
    { name: 'Rahul S.', date: 'Today', status: 'Active' },
    { name: 'Priya M.', date: 'Yesterday', status: 'Active' },
    { name: 'Amit K.', date: '2 days ago', status: 'Active' },
  ];

  return (
    <div className="pb-20 pt-6">
      {/* View Switcher */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6 mx-1">
          <button 
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center ${activeTab === 'invite' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500'}`}
          >
            <UserPlus size={16} className="mr-2" />
            Invite Friends
          </button>
          <button 
             onClick={() => setActiveTab('team')}
             className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center ${activeTab === 'team' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500'}`}
          >
            <Network size={16} className="mr-2" />
            My Team & Levels
          </button>
      </div>

      {activeTab === 'invite' ? (
        <>
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center shadow-xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div className="relative z-10">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Gift size={32} className="text-yellow-300" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Refer & Earn</h1>
                <p className="text-indigo-100 text-lg mb-6">
                    Get <span className="font-bold text-yellow-300">{CURRENCY_SYMBOL}{REFERRAL_BONUS}</span> for every friend who joins!
                </p>
                
                <div className="bg-white text-gray-900 rounded-xl p-4 flex items-center justify-between shadow-lg max-w-xs mx-auto">
                    <div className="text-left">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Your Referral Code</p>
                    <p className="text-xl font-mono font-bold tracking-widest text-indigo-700">{user.referralCode}</p>
                    </div>
                    <button 
                        onClick={handleCopy}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                    >
                        {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                    </button>
                </div>

                <button 
                    onClick={handleShare}
                    className="mt-6 w-full max-w-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-xl flex items-center justify-center mx-auto transition-transform hover:scale-105"
                >
                    <Share2 size={18} className="mr-2" />
                    Invite Friends Now
                </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">{CURRENCY_SYMBOL}{user.referralEarnings}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm mb-1">Friends Invited</p>
                <p className="text-2xl font-bold text-indigo-600">{user.referrals}</p>
                </div>
            </div>

            {/* How it works */}
            <div className="mb-8 px-2">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">How it works</h3>
                <div className="space-y-6 relative">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>
                
                <div className="relative flex items-start">
                    <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 shrink-0 border-4 border-slate-50">1</div>
                    <div className="ml-4 pt-1">
                    <h4 className="font-bold text-gray-900">Share your code</h4>
                    <p className="text-sm text-gray-500">Send your unique code to friends via WhatsApp or Social Media.</p>
                    </div>
                </div>

                <div className="relative flex items-start">
                    <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 shrink-0 border-4 border-slate-50">2</div>
                    <div className="ml-4 pt-1">
                    <h4 className="font-bold text-gray-900">Friend Signs Up</h4>
                    <p className="text-sm text-gray-500">Your friend joins and watches their first ad.</p>
                    </div>
                </div>

                <div className="relative flex items-start">
                    <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 shrink-0 border-4 border-slate-50">3</div>
                    <div className="ml-4 pt-1">
                    <h4 className="font-bold text-gray-900">You Earn Money</h4>
                    <p className="text-sm text-gray-500">You instantly get {CURRENCY_SYMBOL}{REFERRAL_BONUS} in your wallet.</p>
                    </div>
                </div>
                </div>
            </div>

            {/* Recent Referrals List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Recent Invites</h3>
                <span className="text-xs text-indigo-600 font-medium">View All</span>
                </div>
                <div className="divide-y divide-gray-50">
                {recentReferrals.map((ref, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                        {ref.name.charAt(0)}
                        </div>
                        <div>
                        <p className="font-medium text-sm text-gray-900">{ref.name}</p>
                        <p className="text-xs text-gray-400">{ref.date}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle size={12} className="mr-1" />
                        {ref.status}
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </>
      ) : (
        <>
            {/* Level Income Header */}
            <div className="bg-indigo-900 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Network size={100} />
                 </div>
                 <h2 className="text-xl font-bold mb-1">Multi-Level Earnings</h2>
                 <p className="text-indigo-200 text-sm mb-4">Build your team to unlock passive income streams.</p>
                 
                 <div className="flex items-center justify-between bg-indigo-800 p-3 rounded-lg border border-indigo-700">
                     <div>
                         <p className="text-xs text-indigo-300">Total Network Earnings</p>
                         <p className="text-xl font-bold text-yellow-400">{CURRENCY_SYMBOL} {(user.referralEarnings + 1650).toLocaleString()}</p>
                     </div>
                     <div className="text-right">
                         <p className="text-xs text-indigo-300">Total Members</p>
                         <p className="text-xl font-bold">{user.referrals + 57}</p>
                     </div>
                 </div>
            </div>

            {/* Levels List */}
            <div className="space-y-4">
                {teamLevels.map((lvl) => (
                    <div key={lvl.level} className={`border rounded-xl p-4 transition-all ${lvl.unlocked ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-90'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-3 ${lvl.unlocked ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                    {lvl.level}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 flex items-center">
                                        {lvl.label}
                                        {lvl.unlocked ? (
                                            <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">Active</span>
                                        ) : (
                                            <span className="ml-2 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded border border-gray-300 flex items-center">
                                                <Lock size={8} className="mr-1" /> Locked
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-xs text-gray-500">Commission: <span className="font-bold text-indigo-600">{lvl.commission}</span></p>
                                </div>
                            </div>
                            {lvl.unlocked && (
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400">Earnings</p>
                                    <p className="font-bold text-green-600">{CURRENCY_SYMBOL}{lvl.earnings}</p>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar or Members */}
                        {lvl.unlocked ? (
                             <div className="bg-gray-50 p-2 rounded-lg flex justify-between items-center text-xs">
                                 <span className="text-gray-600 flex items-center"><Users size={12} className="mr-1"/> {lvl.members} Active Members</span>
                                 <span className="text-indigo-600 font-medium flex items-center">View List <ChevronRight size={12} /></span>
                             </div>
                        ) : (
                             <div className="mt-2">
                                 <div className="flex justify-between text-xs text-gray-500 mb-1">
                                     <span>Unlock Progress</span>
                                     <span>{user.referrals} / {parseInt(lvl.requirement)}</span>
                                 </div>
                                 <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                     <div 
                                        className="h-full bg-indigo-500 rounded-full" 
                                        style={{ width: `${Math.min((user.referrals / parseInt(lvl.requirement)) * 100, 100)}%` }}
                                     ></div>
                                 </div>
                                 <p className="text-xs text-red-500 mt-2 flex items-center">
                                     <Lock size={12} className="mr-1" /> Requires {lvl.requirement} to unlock
                                 </p>
                             </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center">
                <div className="bg-yellow-100 p-2 rounded-full mr-3 text-yellow-700">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-yellow-800">Boost Level Income</h4>
                    <p className="text-xs text-yellow-700">Upgrade to VIP to double your Level 2 & 3 commissions instantly.</p>
                </div>
            </div>
        </>
      )}
    </div>
  );
};