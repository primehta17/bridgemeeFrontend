const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const validateCardForm = ({ cardNumber, expiry, cvv, name }) => {
  const digits = cardNumber.replace(/\s/g, '');
  if (!/^\d{16}$/.test(digits)) return 'Enter a 16-digit card number';
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Expiry must be MM/YY';
  if (!/^\d{3,4}$/.test(cvv)) return 'Enter a valid CVV';
  if (!name?.trim()) return 'Cardholder name is required';
  return null;
};

/** Simulates payment processing; returns payload for the API. */
export const processMockPayment = async (amount, cardNumber) => {
  await delay(1500);
  const digits = cardNumber.replace(/\s/g, '');
  return {
    method: 'mock',
    mockTransactionId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    amount: Number(amount),
    paidAt: new Date().toISOString(),
    cardLast4: digits.slice(-4),
  };
};
