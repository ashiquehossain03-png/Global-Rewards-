import React, { useState, useRef, useEffect } from 'react';
import { User, Camera, Edit2, X, Trash2, Landmark, Wallet, CreditCard, Hash, Smartphone, Building } from 'lucide-react';
import { UserProfile, BankDetails, CryptoDetails } from '../types';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit States
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isEditingCrypto, setIsEditingCrypto] = useState(false);

  // Form States - Initialize with user data
  const [bankForm, setBankForm] = useState<BankDetails>(user.bankDetails || {
    holderName: user.name,
    bankName: '',
    accountNumber: '',
    ifsc: '',
    upiId: ''
  });

  const [cryptoForm, setCryptoForm] = useState<CryptoDetails>(user.cryptoDetails || {
    network: 'Binance Pay ID',
    address: ''
  });

  // Sync forms if user prop updates externally (though mainly handled by local state interaction)
  useEffect(() => {
    if (user.bankDetails) setBankForm(user.bankDetails);
    if (user.cryptoDetails) setCryptoForm(user.cryptoDetails);
  }, [user.bankDetails, user.cryptoDetails]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveBankDetails = () => {
    onUpdateUser({ bankDetails: bankForm });
    setIsEditingBank(false);
  };

  const handleCancelBank = () => {
    // Reset form to original user data to discard changes
    setBankForm(user.bankDetails || {
        holderName: user.name,
        bankName: '',
        accountNumber: '',
        ifsc: '',
        upiId: ''
    });
    setIsEditingBank(false);
  };

  const removeBankDetails = () => {
    if (confirm("Are you sure you want to remove your linked Bank Account?")) {
        onUpdateUser({ bankDetails: undefined });
        setBankForm({ holderName: user.name, bankName: '', accountNumber: '', ifsc: '', upiId: '' });
        setIsEditingBank(false);
    }
  };

  const saveCryptoDetails = () => {
    onUpdateUser({ cryptoDetails: cryptoForm });
    setIsEditingCrypto(false);
  };

  const handleCancelCrypto = () => {
    // Reset form to original user data to discard changes
    setCryptoForm(user.cryptoDetails || {
        network: 'Binance Pay ID',
        address: ''
    });
    setIsEditingCrypto(false);
  };

  const removeCryptoDetails = () => {
    if (confirm("Are you sure you want to unbind your Crypto Wallet?")) {
        onUpdateUser({ cryptoDetails: undefined });
        setCryptoForm({ network: 'Binance Pay ID', address: '' });
        setIsEditingCrypto(false);
    }
  };

  return (
    <div className="pb-20 pt-6 px-4">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200">
                {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                        {user.name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                <Camera size={16} />
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
            />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-4">{user.name}</h2>
        <div className="flex items-center space-x-2 mt-1">
             <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-mono">{user.email}</span>
             <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 uppercase">
                {user.accountLevel}
             </span>
        </div>
      </div>

      {/* Account Binding Section - Bank */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center">
                  <Landmark size={18} className="text-indigo-600 mr-2" />
                  Bank Account Binding
              </h3>
              {user.bankDetails && !isEditingBank && (
                  <div className="flex space-x-2">
                      <button onClick={() => setIsEditingBank(true)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                          <Edit2 size={16} />
                      </button>
                      <button onClick={removeBankDetails} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                      </button>
                  </div>
              )}
          </div>

          <div className="p-4">
              {!user.bankDetails && !isEditingBank ? (
                  <div className="text-center py-6">
                      <p className="text-gray-500 text-sm mb-4">No bank account linked for withdrawals.</p>
                      <button 
                        onClick={() => setIsEditingBank(true)}
                        className="bg-indigo-50 text-indigo-600 font-bold py-2 px-4 rounded-lg text-sm border border-indigo-100 hover:bg-indigo-100 transition-colors"
                      >
                          + Bind Bank Account
                      </button>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {isEditingBank ? (
                          <div className="grid gap-3 animate-in fade-in">
                              <div className="relative">
                                  <User className="absolute left-3 top-3 text-gray-400" size={16} />
                                  <input 
                                    type="text" 
                                    placeholder="Account Holder Name"
                                    value={bankForm.holderName}
                                    onChange={e => setBankForm({...bankForm, holderName: e.target.value})}
                                    className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                  />
                              </div>
                              <div className="relative">
                                  <Building className="absolute left-3 top-3 text-gray-400" size={16} />
                                  <input 
                                    type="text" 
                                    placeholder="Bank Name"
                                    value={bankForm.bankName}
                                    onChange={e => setBankForm({...bankForm, bankName: e.target.value})}
                                    className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                  />
                              </div>
                              <div className="relative">
                                  <CreditCard className="absolute left-3 top-3 text-gray-400" size={16} />
                                  <input 
                                    type="text" 
                                    placeholder="Account Number"
                                    value={bankForm.accountNumber}
                                    onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})}
                                    className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                  />
                              </div>
                              <div className="relative">
                                  <Hash className="absolute left-3 top-3 text-gray-400" size={16} />
                                  <input 
                                    type="text" 
                                    placeholder="IFSC Code"
                                    value={bankForm.ifsc}
                                    onChange={e => setBankForm({...bankForm, ifsc: e.target.value.toUpperCase()})}
                                    className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                                  />
                              </div>
                              <div className="relative">
                                  <Smartphone className="absolute left-3 top-3 text-gray-400" size={16} />
                                  <input 
                                    type="text" 
                                    placeholder="UPI ID (Optional)"
                                    value={bankForm.upiId}
                                    onChange={e => setBankForm({...bankForm, upiId: e.target.value})}
                                    className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                  />
                              </div>
                              <div className="flex gap-2 mt-2">
                                  <button onClick={handleCancelBank} className="flex-1 py-2 text-gray-500 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                                  <button onClick={saveBankDetails} className="flex-1 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">Save Details</button>
                              </div>
                          </div>
                      ) : (
                          <div className="text-sm space-y-2">
                              <div className="flex justify-between border-b border-gray-50 pb-2">
                                  <span className="text-gray-500">Bank Name</span>
                                  <span className="font-medium text-gray-900">{user.bankDetails?.bankName}</span>
                              </div>
                              <div className="flex justify-between border-b border-gray-50 pb-2">
                                  <span className="text-gray-500">Account No</span>
                                  <span className="font-medium text-gray-900 tracking-wider">•••• {user.bankDetails?.accountNumber.slice(-4)}</span>
                              </div>
                              <div className="flex justify-between border-b border-gray-50 pb-2">
                                  <span className="text-gray-500">IFSC</span>
                                  <span className="font-medium text-gray-900">{user.bankDetails?.ifsc}</span>
                              </div>
                              {user.bankDetails?.upiId && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">UPI ID</span>
                                    <span className="font-medium text-gray-900">{user.bankDetails?.upiId}</span>
                                </div>
                              )}
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>

      {/* Crypto Binding Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center">
                  <Wallet size={18} className="text-yellow-500 mr-2" />
                  Binance / Crypto Binding
              </h3>
              {user.cryptoDetails && !isEditingCrypto && (
                  <div className="flex space-x-2">
                      <button onClick={() => setIsEditingCrypto(true)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                          <Edit2 size={16} />
                      </button>
                      <button onClick={removeCryptoDetails} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                      </button>
                  </div>
              )}
          </div>

          <div className="p-4">
              {!user.cryptoDetails && !isEditingCrypto ? (
                  <div className="text-center py-6">
                      <p className="text-gray-500 text-sm mb-4">No crypto wallet linked.</p>
                      <button 
                        onClick={() => setIsEditingCrypto(true)}
                        className="bg-yellow-50 text-yellow-700 font-bold py-2 px-4 rounded-lg text-sm border border-yellow-100 hover:bg-yellow-100 transition-colors"
                      >
                          + Bind Wallet
                      </button>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {isEditingCrypto ? (
                          <div className="grid gap-3 animate-in fade-in">
                              <div className="relative">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Network Type</label>
                                  <select 
                                    value={cryptoForm.network}
                                    onChange={e => setCryptoForm({...cryptoForm, network: e.target.value})}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                                  >
                                      <option value="Binance Pay ID">Binance Pay ID</option>
                                      <option value="USDT (TRC20)">USDT (TRC20)</option>
                                      <option value="USDT (BEP20)">USDT (BEP20)</option>
                                      <option value="Bitcoin (BTC)">Bitcoin (BTC)</option>
                                  </select>
                              </div>
                              <div className="relative">
                                  <Hash className="absolute left-3 top-3 text-gray-400" size={16} />
                                  <input 
                                    type="text" 
                                    placeholder={cryptoForm.network.includes('ID') ? "Enter Pay ID" : "Enter Wallet Address"}
                                    value={cryptoForm.address}
                                    onChange={e => setCryptoForm({...cryptoForm, address: e.target.value})}
                                    className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                                  />
                              </div>
                              <div className="flex gap-2 mt-2">
                                  <button onClick={handleCancelCrypto} className="flex-1 py-2 text-gray-500 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                                  <button onClick={saveCryptoDetails} className="flex-1 py-2 bg-yellow-500 text-black text-sm font-bold rounded-lg shadow-md hover:bg-yellow-400 transition-colors">Save Wallet</button>
                              </div>
                          </div>
                      ) : (
                          <div className="text-sm space-y-2">
                              <div className="flex justify-between border-b border-gray-50 pb-2">
                                  <span className="text-gray-500">Network</span>
                                  <span className="font-medium text-gray-900">{user.cryptoDetails?.network}</span>
                              </div>
                              <div className="flex justify-between items-start">
                                  <span className="text-gray-500 whitespace-nowrap mr-4">Address/ID</span>
                                  <span className="font-medium text-gray-900 break-all text-right">{user.cryptoDetails?.address}</span>
                              </div>
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full py-4 text-red-500 font-bold bg-red-50 hover:bg-red-100 rounded-2xl transition-colors border border-red-100 flex items-center justify-center shadow-sm"
      >
          <X size={18} className="mr-2"/> Log Out Securely
      </button>
    </div>
  );
};