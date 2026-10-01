export const FREE_SHIPPING_AT = 1999;
export const SHIPPING_FEE = 79;

export function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function calcTotals(subtotal, discountPercent = 0) {
  const discount = Math.round((subtotal * (discountPercent || 0)) / 100);
  const after = Math.max(0, subtotal - discount);
  const shipping = after === 0 || after >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;
  return { subtotal, discount, shipping, total: after + shipping };
}
