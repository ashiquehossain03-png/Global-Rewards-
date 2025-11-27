
import React, { useState } from 'react';
import { Smartphone, User, ArrowRight, ShieldCheck, Lock, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { APP_NAME } from '../constants';

interface LoginProps {
  onLogin: (identifier: string, password: string, type: 'PHONE' | 'USER_ID') => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [method, setMethod] = useState<'PHONE' | 'USER_ID'>('PHONE');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Validate Indian Mobile Number
  const validatePhone = (phone: string) => {
    const regex = /^[6-9]\d{9}$/; 
    return regex.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (method === 'PHONE') {
        if (!validatePhone(identifier)) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }
    } else {
        // User ID Step
        if (!identifier.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }
    }

    setIsLoading(true);

    // Simulate API Login / Verification
    setTimeout(() => {
      setIsLoading(false);
      // Pass empty password for phone login as OTP is removed
      onLogin(identifier, method === 'PHONE' ? 'NO_AUTH' : password, method);
    }, 1500);
  };

  const resetFlow = (newMethod: 'PHONE' | 'USER_ID') => {
      setMethod(newMethod);
      setError('');
      setIdentifier('');
      setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-gray-100">
        
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={80} className="text-white rotate-12" />
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
            <span className="text-3xl font-bold text-white">G</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{APP_NAME}</h1>
          <p className="text-indigo-200 text-sm mt-1">
             {method === 'PHONE' ? 'Instant Mobile Login' : 'Member Secure Access'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 mt-4 mx-4 bg-gray-50 rounded-xl border border-gray-100">
          <button
            onClick={() => resetFlow('PHONE')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center transition-all ${
              method === 'PHONE' 
                ? 'bg-white text-indigo-600 shadow-sm border border-gray-200' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Smartphone size={14} className="mr-2" /> Mobile Number
          </button>
          <button
            onClick={() => resetFlow('USER_ID')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center transition-all ${
              method === 'USER_ID' 
                ? 'bg-white text-indigo-600 shadow-sm border border-gray-200' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <User size={14} className="mr-2" /> User ID
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-4">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg border border-red-100 flex items-center animate-in fade-in slide-in-from-top-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Input Step: Phone or UserID */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    {method === 'PHONE' ? 'Mobile Number' : 'User ID'}
                </label>
                <div className="relative">
                    <div className="absolute left-3 top-3.5 text-gray-400">
                    {method === 'PHONE' ? <Smartphone size={18} /> : <User size={18} />}
                    </div>
                    {method === 'PHONE' && (
                    <span className="absolute left-10 top-3.5 text-gray-500 font-medium text-sm border-r border-gray-200 pr-2 mr-2">
                        +91
                    </span>
                    )}
                    <input
                    type={method === 'PHONE' ? 'tel' : 'text'}
                    value={identifier}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (method === 'PHONE' && !/^\d*$/.test(val)) return; // Only allow numbers for phone
                        setIdentifier(val);
                    }}
                    placeholder={method === 'PHONE' ? '98765 43210' : 'Enter your User ID'}
                    className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 ${method === 'PHONE' ? 'pl-24' : 'pl-10'}`}
                    maxLength={method === 'PHONE' ? 10 : 20}
                    />
                </div>
            </div>

            {/* Password Field (Only for User ID) */}
            {method === 'USER_ID' && (
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative">
                        <div className="absolute left-3 top-3.5 text-gray-400">
                        <Lock size={18} />
                        </div>
                        <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 pl-10 pr-10"
                        />
                        <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                 </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-8 w-full text-white font-bold rounded-xl text-sm px-5 py-4 text-center shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center ${
                isLoading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                Secure Login <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </button>

          {method === 'USER_ID' && (
            <div className="mt-6 text-center">
                <a href="#" className="text-xs text-indigo-600 font-medium hover:underline flex items-center justify-center">
                <KeyRound size={12} className="mr-1"/> Forgot Password?
                </a>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our <a href="#" className="text-indigo-600 font-bold hover:underline">Terms & Privacy Policy</a>
          </p>
        </div>
      </div>
      
      <div className="mt-8 flex items-center space-x-4 text-gray-400 grayscale opacity-70">
         <div className="flex items-center text-[10px] font-bold">
            <ShieldCheck size={12} className="mr-1" /> SSL Encrypted
         </div>
         <div className="h-3 w-px bg-gray-300"></div>
         <div className="flex items-center text-[10px] font-bold">
            <Lock size={12} className="mr-1" /> Govt. Compliant
         </div>
      </div>
    </div>
  );
};
