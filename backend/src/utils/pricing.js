export const FREE_SHIPPING_AT = 1999;
export const SHIPPING_FEE = 79;

export function sellingPrice(product) {
  const price = Number(product.price) || 0;
  const discount = Number(product.discountPrice);
  if (discount > 0 && discount < price) return discount;
  return price;
}

export function calcTotals(subtotal, discountPercent = 0) {
  const safeSubtotal = Math.max(0, Math.round(subtotal));
  const percent = Math.min(Math.max(Number(discountPercent) || 0, 0), 100);
  const discount = Math.round((safeSubtotal * percent) / 100);
  const afterDiscount = safeSubtotal - discount;
  const shipping = afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;
  return {
    subtotal: safeSubtotal,
    discount,
    shipping,
    total: afterDiscount + shipping,
  };
}
