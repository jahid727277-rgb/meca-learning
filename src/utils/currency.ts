/**
 * Converts a price in USD to BDT using an exchange rate of 120 BDT/USD
 * and formats it with the Bangladeshi Taka (৳) symbol in English digits.
 * 
 * @param usdPrice The price in USD
 * @returns The formatted price string in Bangladeshi Taka (e.g. ৳৫,৯৯৯)
 */
export function formatBDTPrice(usdPrice: number): string {
  if (typeof usdPrice !== 'number' || isNaN(usdPrice)) return '৳০';
  
  // Convert 1 USD = 120 BDT
  const bdtAmount = Math.round(usdPrice * 120);
  
  // Format with comma separating thousands
  return `৳ ${bdtAmount.toLocaleString('en-US')}`;
}

/**
 * Formats a raw number of BDT (Bangladeshi Taka) with currency symbol.
 */
export function formatRawBDT(bdtAmount: number): string {
  if (typeof bdtAmount !== 'number' || isNaN(bdtAmount)) return '৳০';
  return `৳ ${Math.round(bdtAmount).toLocaleString('en-US')}`;
}
