import { ExchangeRateData } from './types'

// 1. Export to CSV (Spreadsheet friendly)
export function exportToCSV(data: ExchangeRateData): void {
  const headers = ['Country', 'Currency', 'Amount', 'Currency Code', 'Rate (CZK)']
  
  const rows = data.rates.map(rate => [
    rate.country,
    rate.currency,
    rate.amount.toString(),
    rate.currencyCode,
    rate.rate.toFixed(3)
  ])

  // Add a metadata row at the top, followed by headers and data
  const csvContent = [
    `# CNB Exchange Rates - ${data.date}`,
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  downloadFile(csvContent, `cnb-rates-${data.date}.csv`, 'text/csv;charset=utf-8;')
}

// 2. Export to Text (Human readable text file)
export function exportToText(data: ExchangeRateData): void {
  const lines: string[] = []

  lines.push(`CNB EXCHANGE RATES`)
  lines.push(`==========================================`)
  lines.push(`Date: ${new Date(data.date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`)
  lines.push(`Total Currencies: ${data.rates.length}`)
  lines.push(`Source: Czech National Bank`)
  lines.push(`==========================================`)
  lines.push(``)

  data.rates.forEach((rate, index) => {
    lines.push(`${index + 1}. ${rate.currencyCode} - ${rate.currency}`)
    lines.push(`   Country:  ${rate.country}`)
    lines.push(`   Rate:     ${rate.amount} ${rate.currencyCode} = ${rate.rate.toFixed(3)} CZK`)
    lines.push(`   Per Unit: 1 ${rate.currencyCode} = ${(rate.rate / rate.amount).toFixed(3)} CZK`)
    lines.push(`------------------------------------------`)
  })

  const textContent = lines.join('\n')
  downloadFile(textContent, `cnb-rates-${data.date}.txt`, 'text/plain;charset=utf-8;')
}

// 3. Export to JSON (Structured data format)
export function exportToJSON(data: ExchangeRateData): void {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, `cnb-rates-${data.date}.json`, 'application/json')
}

// 4. Export to PDF (Visual document via SVG data URI)
export function exportToPDF(data: ExchangeRateData): void {
  const pageWidth = 210
  const pageHeight = Math.max(297, 40 + (data.rates.length * 20))
  const margin = 10
  const yPosition = margin + 10

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}mm" height="${pageHeight}mm" viewBox="0 0 ${pageWidth} ${pageHeight}">
  <defs>
    <style>
      .title { font-family: Arial, sans-serif; font-size: 8px; font-weight: bold; fill: #1a1a1a; }
      .header { font-family: Arial, sans-serif; font-size: 4px; fill: #4a4a4a; }
      .body { font-family: Arial, sans-serif; font-size: 3.5px; fill: #2a2a2a; }
      .divider { stroke: #cccccc; stroke-width: 0.3; }
    </style>
  </defs>
  
  <rect width="100%" height="100%" fill="white"/>
  
  <text x="${margin}" y="${yPosition}" class="title">CNB Exchange Rates</text>
  <text x="${margin}" y="${yPosition + 6}" class="header">Valid Date: ${new Date(data.date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}</text>
  <text x="${margin}" y="${yPosition + 10}" class="header">Total Currencies: ${data.rates.length}</text>
  <text x="${margin}" y="${yPosition + 14}" class="header">Source: Czech National Bank (CNB)</text>
  
  <line x1="${margin}" y1="${yPosition + 18}" x2="${pageWidth - margin}" y2="${yPosition + 18}" class="divider"/>
  
  ${data.rates.map((rate, index) => {
    const baseY = yPosition + 25 + (index * 16)
    return `
    <text x="${margin}" y="${baseY}" class="body" font-weight="bold">${index + 1}. ${rate.currencyCode} - ${rate.currency}</text>
    <text x="${margin + 5}" y="${baseY + 3.5}" class="body">Country: ${rate.country}</text>
    <text x="${margin + 5}" y="${baseY + 7}" class="body">Rate: ${rate.amount} ${rate.currencyCode} = ${rate.rate.toFixed(3)} CZK</text>
    <text x="${margin + 5}" y="${baseY + 10.5}" class="body">Per Unit: 1 ${rate.currencyCode} = ${(rate.rate / rate.amount).toFixed(3)} CZK</text>
    <line x1="${margin}" y1="${baseY + 13}" x2="${pageWidth - margin}" y2="${baseY + 13}" class="divider" stroke-dasharray="2"/>
    `
  }).join('')}
  
  <text x="${pageWidth / 2}" y="${pageHeight - 5}" class="header" text-anchor="middle">
    Generated: ${new Date().toLocaleString('en-US')}
  </text>
</svg>`

  downloadFile(svgContent, `cnb-rates-${data.date}.svg`, 'image/svg+xml')
}

// 5. Export to SVG (Visual document)
export function exportToSVG(data: ExchangeRateData): void {
  const pageWidth = 210
  const pageHeight = Math.max(297, 40 + (data.rates.length * 20))
  const margin = 10
  const yPosition = margin + 10

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}mm" height="${pageHeight}mm" viewBox="0 0 ${pageWidth} ${pageHeight}">
  <defs>
    <style>
      .title { font-family: Arial, sans-serif; font-size: 8px; font-weight: bold; fill: #1a1a1a; }
      .header { font-family: Arial, sans-serif; font-size: 4px; fill: #4a4a4a; }
      .body { font-family: Arial, sans-serif; font-size: 3.5px; fill: #2a2a2a; }
      .divider { stroke: #cccccc; stroke-width: 0.3; }
    </style>
  </defs>
  
  <rect width="100%" height="100%" fill="white"/>
  
  <text x="${margin}" y="${yPosition}" class="title">CNB Exchange Rates</text>
  <text x="${margin}" y="${yPosition + 6}" class="header">Valid Date: ${new Date(data.date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}</text>
  <text x="${margin}" y="${yPosition + 10}" class="header">Total Currencies: ${data.rates.length}</text>
  <text x="${margin}" y="${yPosition + 14}" class="header">Source: Czech National Bank (CNB)</text>
  
  <line x1="${margin}" y1="${yPosition + 18}" x2="${pageWidth - margin}" y2="${yPosition + 18}" class="divider"/>
  
  ${data.rates.map((rate, index) => {
    const baseY = yPosition + 25 + (index * 16)
    return `
    <text x="${margin}" y="${baseY}" class="body" font-weight="bold">${index + 1}. ${rate.currencyCode} - ${rate.currency}</text>
    <text x="${margin + 5}" y="${baseY + 3.5}" class="body">Country: ${rate.country}</text>
    <text x="${margin + 5}" y="${baseY + 7}" class="body">Rate: ${rate.amount} ${rate.currencyCode} = ${rate.rate.toFixed(3)} CZK</text>
    <text x="${margin + 5}" y="${baseY + 10.5}" class="body">Per Unit: 1 ${rate.currencyCode} = ${(rate.rate / rate.amount).toFixed(3)} CZK</text>
    <line x1="${margin}" y1="${baseY + 13}" x2="${pageWidth - margin}" y2="${baseY + 13}" class="divider" stroke-dasharray="2"/>
    `
  }).join('')}
  
  <text x="${pageWidth / 2}" y="${pageHeight - 5}" class="header" text-anchor="middle">
    Generated: ${new Date().toLocaleString('en-US')}
  </text>
</svg>`

  downloadFile(svgContent, `cnb-rates-${data.date}.svg`, 'image/svg+xml')
}

// Helper function to trigger downloads
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}