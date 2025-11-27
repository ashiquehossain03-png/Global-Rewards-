import React, { useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Zap, ChevronUp, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

interface LeaderboardProps {
  user: UserProfile;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'allTime'>('daily');
  
  // Mock Data
  const leaders = [
    { id: 1, name: "Vikram Singh", earned: 45000, badge: 'VIP', country: '🇮🇳' },
    { id: 2, name: "Sarah Jenkins", earned: 42300, badge: 'VIP', country: '🇺🇸' },
    { id: 3, name: "Rahul K.", earned: 38900, badge: 'Premium', country: '🇮🇳' },
    { id: 4, name: "Ahmed Al-Fayed", earned: 31000, badge: 'Premium', country: '🇦🇪' },
    { id: 5, name: "Maria Garcia", earned: 28500, badge: 'Basic', country: '🇪🇸' },
    { id: 6, name: "John Doe", earned: 25000, badge: 'Basic', country: '🇬🇧' },
    { id: 7, name: "Arjun Kumar", earned: user.totalEarned, badge: user.accountLevel, country: '🇮🇳', isUser: true }, // The user
    { id: 8, name: "Wei Chen", earned: 12000, badge: 'Basic', country: '🇨🇳' },
  ].sort((a, b) => b.earned - a.earned);

  return (
    <div className="pb-20 pt-6">
      {/* Promotion Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-6 text-white mb-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
            <Crown size={80} className="rotate-12" />
        </div>
        <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-1 flex items-center">
                <Zap className="mr-2 fill-yellow-200 text-yellow-100" />
                Boost Your Rank
            </h2>
            <p className="text-yellow-100 text-sm mb-4">Promote your profile to get 2x referral traffic.</p>
            <button className="bg-white text-amber-700 font-bold py-2 px-6 rounded-full shadow-lg hover:bg-yellow-50 transition-colors flex items-center text-sm">
                Promote Now <ChevronUp size={16} className="ml-1" />
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6">
          <button 
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'daily' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500'}`}
          >
            Daily Top 100
          </button>
          <button 
             onClick={() => setActiveTab('allTime')}
             className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'allTime' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500'}`}
          >
            All Time Legends
          </button>
      </div>

      {/* Current User Rank Bar */}
      <div className="bg-indigo-900 text-white p-4 rounded-xl mb-6 flex items-center justify-between shadow-lg border border-indigo-700">
          <div className="flex items-center">
             <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-indigo-500">
                #{leaders.findIndex(l => l.isUser) + 1}
             </div>
             <div className="ml-3">
                 <p className="font-bold text-sm">Your Position</p>
                 <p className="text-xs text-indigo-300">Top 15% of earners</p>
             </div>
          </div>
          <div className="text-right">
              <p className="text-xl font-bold text-yellow-400">{CURRENCY_SYMBOL}{user.totalEarned.toLocaleString()}</p>
              <div className="flex items-center text-[10px] text-green-400 justify-end">
                  <TrendingUp size={10} className="mr-1" />
                  Rising
              </div>
          </div>
      </div>

      {/* Leaderboard List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center">
                  <Trophy size={18} className="text-yellow-500 mr-2" />
                  Global Leaders
              </h3>
              <span className="text-xs text-gray-500 flex items-center">
                  <ShieldCheck size={12} className="mr-1 text-green-600" />
                  Verified Earnings
              </span>
          </div>
          
          <div className="divide-y divide-gray-50">
              {leaders.map((leader, index) => {
                  let rankIcon;
                  let rankClass = "bg-gray-100 text-gray-500";
                  
                  if (index === 0) {
                      rankIcon = <Crown size={20} className="text-yellow-500 fill-yellow-500" />;
                      rankClass = "bg-yellow-100 text-yellow-700";
                  } else if (index === 1) {
                      rankIcon = <Medal size={20} className="text-gray-400 fill-gray-400" />;
                      rankClass = "bg-gray-200 text-gray-700";
                  } else if (index === 2) {
                      rankIcon = <Medal size={20} className="text-amber-700 fill-amber-700" />;
                      rankClass = "bg-amber-100 text-amber-800";
                  } else {
                      rankIcon = <span className="font-bold">{index + 1}</span>;
                  }

                  return (
                      <div key={leader.id} className={`p-4 flex items-center justify-between ${leader.isUser ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50'}`}>
                          <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${rankClass}`}>
                                  {rankIcon}
                              </div>
                              <div>
                                  <div className="flex items-center">
                                    <p className={`font-bold text-sm ${leader.isUser ? 'text-indigo-900' : 'text-gray-900'}`}>
                                        {leader.name} {leader.isUser && '(You)'}
                                    </p>
                                    <span className="ml-2 text-xs">{leader.country}</span>
                                  </div>
                                  <div className="flex items-center mt-1">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium 
                                        ${leader.badge === 'VIP' ? 'bg-yellow-100 text-yellow-700' : 
                                          leader.badge === 'Premium' ? 'bg-purple-100 text-purple-700' : 
                                          'bg-gray-100 text-gray-500'}`}>
                                          {leader.badge}
                                      </span>
                                  </div>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="font-bold text-gray-900">{CURRENCY_SYMBOL}{leader.earned.toLocaleString()}</p>
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};