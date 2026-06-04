export const RISK_COLORS = {
  low: '#22c55e',
  medium: '#fbbf24',
  high: '#ef4444',
}

export const RISK_LABEL_ID = {
  low: 'Aman',
  medium: 'Waspada',
  high: 'Kritis',
}

export function riskColor(label) {
  return RISK_COLORS[label] || '#94a3b8'
}

export function hitungRisiko(data, field = 'risk_label') {
  return data.reduce(
    (acc, d) => {
      const k = d[field]
      if (k === 'low') acc.low++
      else if (k === 'medium') acc.medium++
      else if (k === 'high') acc.high++
      return acc
    },
    { low: 0, medium: 0, high: 0 },
  )
}
