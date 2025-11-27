

export const APP_NAME = "GlobalAdRewards";
export const CURRENCY_SYMBOL = "₹";
export const BTC_SYMBOL = "₿";

export const DAILY_AD_LIMIT = 10;
export const REWARD_PER_AD = 95; // 95 * 10 = 950 Rupees
export const REFERRAL_BONUS = 250;
export const MIN_WITHDRAWAL = 2000;
export const MIN_BTC_WITHDRAWAL = 0.05;

// VIP Subscription Constants
export const VIP_COST = 500;
export const VIP_DURATION_MONTHS = 6;
export const VIP_REFERRAL_TARGET = 20;

// Mining Constants
export const DAILY_BTC_LIMIT = 0.2; // Target 0.2 BTC per day
export const BTC_PER_SECOND = DAILY_BTC_LIMIT / 86400; // Calculated rate per second
export const OFFLINE_MINING_EFFICIENCY = 0.5; // 50% earnings when app is closed (Cloud Mining)

// Legal & Compliance
export const TDS_TAX_RATE = 0.10; // 10% Tax Deducted at Source (Govt Rule for INR)
export const CRYPTO_TAX_RATE = 0.30; // 30% Tax on Virtual Digital Assets (Govt Rule)
export const PROCESSING_FEE = 0; // Free Premium

// Mandatory Regulatory Disclaimers (ASCI & SEBI Guidelines)
export const VDA_DISCLAIMER = "Crypto products and NFTs are unregulated and can be highly risky. There may be no regulatory recourse for any loss from such transactions.";
export const FINANCIAL_DISCLAIMER = "Participation in tasks involves financial incentives. Users are advised to verify tax liabilities under Income Tax Act, 1961.";

export const MOCK_TRANSACTIONS = [
  { id: 'tx_101', date: '2023-10-24', amount: 950, currency: 'INR', type: 'EARNING', status: 'COMPLETED', method: 'Daily Task' },
  { id: 'tx_102', date: '2023-10-23', amount: 950, currency: 'INR', type: 'EARNING', status: 'COMPLETED', method: 'Daily Task' },
  { id: 'tx_103', date: '2023-10-22', amount: 2000, currency: 'INR', type: 'WITHDRAWAL', status: 'COMPLETED', method: 'Binance (USDT)' },
] as const;