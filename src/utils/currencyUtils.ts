// Currency formatting utility for GNF (Guinean Franc)

/**
 * Formats a number as GNF currency
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string like "GNF 1,000,000"
 */
export function formatCurrency(amount: number | string, decimals: number = 0): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return 'GNF 0'
  }
  
  // Format with commas and specified decimals
  const formatted = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  
  return `GNF ${formatted}`
}

