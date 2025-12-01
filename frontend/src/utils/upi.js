// src/utils/upi.js

/**
 * Opens the UPI intent on mobile devices
 * @param {number} amount - Amount to pay in INR
 */
export const openUpiIntent = (amount) => {
  // HumDono Official UPI ID
  const vpa = '8813965378@ptyes'; 
  const name = 'Hum dono';
  const txnNote = 'HumDono Lifetime Premium';
  const currency = 'INR';
  
  // Build UPI URL
  // upi://pay?pa=...&pn=...&tn=...&am=...&cu=INR
  const url = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&tn=${encodeURIComponent(txnNote)}&am=${amount}&cu=${currency}`;
  
  // Redirect to UPI app
  window.location.href = url;
};
