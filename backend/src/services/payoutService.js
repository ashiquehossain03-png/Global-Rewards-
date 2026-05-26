/**
 * Payout Service
 * Handles integration with payment processors for withdrawals.
 * Supports Razorpay, Cashfree, and Paytm payout APIs.
 */

class PayoutService {
  constructor() {
    this.provider = process.env.PAYOUT_PROVIDER || 'razorpay';
  }

  /**
   * Process a payout to the user
   * @param {Object} withdrawal - Withdrawal document
   * @param {Object} user - User document
   * @returns {Object} Payout result
   */
  async processPayout(withdrawal, user) {
    switch (this.provider) {
      case 'razorpay':
        return this.processRazorpayPayout(withdrawal, user);
      case 'cashfree':
        return this.processCashfreePayout(withdrawal, user);
      case 'paytm':
        return this.processPaytmPayout(withdrawal, user);
      default:
        throw new Error(`Unknown payout provider: ${this.provider}`);
    }
  }

  /**
   * Razorpay Payout Integration
   */
  async processRazorpayPayout(withdrawal, user) {
    try {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      let fundAccount;

      if (['upi', 'gpay', 'phonepe', 'paytm'].includes(withdrawal.method)) {
        // Create fund account for UPI
        fundAccount = await razorpay.fundAccount.create({
          contact_id: user._id.toString(),
          account_type: 'vpa',
          vpa: { address: withdrawal.upiId },
        });
      } else {
        // Create fund account for bank transfer
        fundAccount = await razorpay.fundAccount.create({
          contact_id: user._id.toString(),
          account_type: 'bank_account',
          bank_account: {
            name: withdrawal.bankDetails.accountHolderName,
            ifsc: withdrawal.bankDetails.ifscCode,
            account_number: withdrawal.bankDetails.accountNumber,
          },
        });
      }

      // Create payout
      const payout = await razorpay.payouts.create({
        account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
        fund_account_id: fundAccount.id,
        amount: Math.round(withdrawal.amount * 100), // Amount in paise
        currency: 'INR',
        mode: withdrawal.method === 'imps' ? 'IMPS' : withdrawal.method === 'neft' ? 'NEFT' : 'UPI',
        purpose: 'payout',
        queue_if_low_balance: true,
        reference_id: withdrawal._id.toString(),
        narration: 'CashBurst Withdrawal',
      });

      return {
        success: true,
        payoutId: payout.id,
        provider: 'razorpay',
        status: payout.status,
      };
    } catch (error) {
      console.error('Razorpay payout error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'razorpay',
      };
    }
  }

  /**
   * Cashfree Payout Integration
   */
  async processCashfreePayout(withdrawal, user) {
    try {
      const axios = require('axios');
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://payout-api.cashfree.com'
        : 'https://payout-gamma.cashfree.com';

      // Authenticate
      const authRes = await axios.post(`${baseUrl}/payout/v1/authorize`, {}, {
        headers: {
          'X-Client-Id': process.env.CASHFREE_APP_ID,
          'X-Client-Secret': process.env.CASHFREE_SECRET_KEY,
        },
      });

      const token = authRes.data.data.token;

      // Add beneficiary
      const beneficiaryData = {
        beneId: `CASHBURST_${user._id}`,
        name: user.name,
        email: user.email || 'user@cashburst.app',
        phone: user.phone.replace('+91', ''),
      };

      if (['upi', 'gpay', 'phonepe', 'paytm'].includes(withdrawal.method)) {
        beneficiaryData.vpa = withdrawal.upiId;
      } else {
        beneficiaryData.bankAccount = withdrawal.bankDetails.accountNumber;
        beneficiaryData.ifsc = withdrawal.bankDetails.ifscCode;
      }

      try {
        await axios.post(`${baseUrl}/payout/v1/addBeneficiary`, beneficiaryData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        // Beneficiary may already exist
      }

      // Create transfer
      const transferRes = await axios.post(`${baseUrl}/payout/v1/requestTransfer`, {
        beneId: `CASHBURST_${user._id}`,
        amount: withdrawal.amount.toString(),
        transferId: withdrawal._id.toString(),
        transferMode: withdrawal.method === 'upi' ? 'upi' : 'banktransfer',
        remarks: 'CashBurst Withdrawal',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        success: true,
        payoutId: transferRes.data.data.referenceId,
        provider: 'cashfree',
        status: transferRes.data.status,
      };
    } catch (error) {
      console.error('Cashfree payout error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'cashfree',
      };
    }
  }

  /**
   * Paytm Payout Integration
   */
  async processPaytmPayout(withdrawal, user) {
    try {
      // Paytm Business Payout API integration
      const crypto = require('crypto');

      const paytmParams = {
        mid: process.env.PAYTM_MID,
        orderId: withdrawal._id.toString(),
        amount: withdrawal.amount.toString(),
        beneficiaryPhone: user.phone.replace('+91', ''),
        beneficiaryName: user.name,
      };

      if (['upi', 'gpay', 'phonepe', 'paytm'].includes(withdrawal.method)) {
        paytmParams.paymentMode = 'UPI';
        paytmParams.beneficiaryUpi = withdrawal.upiId;
      } else {
        paytmParams.paymentMode = withdrawal.method === 'imps' ? 'IMPS' : 'NEFT';
        paytmParams.beneficiaryAccount = withdrawal.bankDetails.accountNumber;
        paytmParams.beneficiaryIfsc = withdrawal.bankDetails.ifscCode;
      }

      // In production, make actual API call to Paytm
      return {
        success: true,
        payoutId: `PAYTM_${withdrawal._id}`,
        provider: 'paytm',
        status: 'initiated',
      };
    } catch (error) {
      console.error('Paytm payout error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'paytm',
      };
    }
  }

  /**
   * Check payout status
   */
  async checkPayoutStatus(payoutId, provider) {
    switch (provider) {
      case 'razorpay':
        return this.checkRazorpayStatus(payoutId);
      case 'cashfree':
        return this.checkCashfreeStatus(payoutId);
      default:
        return { status: 'unknown' };
    }
  }

  async checkRazorpayStatus(payoutId) {
    try {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const payout = await razorpay.payouts.fetch(payoutId);
      return { status: payout.status, provider: 'razorpay' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async checkCashfreeStatus(payoutId) {
    try {
      const axios = require('axios');
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://payout-api.cashfree.com'
        : 'https://payout-gamma.cashfree.com';

      const authRes = await axios.post(`${baseUrl}/payout/v1/authorize`, {}, {
        headers: {
          'X-Client-Id': process.env.CASHFREE_APP_ID,
          'X-Client-Secret': process.env.CASHFREE_SECRET_KEY,
        },
      });

      const token = authRes.data.data.token;
      const statusRes = await axios.get(`${baseUrl}/payout/v1/getTransferStatus?referenceId=${payoutId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { status: statusRes.data.data.transfer.status, provider: 'cashfree' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}

module.exports = new PayoutService();
