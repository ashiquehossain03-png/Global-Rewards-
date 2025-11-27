

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  EARN = 'EARN',
  MINING = 'MINING',
  REFERRAL = 'REFERRAL',
  WALLET = 'WALLET',
  PROFILE = 'PROFILE',
  LEADERBOARD = 'LEADERBOARD',
  PROFORMA = 'PROFORMA'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  BINANCE = 'BINANCE'
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency?: 'INR' | 'BTC'; // Track currency type
  type: 'EARNING' | 'WITHDRAWAL';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  method?: string; // e.g., "Binance (TRC20)" or "HDFC Bank"
  tax?: number;
  netAmount?: number;
  details?: string; // Stores formatted account details like "Bank: SBI | Acc: 123..."
  failureReason?: string; // Reason for failure if status is FAILED
}

export interface BankDetails {
  holderName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
}

export interface CryptoDetails {
  network: string; // e.g., "Binance Pay ID" or "TRC20"
  address: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string; // URL or Base64 string
  balance: number; // INR Balance
  btcBalance: number; // Bitcoin Balance
  totalEarned: number;
  dailyAdsWatched: number;
  accountLevel: 'Basic' | 'Premium' | 'VIP';
  vipExpiry?: string; // ISO Date String
  referralCode: string;
  referralEarnings: number;
  referrals: number;
  bankDetails?: BankDetails;
  cryptoDetails?: CryptoDetails;
}

export interface TeamLevel {
  level: number;
  label: string;
  commission: string;
  members: number;
  earnings: number;
  unlocked: boolean;
  requirement: string;
}