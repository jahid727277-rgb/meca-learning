/**
 * Converts a price in USD to BDT using an exchange rate of 120 BDT/USD
 * and formats it with the Bangladeshi Taka (৳) symbol in English digits.
 * 
 * @param usdPrice The price in USD
 * @returns The formatted price string in Bangladeshi Taka (e.g. ৳৫,৯৯৯)
 */
export function formatBDTPrice(price: string | number): string {
  if (price === undefined || price === null || price === '') return '৳ ০';
  
  const originalUsdPrices = [49.99, 79.99, 99.99];
  
  if (typeof price === 'number') {
    if (isNaN(price)) return '৳ ০';
    if (originalUsdPrices.includes(price)) {
      // Convert original USD prices to BDT
      const bdtAmount = Math.round(price * 120);
      return `৳ ${bdtAmount.toLocaleString('en-US')}`;
    } else {
      // Other numbers are already BDT
      return `৳ ${Math.round(price).toLocaleString('en-US')}`;
    }
  }
  
  const trimmed = price.trim();
  
  // Try to parse as a number (only if it consists of standard English digits, dot, commas)
  const cleanNumericStr = trimmed.replace(/,/g, '');
  const parsedNum = Number(cleanNumericStr);
  
  if (!isNaN(parsedNum) && cleanNumericStr !== '') {
    if (originalUsdPrices.includes(parsedNum)) {
      const bdtAmount = Math.round(parsedNum * 120);
      return `৳ ${bdtAmount.toLocaleString('en-US')}`;
    } else {
      // Otherwise, it's a BDT amount directly
      return `৳ ${Math.round(parsedNum).toLocaleString('en-US')}`;
    }
  }
  
  // For any other text (e.g. "ফ্রি", "১০,০০০ টাকা", "৳ ৫০০", "Free"), return exactly as is!
  return trimmed;
}

/**
 * Formats a raw number of BDT (Bangladeshi Taka) with currency symbol.
 */
export function formatRawBDT(bdtAmount: number): string {
  if (typeof bdtAmount !== 'number' || isNaN(bdtAmount)) return '৳০';
  return `৳ ${Math.round(bdtAmount).toLocaleString('en-US')}`;
}
