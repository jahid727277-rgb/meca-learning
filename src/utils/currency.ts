/**
 * Formats a price value in Bangladeshi Taka (৳).
 * 
 * @param price The price amount or custom string
 * @returns The formatted price string in BDT (e.g. ৳ ৬,০০০)
 */
export function formatBDTPrice(price: string | number): string {
  if (price === undefined || price === null || price === '') return '৳ ০';
  
  if (typeof price === 'number') {
    if (isNaN(price)) return '৳ ০';
    return `৳ ${Math.round(price).toLocaleString('en-US')}`;
  }
  
  const trimmed = String(price).trim();
  
  // Try to parse as a number (only if it consists of standard digits, dot, commas)
  const cleanNumericStr = trimmed.replace(/,/g, '');
  const parsedNum = Number(cleanNumericStr);
  
  if (!isNaN(parsedNum) && cleanNumericStr !== '') {
    return `৳ ${Math.round(parsedNum).toLocaleString('en-US')}`;
  }
  
  // For any other text (e.g. "ফ্রি", "১০,০০০ টাকা", "৳ ৫০০", "Free"), return as is
  return trimmed;
}

/**
 * Formats a raw number of BDT (Bangladeshi Taka) with currency symbol.
 */
export function formatRawBDT(bdtAmount: number): string {
  if (typeof bdtAmount !== 'number' || isNaN(bdtAmount)) return '৳ ০';
  return `৳ ${Math.round(bdtAmount).toLocaleString('en-US')}`;
}
