
import React, { useState, useEffect } from 'react';
import { UserProfile, PaymentMethod, Transaction } from '../types';
import { CURRENCY_SYMBOL, BTC_SYMBOL, MIN_WITHDRAWAL, MIN_BTC_WITHDRAWAL, TDS_TAX_RATE, CRYPTO_TAX_RATE, APP_NAME, FINANCIAL_DISCLAIMER } from '../constants';
import { CreditCard, Wallet as WalletIcon, ArrowRight, History, Check, Clock, XCircle, X, Shield, Landmark, User, Building, Hash, Globe, FileCheck, Bitcoin, Banknote, ShieldCheck, FileText, ChevronDown, AlertCircle, Smartphone } from 'lucide-react';

interface WalletProps {
  user: UserProfile;
  transactions: Transaction[];
  onWithdraw: (amount: number, method: PaymentMethod, details: string, currency: 'INR' | 'BTC') => void;
}

export const Wallet: React.FC<WalletProps> = ({ user, transactions, onWithdraw }) => {
  const [walletType, setWalletType] = useState<'INR' | 'BTC'>('INR');
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
  const [amount, setAmount] = useState<string>('');
  const [panNumber, setPanNumber] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Statement Modal State
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementType, setStatementType] = useState<'MONTHLY' | 'YEARLY' | 'CUSTOM'>('MONTHLY');
  const [statementDate, setStatementDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  // Bank Form State - Auto-fill from User Profile if available
  const [bankInfo, setBankInfo] = useState({
    holderName: user.bankDetails?.holderName || user.name || '',
    bankName: user.bankDetails?.bankName || '',
    accountNumber: user.bankDetails?.accountNumber || '',
    ifsc: user.bankDetails?.ifsc || '',
    transferMode: 'IMPS' // Default to Real-time
  });

  // Crypto Form State - Auto-fill from User Profile
  const [cryptoInfo, setCryptoInfo] = useState({
    network: user.cryptoDetails?.network || 'Binance Pay ID',
    address: user.cryptoDetails?.address || ''
  });

  // Effect to update local state if user binds new details in profile
  useEffect(() => {
    if (user.bankDetails) {
        setBankInfo(prev => ({
            ...prev,
            holderName: user.bankDetails!.holderName,
            bankName: user.bankDetails!.bankName,
            accountNumber: user.bankDetails!.accountNumber,
            ifsc: user.bankDetails!.ifsc,
        }));
    }
    if (user.cryptoDetails) {
        setCryptoInfo({
            network: user.cryptoDetails.network,
            address: user.cryptoDetails.address
        });
    }
  }, [user.bankDetails, user.cryptoDetails]);

  // Calculate pending withdrawals
  const pendingAmountINR = transactions
    .filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING' && t.currency === 'INR')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingAmountBTC = transactions
    .filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING' && t.currency === 'BTC')
    .reduce((acc, t) => acc + t.amount, 0);

  // Available Funds
  const availableINR = user.balance - pendingAmountINR;
  const availableBTC = user.btcBalance - pendingAmountBTC;

  // Tax Calculations
  const requestAmount = Number(amount) || 0;
  const currentTaxRate = walletType === 'INR' ? TDS_TAX_RATE : CRYPTO_TAX_RATE;
  const taxAmount = requestAmount * currentTaxRate;
  const netPayable = requestAmount - taxAmount;

  const displayError = (msg: string) => {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const numAmount = Number(amount);
    
    if (walletType === 'INR') {
        if (numAmount < MIN_WITHDRAWAL) {
            displayError(`Minimum withdrawal amount is ${CURRENCY_SYMBOL}${MIN_WITHDRAWAL}`);
            return;
        }
        if (numAmount > availableINR) {
            displayError(`Insufficient Funds. Available: ${CURRENCY_SYMBOL}${availableINR}`);
            return;
        }
        if (method === PaymentMethod.BANK_TRANSFER) {
            // Basic validation
            if (bankInfo.transferMode === 'UPI') {
                if (!bankInfo.accountNumber) {
                    displayError("Please enter a valid UPI ID.");
                    return;
                }
            } else {
                if (!bankInfo.accountNumber || !bankInfo.ifsc || !bankInfo.holderName) {
                    displayError("Please fill in all Bank Account details.");
                    return;
                }
            }
        } 
    } else {
        if (numAmount < MIN_BTC_WITHDRAWAL) {
            displayError(`Minimum withdrawal is ${MIN_BTC_WITHDRAWAL} BTC`);
            return;
        }
        if (numAmount > availableBTC) {
            displayError(`Insufficient Funds. Available: ${availableBTC.toFixed(6)} BTC`);
            return;
        }
        if (!cryptoInfo.address) {
             displayError("Please enter a valid Wallet Address or Binance ID.");
             return;
        }
    }

    // Validate PAN
    if (!panNumber || panNumber.length < 10) {
        displayError("Please enter a valid 10-digit PAN Number for Tax Compliance.");
        return;
    }
    
    setAgreedToTerms(false);
    setShowConfirmModal(true);
  };

  const getFormattedDetails = () => {
    if (method === PaymentMethod.BANK_TRANSFER && walletType === 'INR') {
      if (bankInfo.transferMode === 'UPI') {
          return `Method: UPI | VPA: ${bankInfo.accountNumber} | Name: ${bankInfo.holderName} | PAN: ${panNumber}`;
      }
      return `Method: ${bankInfo.transferMode} | Bank: ${bankInfo.bankName || 'N/A'} | Acc: ${bankInfo.accountNumber} | IFSC: ${bankInfo.ifsc} | Name: ${bankInfo.holderName} | PAN: ${panNumber}`;
    } else {
      return `Method: ${cryptoInfo.network} | Address: ${cryptoInfo.address} | PAN: ${panNumber}`;
    }
  };

  const executeWithdrawal = () => {
    const numAmount = Number(amount);
    const detailsString = getFormattedDetails();
    
    onWithdraw(numAmount, method, detailsString, walletType);
    
    const symbol = walletType === 'INR' ? CURRENCY_SYMBOL : BTC_SYMBOL;
    setSuccessMsg(`Withdrawal of ${symbol}${numAmount} requested! Processing via ${bankInfo.transferMode || 'Secure Network'}.`);
    setAmount('');
    setShowConfirmModal(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const generateAccountStatement = () => {
      // 1. Filter Transactions based on selection
      let filteredTx = transactions.filter(t => (t.currency || 'INR') === walletType);
      let dateLabel = "";

      if (statementType === 'MONTHLY') {
          filteredTx = filteredTx.filter(t => {
              const d = new Date(t.date);
              return d.getMonth() === statementDate.month && d.getFullYear() === statementDate.year;
          });
          const monthName = new Date(statementDate.year, statementDate.month).toLocaleString('default', { month: 'long' });
          dateLabel = `${monthName} ${statementDate.year}`;
      } else if (statementType === 'YEARLY') {
          filteredTx = filteredTx.filter(t => new Date(t.date).getFullYear() === statementDate.year);
          dateLabel = `FY ${statementDate.year}`;
      } else if (statementType === 'CUSTOM') {
          if (!customRange.start || !customRange.end) {
              alert("Please select start and end dates");
              return;
          }
          filteredTx = filteredTx.filter(t => {
              return t.date >= customRange.start && t.date <= customRange.end;
          });
          dateLabel = `${customRange.start} to ${customRange.end}`;
      }

      // 2. Calculate Totals
      let totalGross = 0;
      let totalTax = 0;
      let totalNet = 0;

      filteredTx.forEach(tx => {
          totalGross += tx.amount;
          totalTax += tx.tax || 0;
          totalNet += tx.netAmount || tx.amount;
      });

      // 3. Generate HTML
      const symbol = walletType === 'INR' ? CURRENCY_SYMBOL : BTC_SYMBOL;
      
      const rows = filteredTx.map(tx => {
          // Determine "Company/Source" based on type
          let companySource = "";
          let taxType = "GST (18%)";
          
          if (tx.type === 'EARNING') {
             // For Earnings, use the specific method (which now contains real company names)
             companySource = tx.method || "GlobalAdRewards Ad Revenue";
             taxType = "N/A"; 
          } else {
             companySource = `${APP_NAME} Pvt Ltd (Payout Gateway)`;
             taxType = tx.currency === 'BTC' ? "VDA Tax (30%)" : "TDS (10%)";
          }

          const taxVal = tx.tax || 0;
          const netVal = tx.netAmount || tx.amount;
          const colorClass = tx.type === 'EARNING' ? 'color:#16a34a' : 'color:#dc2626';
          
          return `
            <tr>
                <td>${tx.date}</td>
                <td>
                    <strong>${companySource}</strong><br>
                    <span style="font-size:10px; color:#666">${tx.type === 'EARNING' ? 'Credit Note' : 'Debit Advice'} - Ref: ${tx.id}</span>
                </td>
                <td style="text-align:right">${symbol}${tx.amount.toFixed(2)}</td>
                <td style="text-align:right">
                    ${symbol}${taxVal.toFixed(2)}<br>
                    <span style="font-size:9px; color:#666">${taxType}</span>
                </td>
                <td style="text-align:right; font-weight:bold; ${colorClass}">
                    ${tx.type === 'WITHDRAWAL' ? '-' : '+'}${symbol}${netVal.toFixed(2)}
                </td>
            </tr>
          `;
      }).join('');

      const htmlContent = `
        <html>
        <head>
            <title>Statement_${dateLabel}</title>
            <style>
                body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
                .summary-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; }
                .sum-item { text-align: center; }
                .sum-label { font-size: 10px; text-transform: uppercase; color: #666; font-weight: bold; }
                .sum-val { font-size: 16px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th { text-align: left; background: #374151; color: white; padding: 10px; }
                td { border-bottom: 1px solid #e5e7eb; padding: 10px; vertical-align: top; }
                .footer { margin-top: 50px; font-size: 10px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="logo">${APP_NAME}</div>
                    <div style="font-size:12px; margin-top:5px;">
                        User Statement<br>
                        ${user.name} (ID: 883921)<br>
                        PAN: ${panNumber || 'N/A'}
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:16px; font-weight:bold;">${statementType} STATEMENT</div>
                    <div style="font-size:12px;">Period: ${dateLabel}</div>
                    <div style="font-size:12px;">Currency: ${walletType}</div>
                </div>
            </div>

            <div class="summary-box">
                <div class="sum-item">
                    <div class="sum-label">Opening Balance</div>
                    <div class="sum-val">${symbol}0.00</div>
                </div>
                <div class="sum-item">
                    <div class="sum-label">Total Gross Volume</div>
                    <div class="sum-val">${symbol}${totalGross.toFixed(2)}</div>
                </div>
                <div class="sum-item">
                    <div class="sum-label">Total Tax/GST Paid</div>
                    <div class="sum-val text-red-600">${symbol}${totalTax.toFixed(2)}</div>
                </div>
                <div class="sum-item">
                    <div class="sum-label">Net Movement</div>
                    <div class="sum-val">${symbol}${totalNet.toFixed(2)}</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th width="15%">Date</th>
                        <th width="40%">Source / Company Name</th>
                        <th width="15%" style="text-align:right">Gross Amount</th>
                        <th width="15%" style="text-align:right">Tax / GST</th>
                        <th width="15%" style="text-align:right">Net Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.length > 0 ? rows : '<tr><td colspan="5" style="text-align:center; padding:20px;">No transactions found for this period.</td></tr>'}
                </tbody>
            </table>

            <div class="footer">
                <p><strong>Legal Disclaimer:</strong> This is a computer-generated statement. </p>
                <p>${APP_NAME} Pvt Ltd • GSTIN: 29AABCU9603R1Z2 • TAN: BLRG12345C</p>
                <p>Tax Deducted at Source (TDS) is filed under Section 194B/115BBH of Income Tax Act.</p>
            </div>
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `;

      const printWindow = window.open('', '', 'width=900,height=800');
      if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
      }
      setShowStatementModal(false);
  };

  const generatePDFReceipt = (tx: Transaction) => {
    const symbol = tx.currency === 'BTC' ? BTC_SYMBOL : CURRENCY_SYMBOL;
    const isWithdrawal = tx.type === 'WITHDRAWAL';
    
    // Determine Company Name / Source
    const companyName = isWithdrawal ? `${APP_NAME} Pvt Ltd` : (tx.method || "Global Advertising Partners");

    // Tax Logic
    let taxLabel = "N/A";
    let taxSection = "";
    let taxRate = 0;
    
    if (isWithdrawal) {
        if (tx.currency === 'BTC') {
            taxLabel = "Crypto Tax (VDA)";
            taxSection = "Section 115BBH";
            taxRate = CRYPTO_TAX_RATE;
        } else {
            taxLabel = "TDS Deduction";
            taxSection = "Section 194B/194BB";
            taxRate = TDS_TAX_RATE;
        }
    }

    const taxVal = tx.tax ?? (isWithdrawal ? tx.amount * taxRate : 0);
    const netVal = tx.netAmount ?? (isWithdrawal ? tx.amount - taxVal : tx.amount);
    
    // Receipt Title
    const documentTitle = isWithdrawal ? "TAX INVOICE / PAYOUT ADVICE" : "PAYMENT VOUCHER / CREDIT NOTE";
    
    // HTML Content for the PDF
    const htmlContent = `
      <html>
        <head>
          <title>Receipt_${tx.id}</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; border: 1px solid #eee; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .meta { text-align: right; font-size: 12px; color: #666; }
            .title { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1px; background: #f9fafb; padding: 10px; border-radius: 4px; }
            .grid { display: flex; margin-bottom: 30px; gap: 40px; }
            .col { flex: 1; }
            .label { font-size: 10px; text-transform: uppercase; color: #888; font-weight: bold; margin-bottom: 4px; }
            .value { font-size: 14px; font-weight: 500; margin-bottom: 12px; }
            table { w-full; border-collapse: collapse; width: 100%; margin-bottom: 30px; }
            th { text-align: left; background: #f3f4f6; padding: 12px; font-size: 12px; border-bottom: 1px solid #ddd; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #333; border-bottom: none; }
            .footer { margin-top: 50px; font-size: 10px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
            .badge { background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
            .stamp { position: fixed; bottom: 150px; right: 50px; border: 3px double #ef4444; color: #ef4444; padding: 10px; font-weight: bold; transform: rotate(-15deg); opacity: 0.2; font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="stamp">${isWithdrawal ? 'PAID & TAX DEDUCTED' : 'CREDITED'}</div>
          
          <div class="header">
            <div>
              <div class="logo">${APP_NAME} Pvt Ltd.</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">
                Regd Office: Tech Park, Bangalore, KA<br>
                GSTIN: 29AABCU9603R1Z2<br>
                CIN: U72900KA2024PTC123456
              </div>
            </div>
            <div class="meta">
              <strong>Invoice Date:</strong> ${tx.date}<br>
              <strong>Receipt ID:</strong> #${tx.id.toUpperCase()}<br>
              <strong>Status:</strong> ${tx.status}
            </div>
          </div>

          <div class="title">${documentTitle}</div>

          <div class="grid">
            <div class="col">
              <div class="label">Beneficiary / User</div>
              <div class="value">
                ${user.name}<br>
                ${user.email}<br>
                PAN: ${panNumber || 'NOT PROVIDED'}
              </div>
            </div>
            <div class="col">
              <div class="label">Payer / Source Company</div>
              <div class="value">
                <strong>${companyName}</strong><br>
                <span style="font-size:11px; color:#666">
                    ${isWithdrawal ? 'Payment Processor: Cashfree / Razorpay' : 'Advertising Network Partner'}
                </span>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align:right">Rate</th>
                <th style="text-align:right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  ${isWithdrawal ? 'Withdrawal Request (Gross Amount)' : 'Ad Revenue Payout / Task Earning'}<br>
                  <span style="font-size:10px; color:#666">Source: ${companyName} | Ref: ${tx.id}</span>
                </td>
                <td style="text-align:right">1.00</td>
                <td style="text-align:right">${symbol} ${tx.amount.toFixed(6)}</td>
              </tr>
              ${isWithdrawal ? `
              <tr>
                <td>
                  Less: ${taxLabel}<br>
                  <span style="font-size:10px; color:#666">Compliance: ${taxSection}</span>
                </td>
                <td style="text-align:right">${(taxRate * 100).toFixed(0)}%</td>
                <td style="text-align:right; color:#ef4444">-${symbol} ${taxVal.toFixed(6)}</td>
              </tr>
              ` : `
              <tr>
                 <td>Platform Fee / GST</td>
                 <td style="text-align:right">0%</td>
                 <td style="text-align:right; color:#666">Included</td>
              </tr>
              `}
              <tr class="total-row">
                <td>Net ${isWithdrawal ? 'Payable' : 'Credited'}</td>
                <td></td>
                <td style="text-align:right">${symbol} ${netVal.toFixed(6)}</td>
              </tr>
            </tbody>
          </table>

          <div style="font-size: 12px; margin-bottom: 40px;">
            <strong>Amount in Words:</strong> ${symbol} ${netVal.toFixed(2)} Only.<br>
            <br>
            <strong>Legal Declaration:</strong><br>
            1. For Withdrawals: TDS has been deducted as per Income Tax Act, 1961. Use this receipt for filing ITR.<br>
            2. For Earnings: This payment is processed by ${APP_NAME} on behalf of ${companyName}.<br>
            3. GST is applicable on service fees only. If service fee is 0, GST is 0.
          </div>

          <div class="footer">
            Digitally Signed by Authorized Signatory • ${APP_NAME} Accounts Team<br>
            System Generated Invoice • No Physical Signature Required
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    // Open in new window and print
    const printWindow = window.open('', '', 'width=900,height=800');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const getStatusBadge = (tx: Transaction) => {
      switch(tx.status) {
          case 'COMPLETED':
              return <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full border border-green-200"><Check size={10} className="mr-1"/> Settled</span>;
          case 'PENDING':
              return (
                <div className="group relative">
                    <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full cursor-help border border-amber-200">
                        <Clock size={10} className="mr-1"/> Processing
                    </span>
                    <div className="absolute bottom-full right-0 mb-2 w-56 bg-gray-900 text-white text-[10px] p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 text-center shadow-xl border border-gray-700 pointer-events-none">
                        <p className="font-semibold mb-0.5 text-yellow-400">Compliance Check</p>
                        <p className="text-gray-300">Transaction under banking verification as per RBI guidelines.</p>
                        <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
              );
          case 'FAILED':
              return <span className="flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full"><XCircle size={10} className="mr-1"/> Failed</span>;
          default:
              return null;
      }
  };

  const renderTransactionList = () => {
    // Filter transactions based on selected wallet type (INR or BTC)
    const filteredTx = transactions.filter(t => (t.currency || 'INR') === walletType);

    if (filteredTx.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <History size={48} className="mb-2 opacity-20" />
          <p>No records found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Statement Button */}
        <div className="flex justify-end mb-2">
            <button 
                onClick={() => setShowStatementModal(true)}
                className="flex items-center text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
            >
                <FileText size={14} className="mr-2" />
                Download Account Statement
            </button>
        </div>

        {filteredTx.map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-start shadow-sm relative z-10">
                <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-4 mt-1 ${tx.type === 'WITHDRAWAL' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {tx.type === 'WITHDRAWAL' ? <ArrowRight size={18} className="-rotate-45" /> : <ArrowRight size={18} className="rotate-[135deg]" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-semibold text-gray-900 text-sm">{tx.method}</h4>
                            {getStatusBadge(tx)}
                        </div>
                        <p className="text-[10px] text-gray-500 mb-2 font-mono">ID: {tx.id} • {tx.date}</p>
                        
                        {/* Display Failure Reason if available */}
                        {tx.status === 'FAILED' && tx.failureReason && (
                             <p className="text-[10px] text-red-500 font-medium flex items-center mb-1">
                                <AlertCircle size={10} className="mr-1" />
                                {tx.failureReason}
                             </p>
                        )}
                        
                        {tx.type === 'WITHDRAWAL' && tx.details && (
                             <div className="text-[10px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 max-w-[200px]">
                                <div className="font-semibold text-gray-700 mb-1 flex items-center">
                                    <Hash size={10} className="mr-1"/> Beneficiary Details
                                </div>
                                {tx.details.split('|').map((part, index) => (
                                    <div key={index} className="truncate" title={part.trim()}>
                                        {part.trim()}
                                    </div>
                                ))}
                             </div>
                        )}

                        {/* ENABLE DOWNLOAD FOR ALL COMPLETED TRANSACTIONS */}
                        {tx.status === 'COMPLETED' && (
                             <button 
                                onClick={() => generatePDFReceipt(tx)}
                                className="flex items-center text-[10px] text-indigo-600 font-bold mt-2 hover:text-indigo-800 transition-colors bg-indigo-50 px-2 py-1 rounded border border-indigo-100 group"
                             >
                                <FileText size={10} className="mr-1 group-hover:scale-110 transition-transform"/> 
                                {tx.type === 'WITHDRAWAL' ? 'Download Receipt' : 'Download Invoice'}
                             </button>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <span className={`block font-bold ${tx.type === 'WITHDRAWAL' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.type === 'WITHDRAWAL' ? '-' : '+'}{tx.currency === 'BTC' ? BTC_SYMBOL : CURRENCY_SYMBOL}{tx.amount.toFixed(tx.currency === 'BTC' ? 6 : 2)}
                    </span>
                    {tx.type === 'WITHDRAWAL' && tx.netAmount && (
                         <span className="block text-[10px] text-green-600 font-medium bg-green-50 px-1 rounded border border-green-100">
                            Net: {tx.currency === 'BTC' ? BTC_SYMBOL : CURRENCY_SYMBOL}{tx.netAmount.toFixed(tx.currency === 'BTC' ? 6 : 2)}
                         </span>
                    )}
                </div>
            </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pb-20 pt-6 relative">
       {/* Wallet Type Switcher */}
       <div className="flex justify-center mb-6">
           <div className="bg-gray-100 p-1 rounded-full flex">
               <button 
                  onClick={() => { setWalletType('INR'); setMethod(PaymentMethod.BANK_TRANSFER); setErrorMsg(''); }}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${walletType === 'INR' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500'}`}
               >
                  Fiat (INR)
               </button>
               <button 
                  onClick={() => { setWalletType('BTC'); setMethod(PaymentMethod.BINANCE); setErrorMsg(''); }}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center ${walletType === 'BTC' ? 'bg-black text-yellow-500 shadow-md' : 'text-gray-500'}`}
               >
                  <Bitcoin size={14} className="mr-1" />
                  Crypto (BTC)
               </button>
           </div>
       </div>

       {/* Balance Card */}
       <div className={`p-6 rounded-2xl shadow-xl mb-8 relative overflow-hidden text-white transition-colors duration-500 ${walletType === 'INR' ? 'bg-gray-900' : 'bg-black'}`}>
           <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-2xl ${walletType === 'INR' ? 'bg-white/10' : 'bg-yellow-500/20'}`}></div>
           
           <div className="flex justify-between items-start mb-2">
               <p className="text-gray-400 text-sm">Total {walletType} Balance</p>
               <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] border ${walletType === 'INR' ? 'bg-green-900/40 text-green-400 border-green-800' : 'bg-yellow-900/40 text-yellow-400 border-yellow-800'}`}>
                   <Shield size={10} />
                   <span>Protected</span>
               </div>
           </div>
           
           <h2 className="text-3xl font-bold mb-2 break-all">
             {walletType === 'INR' ? CURRENCY_SYMBOL : BTC_SYMBOL}
             {walletType === 'INR' ? user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : user.btcBalance.toFixed(8)}
           </h2>
           
           {(walletType === 'INR' ? pendingAmountINR : pendingAmountBTC) > 0 && (
               <div className="mb-4 flex items-center text-amber-300 text-sm font-medium bg-amber-900/30 w-fit px-3 py-1 rounded-full border border-amber-500/30">
                   <Clock size={14} className="mr-2" />
                   <span>Pending: {walletType === 'INR' ? CURRENCY_SYMBOL : BTC_SYMBOL}{(walletType === 'INR' ? pendingAmountINR : pendingAmountBTC)}</span>
               </div>
           )}

           <div className="flex items-center space-x-2 text-sm text-gray-300 bg-gray-800 w-fit px-3 py-1.5 rounded-lg border border-gray-700 mt-2">
               <Landmark size={14} />
               <span>{walletType === 'INR' ? 'Govt. Tax (10% TDS)' : 'Govt. Tax (30% VDA)'}</span>
           </div>
       </div>

       {/* Tabs */}
       <div className="flex mb-6 bg-gray-100 p-1 rounded-xl">
           <button 
                onClick={() => setActiveTab('withdraw')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'withdraw' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
               Withdraw
           </button>
           <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'history' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
               History
           </button>
       </div>

       {activeTab === 'withdraw' && (
           <form onSubmit={handleWithdrawSubmit} className="space-y-6">
               {successMsg && (
                   <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center border border-green-200 animate-in fade-in">
                       <Clock size={20} className="mr-2" />
                       {successMsg}
                   </div>
               )}
               
               {/* Error Message Box */}
               {errorMsg && (
                   <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center border border-red-200 animate-in shake">
                       <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                       <span className="text-sm font-medium">{errorMsg}</span>
                   </div>
               )}

               {walletType === 'INR' && (
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Select Method</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setMethod(PaymentMethod.BANK_TRANSFER)}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${method === PaymentMethod.BANK_TRANSFER ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <CreditCard className="mb-2" size={24} />
                            <span className="font-medium text-sm">Bank Transfer</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMethod(PaymentMethod.BINANCE)}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${method === PaymentMethod.BINANCE ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <WalletIcon className="mb-2" size={24} />
                            <span className="font-medium text-sm">Binance / Crypto</span>
                        </button>
                    </div>
                </div>
               )}

               {walletType === 'BTC' && (
                   <div className="bg-black/5 p-4 rounded-xl border border-gray-200 text-center">
                       <div className="flex justify-center mb-2">
                            <div className="bg-yellow-100 p-2 rounded-full">
                                <Bitcoin className="text-yellow-600" size={24} />
                            </div>
                       </div>
                       <h3 className="font-bold text-gray-900">Direct Bitcoin Withdrawal</h3>
                       <p className="text-xs text-gray-500">Withdraw mined BTC directly to your Binance wallet.</p>
                   </div>
               )}

               {/* Dynamic Fields Section */}
               <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                  <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                     <Shield size={12} className="mr-1"/> Beneficiary Details
                  </div>
                  
                  {walletType === 'INR' && method === PaymentMethod.BANK_TRANSFER ? (
                    <>
                      {/* Transfer Mode Selection for Bank */}
                       <div className="grid grid-cols-3 gap-2 mb-2">
                          {['IMPS', 'NEFT', 'UPI'].map(m => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setBankInfo(prev => ({...prev, transferMode: m}))}
                                className={`text-xs font-bold py-2 rounded-lg border ${bankInfo.transferMode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                              >
                                {m}
                              </button>
                          ))}
                       </div>

                      {/* Bank Fields */}
                      <div className="space-y-3">
                         {bankInfo.transferMode === 'UPI' ? (
                             <div className="relative">
                                <Smartphone className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Enter UPI ID (e.g., name@okicici)"
                                    value={bankInfo.accountNumber}
                                    onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                />
                             </div>
                         ) : (
                             <>
                                <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Account Holder Name"
                                    value={bankInfo.holderName}
                                    onChange={(e) => setBankInfo({...bankInfo, holderName: e.target.value})}
                                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                />
                                </div>
                                <div className="relative">
                                <Building className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Bank Name (e.g. SBI, HDFC)"
                                    value={bankInfo.bankName}
                                    onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})}
                                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input 
                                        type="text"
                                        placeholder="Account Number"
                                        value={bankInfo.accountNumber}
                                        onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                                        className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Landmark className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input 
                                        type="text"
                                        placeholder="IFSC Code"
                                        value={bankInfo.ifsc}
                                        onChange={(e) => setBankInfo({...bankInfo, ifsc: e.target.value.toUpperCase()})}
                                        className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm uppercase"
                                        />
                                    </div>
                                </div>
                            </>
                         )}
                         
                         {/* Name is needed for UPI too properly */}
                         {bankInfo.transferMode === 'UPI' && (
                             <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Account Holder Name"
                                    value={bankInfo.holderName}
                                    onChange={(e) => setBankInfo({...bankInfo, holderName: e.target.value})}
                                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                />
                            </div>
                         )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Crypto/Binance Fields */}
                      <div className="space-y-3">
                          <div className="relative">
                              <Globe className="absolute left-3 top-3 text-gray-400" size={18} />
                              <select 
                                value={cryptoInfo.network}
                                onChange={(e) => setCryptoInfo({...cryptoInfo, network: e.target.value})}
                                className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:outline-none text-sm appearance-none"
                              >
                                  {walletType === 'INR' ? (
                                    <>
                                        <option value="Binance Pay ID">Binance Pay ID</option>
                                        <option value="USDT (TRC20)">USDT (TRC20)</option>
                                    </>
                                  ) : (
                                    <>
                                        <option value="Bitcoin (BTC)">Bitcoin Network (BTC)</option>
                                        <option value="Binance Pay ID">Binance Pay ID</option>
                                    </>
                                  )}
                              </select>
                          </div>
                          
                          <div className="relative">
                              <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
                              <input 
                                type="text"
                                placeholder={cryptoInfo.network.includes('ID') ? "Enter Pay ID" : "Enter Wallet Address"}
                                value={cryptoInfo.address}
                                onChange={(e) => setCryptoInfo({...cryptoInfo, address: e.target.value})}
                                className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:outline-none text-sm"
                              />
                          </div>
                      </div>
                    </>
                  )}

                  {/* PAN Card - Common for both */}
                  <div className="relative">
                        <FileCheck className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                        type="text"
                        placeholder="PAN Number (Mandatory)"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        maxLength={10}
                        className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm uppercase"
                        />
                        <span className="absolute right-3 top-3.5 text-[10px] bg-gray-100 text-gray-500 px-1 rounded border border-gray-200">Govt. Tax Rule</span>
                  </div>
               </div>

               <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Amount ({walletType === 'INR' ? CURRENCY_SYMBOL : BTC_SYMBOL})</label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Min ${walletType === 'INR' ? MIN_WITHDRAWAL : MIN_BTC_WITHDRAWAL}`}
                        className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg"
                    />
                    <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>Available: {walletType === 'INR' ? CURRENCY_SYMBOL : BTC_SYMBOL}{walletType === 'INR' ? availableINR : availableBTC.toFixed(6)}</span>
                        {(walletType === 'INR' ? pendingAmountINR : pendingAmountBTC) > 0 && <span className="text-amber-600">Locked: {walletType === 'INR' ? pendingAmountINR : pendingAmountBTC}</span>}
                    </div>

                    {/* Tax Deduction Module / Live Breakdown */}
                    {requestAmount > 0 && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-2 opacity-10">
                                 <Landmark size={60} />
                             </div>
                             <div className="flex items-center justify-between mb-2">
                                 <span className="text-xs text-gray-600">Gross Amount</span>
                                 <span className="text-sm font-medium">{walletType === 'INR' ? CURRENCY_SYMBOL : BTC_SYMBOL}{requestAmount}</span>
                             </div>
                             <div className="flex items-center justify-between mb-2 text-red-600">
                                 <span className="text-xs flex items-center font-bold"><Landmark size={12} className="mr-1"/> {walletType === 'INR' ? 'TDS (10%)' : 'Crypto Tax (30%)'}</span>
                                 <span className="text-sm font-bold">-{walletType === 'INR' ? CURRENCY_SYMBOL : BTC_SYMBOL}{taxAmount.toFixed(walletType === 'BTC' ? 6 : 2)}</span>
                             </div>
                             <div className="h-px bg-yellow-200 my-2"></div>
                             <div className="flex items-center justify-between">
                                 <span className="text-xs font-bold text-gray-900 uppercase">Net Payable</span>
                                 <span className="text-xl font-bold text-green-700">{walletType === 'INR' ? CURRENCY_SYMBOL : BTC_SYMBOL}{netPayable.toFixed(walletType === 'BTC' ? 6 : 2)}</span>
                             </div>
                             <p className="text-[9px] text-gray-400 mt-2 text-center">
                                * Tax deducted will be credited to your PAN (Form 26AS).
                             </p>
                        </div>
                    )}
               </div>

               <button 
                   type="submit"
                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center"
               >
                   <Banknote className="mr-2" size={20} />
                   <span>Request Withdrawal</span>
               </button>
           </form>
       )}
       
       {activeTab === 'history' && renderTransactionList()}

       {/* Confirmation & Tax Modal */}
       {showConfirmModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                   <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                       <h3 className="font-bold text-gray-900 flex items-center">
                           <ShieldCheck size={16} className="text-green-600 mr-2" />
                           Secure Payment
                       </h3>
                       <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600">
                           <X size={20} />
                       </button>
                   </div>
                   
                   <div className="p-6">
                       <div className="text-center mb-6">
                           <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Total Net Payable</p>
                           <p className="text-3xl font-bold text-gray-900">{walletType === 'INR' ? CURRENCY_SYMBOL : BTC_SYMBOL}{netPayable.toFixed(walletType === 'BTC' ? 6 : 2)}</p>
                           <p className="text-[10px] text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded-full mt-2 border border-green-100">
                               {bankInfo.transferMode === 'IMPS' ? 'Real-time IMPS Settlement' : 'Processed Securely'}
                           </p>
                       </div>

                       <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                           {/* Account Details Summary */}
                           <div className="text-xs text-gray-600 space-y-2">
                              {walletType === 'INR' && method === PaymentMethod.BANK_TRANSFER ? (
                                <>
                                  <div className="flex justify-between"><span>Method:</span> <span className="font-bold text-gray-900">{bankInfo.transferMode}</span></div>
                                  <div className="flex justify-between">
                                      <span>{bankInfo.transferMode === 'UPI' ? 'UPI ID:' : 'Acc:'}</span> 
                                      <span className="font-medium text-gray-900">{bankInfo.accountNumber}</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-between"><span>Type:</span> <span className="font-medium">{cryptoInfo.network}</span></div>
                                  <div className="flex justify-between"><span>Addr:</span> <span className="font-medium truncate max-w-[150px]">{cryptoInfo.address}</span></div>
                                </>
                              )}
                              <div className="flex justify-between pt-2 border-t border-gray-200"><span>PAN:</span> <span className="font-medium">{panNumber}</span></div>
                           </div>
                       </div>

                       {/* Compliance Checkbox */}
                       <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                           <label className="flex items-start space-x-3 cursor-pointer">
                               <input 
                                   type="checkbox" 
                                   checked={agreedToTerms}
                                   onChange={(e) => setAgreedToTerms(e.target.checked)}
                                   className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                               />
                               <span className="text-[10px] text-blue-900 leading-tight">
                                   I authorize tax deduction under <span className="font-bold">Section 194B/194BB/115BBH</span> of Income Tax Act. I confirm the PAN <span className="font-bold">{panNumber}</span> is mine.
                               </span>
                           </label>
                       </div>
                   </div>

                   <div className="p-6 bg-gray-50 flex space-x-3 pt-2">
                       <button 
                           onClick={() => setShowConfirmModal(false)}
                           className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                       >
                           Cancel
                       </button>
                       <button 
                           onClick={executeWithdrawal}
                           disabled={!agreedToTerms}
                           className="flex-1 py-3 bg-indigo-600 disabled:bg-indigo-300 disabled:shadow-none text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                       >
                           Confirm
                       </button>
                   </div>
               </div>
           </div>
       )}

       {/* Statement Selection Modal */}
       {showStatementModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                   <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                       <h3 className="font-bold text-gray-900 flex items-center">
                           <FileText size={16} className="text-indigo-600 mr-2" />
                           Generate Account Statement
                       </h3>
                       <button onClick={() => setShowStatementModal(false)} className="text-gray-400 hover:text-gray-600">
                           <X size={20} />
                       </button>
                   </div>
                   
                   <div className="p-6 space-y-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setStatementType('MONTHLY')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${statementType === 'MONTHLY' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Monthly</button>
                            <button onClick={() => setStatementType('YEARLY')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${statementType === 'YEARLY' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Yearly</button>
                            <button onClick={() => setStatementType('CUSTOM')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${statementType === 'CUSTOM' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Custom</button>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            {statementType === 'MONTHLY' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Select Period</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select 
                                                value={statementDate.month} 
                                                onChange={(e) => setStatementDate({...statementDate, month: parseInt(e.target.value)})}
                                                className="w-full appearance-none bg-white border border-gray-300 text-sm rounded-lg p-2.5 pr-8 focus:outline-none focus:border-indigo-500"
                                            >
                                                {Array.from({length: 12}).map((_, i) => (
                                                    <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                                        </div>
                                        <div className="relative w-24">
                                            <select 
                                                value={statementDate.year} 
                                                onChange={(e) => setStatementDate({...statementDate, year: parseInt(e.target.value)})}
                                                className="w-full appearance-none bg-white border border-gray-300 text-sm rounded-lg p-2.5 pr-8 focus:outline-none focus:border-indigo-500"
                                            >
                                                <option value={2023}>2023</option>
                                                <option value={2024}>2024</option>
                                                <option value={2025}>2025</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {statementType === 'YEARLY' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Financial Year</label>
                                    <div className="relative">
                                        <select 
                                            value={statementDate.year} 
                                            onChange={(e) => setStatementDate({...statementDate, year: parseInt(e.target.value)})}
                                            className="w-full appearance-none bg-white border border-gray-300 text-sm rounded-lg p-2.5 pr-8 focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value={2023}>FY 2023-24</option>
                                            <option value={2024}>FY 2024-25</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            {statementType === 'CUSTOM' && (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Start Date</label>
                                            <input 
                                                type="date" 
                                                value={customRange.start}
                                                onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                                                className="w-full bg-white border border-gray-300 text-sm rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">End Date</label>
                                            <input 
                                                type="date" 
                                                value={customRange.end}
                                                onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                                                className="w-full bg-white border border-gray-300 text-sm rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-[10px] text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start">
                             <ShieldCheck size={14} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                             Statement includes full GST breakdown, Source of Funds (Company Name), and Tax Deductions for compliance.
                        </div>
                   </div>

                   <div className="p-6 bg-gray-50 flex space-x-3 pt-2">
                       <button 
                           onClick={() => setShowStatementModal(false)}
                           className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                       >
                           Cancel
                       </button>
                       <button 
                           onClick={generateAccountStatement}
                           className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                       >
                           Download PDF
                       </button>
                   </div>
               </div>
           </div>
       )}
       
       {/* Regulatory Footer */}
       <div className="mt-8 text-center text-[10px] text-gray-400 pb-2 px-6 border-t border-gray-200 pt-4">
           <p className="mb-2">{FINANCIAL_DISCLAIMER}</p>
           <p>{APP_NAME} acts as a technology intermediary. All taxes are deducted at source (TDS) as per Section 194B/115BBH of the Income Tax Act.</p>
       </div>
    </div>
  );
};
