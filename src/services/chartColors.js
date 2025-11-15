// Chart color gradients [ Base, 60% opacity, 25% opacity, Darker ]
export const GRADIENT_COLORS = {
  green: ['#10b981', '#10b98199', '#10b98140', '#059669'],
  blue: ['#2563eb', '#2563eb99', '#2563eb40', '#1d4ed8'],
  red: ['#ef4444', '#ef444499', '#ef444440', '#b91c1c'],
}

/**
 * Returns gradient colors based on percentage change
 * Green for positive trends (>5%), blue for slight positive, red for negative
 * @param {number|null} pct - Percentage change from first to last
 * @returns {[string, string, string, string]} Array of colors: [baseColor, startColor, endColor, pointColor]
 */
export function getGradientColors(pct) {
  if (!pct || pct < 0) return GRADIENT_COLORS['red']
  if (pct > 5) return GRADIENT_COLORS['green']
  return GRADIENT_COLORS['blue']
}

/**
 * Returns color class name based on percentage change
 * Used for styling stats cards consistently with chart
 * @param {number|null} pct - Percentage change from first to last
 * @param {number|null} value - The value to check (for zero/neutral state)
 * @returns {string} Color class: 'green', 'positive' (blue), 'negative' (red), 'neutral', or ''
 */
export function getColorClass(pct, value) {
  if (typeof value !== 'number') return ''
  if (value < 0) return 'negative'
  if (value === 0) return 'neutral'
  // Use green for strong positive trends (>5%), blue for moderate positive
  if (pct != null && pct > 5) return 'green'
  if (value > 0) return 'positive'
  return ''
}
