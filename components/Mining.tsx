
import React, { useState, useEffect } from 'react';
import { Cpu, Server, Zap, Database, Play, Pause, Activity, Globe, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../types';
import { BTC_PER_SECOND, VDA_DISCLAIMER } from '../constants';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface MiningProps {
  user: UserProfile;
  onUpdateBalance: (amount: number) => void;
}

interface Block {
    height: number;
    hash: string;
    reward: string;
    status: string;
    time: string;
}

export const Mining: React.FC<MiningProps> = ({ user, onUpdateBalance }) => {
  const [isMining, setIsMining] = useState(false);
  const [hashRate, setHashRate] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [minedBlocks, setMinedBlocks] = useState<Block[]>([
      { height: 841204, hash: '000...f2a9', reward: '0.00000045', status: 'Verified', time: '12:01:05' },
      { height: 841203, hash: '000...3d11', reward: '0.00000042', status: 'Verified', time: '12:00:42' },
      { height: 841202, hash: '000...99c4', reward: '0.00000048', status: 'Verified', time: '12:00:15' },
  ]);
  
  // Mock Graph Data
  const [chartData, setChartData] = useState(Array(20).fill({ value: 40 }));

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isMining) {
      // Ramp up hash rate
      const rampUp = setInterval(() => {
        setHashRate(prev => {
          if (prev < 145.5) return prev + Math.random() * 5;
          return 145 + Math.random(); // Fluctuate around 145 TH/s
        });
      }, 200);

      // Main Mining Loop
      interval = setInterval(() => {
        // Add earning
        onUpdateBalance(BTC_PER_SECOND);

        // Update Chart
        setChartData(prev => {
          const newData = [...prev.slice(1), { value: 140 + Math.random() * 20 }];
          return newData;
        });

        // Add Logs
        const logMessages = [
           "Block verified...",
           "Hash found: 00000000000000000004b...",
           "Share accepted (32ms)",
           "Cloud Node US-East-1: Synced",
           "Optimizing power efficiency...",
           "Receiving block header...",
           "Validation complete. Reward credited."
        ];
        
        if (Math.random() > 0.7) {
            const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
            const time = new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'});
            setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 5)]);
        }

        // Simulate Block Finding (Ledger Update)
        if (Math.random() > 0.8) {
            setMinedBlocks(prev => {
                const lastHeight = prev.length > 0 ? prev[0].height : 841205;
                const newBlock: Block = {
                    height: lastHeight + 1,
                    hash: '000...' + Math.random().toString(16).substring(2, 6),
                    reward: (0.00000040 + Math.random() * 0.00000020).toFixed(8),
                    status: 'Verified',
                    time: new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})
                };
                return [newBlock, ...prev.slice(0, 4)];
            });
        }

      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(rampUp);
      };
    } else {
      setHashRate(0);
    }
  }, [isMining, onUpdateBalance]);

  return (
    <div className="pb-24 pt-4 bg-gray-900 min-h-screen text-green-500 font-mono relative">
      {/* Header */}
      <div className="px-6 mb-6 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-white flex items-center">
              <Cpu className="mr-2 text-green-500" />
              Bitcoin Cloud Miner
           </h2>
           <p className="text-xs text-gray-400">Server Status: <span className="text-green-400 animate-pulse">Online</span></p>
        </div>
        <div className="text-right">
           <div className="text-[10px] text-gray-500 uppercase">Current Balance</div>
           <div className="text-2xl font-bold text-yellow-400 font-sans tracking-wider">
             {user.btcBalance.toFixed(8)} <span className="text-sm">BTC</span>
           </div>
        </div>
      </div>

      {/* Main Mining Visualization */}
      <div className="px-4 mb-6">
        <div className="bg-black border border-green-500/30 rounded-xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                   <div className="text-xs text-gray-400 mb-1">Current Hashrate</div>
                   <div className="text-3xl font-bold text-white tabular-nums">
                      {hashRate.toFixed(2)} <span className="text-sm text-green-500 font-normal">TH/s</span>
                   </div>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isMining ? 'border-green-500 text-green-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'border-gray-700 text-gray-700'}`}>
                    <Activity className={isMining ? 'animate-pulse' : ''} />
                </div>
            </div>

            {/* Chart */}
            <div className="h-32 -mx-2 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorHash" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <YAxis domain={[120, 180]} hide />
                        <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#colorHash)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Control Button */}
            <button 
                onClick={() => setIsMining(!isMining)}
                className={`w-full py-4 rounded-lg font-bold flex items-center justify-center transition-all ${
                    isMining 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                    : 'bg-green-500 text-black hover:bg-green-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                }`}
            >
                {isMining ? (
                    <><Pause className="mr-2" fill="currentColor" /> Stop Mining</>
                ) : (
                    <><Play className="mr-2" fill="currentColor" /> Start Cloud Node</>
                )}
            </button>
        </div>
      </div>

      {/* Terminal Logs */}
      <div className="px-4 mb-6">
          <div className="bg-black/50 border border-gray-800 rounded-lg p-3 font-mono text-xs h-32 overflow-hidden relative">
              <div className="absolute top-2 right-2 flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <div className="text-gray-500 mb-2 border-b border-gray-800 pb-1">User@{user.name.split(' ')[0]}_Node:~# tail -f miner.log</div>
              <div className="space-y-1">
                  {logs.map((log, i) => (
                      <div key={i} className="text-green-400/80 truncate">{log}</div>
                  ))}
                  {isMining && <div className="animate-pulse">_</div>}
              </div>
          </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
              <div className="flex items-center text-gray-400 text-xs mb-1">
                  <Server size={14} className="mr-1" />
                  <span>Nodes Active</span>
              </div>
              <div className="text-white font-bold">12 / 15</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
              <div className="flex items-center text-gray-400 text-xs mb-1">
                  <Zap size={14} className="mr-1" />
                  <span>Daily Yield</span>
              </div>
              <div className="text-white font-bold">~0.2000 BTC</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
              <div className="flex items-center text-gray-400 text-xs mb-1">
                  <Globe size={14} className="mr-1" />
                  <span>Network</span>
              </div>
              <div className="text-white font-bold">Global (Low Latency)</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
              <div className="flex items-center text-gray-400 text-xs mb-1">
                  <ShieldCheck size={14} className="mr-1" />
                  <span>Security</span>
              </div>
              <div className="text-green-400 font-bold">Encrypted</div>
          </div>
      </div>

      {/* Live Block Ledger */}
      <div className="px-4 mb-6">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center">
              <Database size={16} className="mr-2 text-indigo-400" />
              Live Block Ledger
          </h3>
          <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-md">
               <div className="grid grid-cols-4 bg-gray-800 p-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-700">
                   <div>Height</div>
                   <div>Time</div>
                   <div className="text-right">Reward</div>
                   <div className="text-right">Status</div>
               </div>
               <div className="divide-y divide-gray-800">
                   {minedBlocks.map((block, i) => (
                       <div key={i} className="grid grid-cols-4 p-3 text-xs items-center animate-in fade-in slide-in-from-top-2 duration-300">
                           <div className="text-indigo-400 font-mono">#{block.height}</div>
                           <div className="text-gray-500">{block.time}</div>
                           <div className="text-right text-yellow-500 font-bold">{parseFloat(block.reward).toFixed(7)}</div>
                           <div className="text-right flex justify-end">
                               <span className="flex items-center bg-green-500/10 text-green-500 px-2 py-0.5 rounded-[4px] text-[10px] font-medium border border-green-500/20">
                                   <CheckCircle2 size={8} className="mr-1" /> Verified
                               </span>
                           </div>
                       </div>
                   ))}
               </div>
          </div>
      </div>

      {/* Offline Mining Notice */}
      <div className="px-4 mb-8">
          <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-xl flex items-start">
              <div className="bg-indigo-500/20 p-2 rounded-lg mr-3">
                  <Database className="text-indigo-400" size={20} />
              </div>
              <div>
                  <h3 className="text-white font-bold text-sm">Offline Mining Active</h3>
                  <p className="text-indigo-200 text-xs mt-1">
                      Our cloud servers continue to mine 0.2 BTC/day even when you close the app. 
                      No battery or data drain on your device.
                  </p>
              </div>
          </div>
      </div>

      {/* Mandatory Regulatory Warning (Sticky Footer) */}
      <div className="bg-black/90 text-gray-500 p-3 text-[10px] text-center border-t border-gray-800">
          <div className="flex justify-center items-center mb-1 text-gray-400">
              <AlertTriangle size={12} className="mr-1 text-yellow-500" />
              <span className="font-bold">Govt. Regulatory Warning (ASCI)</span>
          </div>
          {VDA_DISCLAIMER}
      </div>
    </div>
  );
};
