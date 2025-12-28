import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { HistoricalPrediction } from '@/hooks/use-prediction-history'

interface AccuracyAnalytics {
  overallAccuracy: number
  totalPredictions: number
  totalDataPoints: number
  currencyStats: Array<{
    currency: string
    avgAccuracy: number
    predictions: number
    bestAccuracy: number
    worstAccuracy: number
    consistency: number
  }>
  trendStats: Array<{
    trend: string
    avgAccuracy: number
    predictions: number
  }>
  accuracyOverTime: Array<{
    id: string
    currency: string
    date: string
    fullDate: string
    accuracy: number
    avgVariance: number
    trend: string
    dataPoints: number
  }>
  recentTrend: number | null
  isImproving: boolean | null
}

interface ReportOptions {
  title?: string
  includeCharts?: boolean
  includeDetailedStats?: boolean
}

export class AccuracyReportGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private currentY: number
  private primaryColor: [number, number, number] = [53, 51, 153]
  private accentColor: [number, number, number] = [16, 185, 129]
  private textColor: [number, number, number] = [64, 64, 64]

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 15
    this.currentY = this.margin
  }

  private addHeader(title: string) {
    this.doc.setFillColor(...this.primaryColor)
    this.doc.rect(0, 0, this.pageWidth, 40, 'F')

    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, 20)

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    this.doc.text(`Generated: ${dateStr}`, this.margin, 30)

    this.currentY = 50
    this.doc.setTextColor(...this.textColor)
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      this.doc.setFontSize(9)
      this.doc.setTextColor(150, 150, 150)
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      )
      this.doc.text(
        'CNB Exchange Rates - Accuracy Analytics Report',
        this.margin,
        this.pageHeight - 10
      )
    }
  }

  private checkPageBreak(requiredSpace: number = 20): void {
    if (this.currentY + requiredSpace > this.pageHeight - 20) {
      this.doc.addPage()
      this.currentY = this.margin
    }
  }

  private addSection(title: string, icon?: string) {
    this.checkPageBreak(15)
    
    this.doc.setFillColor(245, 247, 250)
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 2, 2, 'F')
    
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(...this.primaryColor)
    const text = icon ? `${icon} ${title}` : title
    this.doc.text(text, this.margin + 3, this.currentY + 7)
    
    this.currentY += 15
    this.doc.setTextColor(...this.textColor)
    this.doc.setFont('helvetica', 'normal')
  }

  private addText(text: string, size: number = 10, bold: boolean = false) {
    this.checkPageBreak()
    this.doc.setFontSize(size)
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal')
    
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin)
    this.doc.text(lines, this.margin, this.currentY)
    this.currentY += lines.length * (size / 2) + 3
  }

  private addMetricCard(
    label: string,
    value: string,
    subtext: string,
    x: number,
    y: number,
    width: number,
    color: [number, number, number]
  ) {
    this.doc.setFillColor(250, 251, 252)
    this.doc.roundedRect(x, y, width, 25, 2, 2, 'F')
    
    this.doc.setDrawColor(...color)
    this.doc.setLineWidth(0.5)
    this.doc.line(x + 3, y + 3, x + 3, y + 22)

    this.doc.setFontSize(9)
    this.doc.setTextColor(120, 120, 120)
    this.doc.text(label, x + 6, y + 7)

    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(...color)
    this.doc.text(value, x + 6, y + 15)

    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(120, 120, 120)
    this.doc.text(subtext, x + 6, y + 20)

    this.doc.setTextColor(...this.textColor)
  }

  private addKeyMetrics(analytics: AccuracyAnalytics) {
    this.addSection('Key Performance Metrics', '📊')
    this.checkPageBreak(30)

    const startY = this.currentY
    const cardWidth = (this.pageWidth - 2 * this.margin - 6) / 2

    this.addMetricCard(
      'Overall Accuracy',
      `${analytics.overallAccuracy.toFixed(1)}%`,
      `${analytics.totalDataPoints} data points`,
      this.margin,
      startY,
      cardWidth,
      this.accentColor
    )

    this.addMetricCard(
      'Total Predictions',
      `${analytics.totalPredictions}`,
      `${analytics.currencyStats.length} currencies`,
      this.margin + cardWidth + 3,
      startY,
      cardWidth,
      this.primaryColor
    )

    this.currentY = startY + 30

    if (analytics.currencyStats.length > 0) {
      const bestCurrency = analytics.currencyStats[0]
      this.addMetricCard(
        'Best Currency',
        bestCurrency.currency,
        `${bestCurrency.avgAccuracy.toFixed(1)}% accuracy`,
        this.margin,
        this.currentY,
        cardWidth,
        this.primaryColor
      )
    }

    if (analytics.recentTrend !== null && analytics.isImproving !== null) {
      this.addMetricCard(
        'Recent Trend',
        `${analytics.recentTrend.toFixed(1)}%`,
        analytics.isImproving ? '↗ Improving' : '→ Stable',
        this.margin + cardWidth + 3,
        this.currentY,
        cardWidth,
        analytics.isImproving ? this.accentColor : [150, 150, 150]
      )
    }

    this.currentY += 30
  }

  private addPerformanceInsight(analytics: AccuracyAnalytics) {
    this.addSection('Performance Insight', '💡')
    this.checkPageBreak(20)

    this.doc.setFillColor(240, 253, 244)
    const boxHeight = 15
    this.doc.roundedRect(
      this.margin,
      this.currentY,
      this.pageWidth - 2 * this.margin,
      boxHeight,
      2,
      2,
      'F'
    )

    this.doc.setFontSize(10)
    this.doc.setTextColor(22, 101, 52)

    let insight = ''
    if (analytics.isImproving) {
      insight = `🎯 Your prediction accuracy is improving! Recent predictions are ${((analytics.recentTrend || 0) - analytics.overallAccuracy).toFixed(1)}% more accurate than earlier ones. Keep up the excellent work!`
    } else {
      insight = `📈 Your predictions maintain consistent quality. Consider analyzing top-performing currencies to identify patterns for improvement.`
    }

    const lines = this.doc.splitTextToSize(insight, this.pageWidth - 2 * this.margin - 6)
    this.doc.text(lines, this.margin + 3, this.currentY + 6)

    this.currentY += boxHeight + 5
    this.doc.setTextColor(...this.textColor)
  }

  private addAccuracyOverTimeChart(analytics: AccuracyAnalytics) {
    this.addSection('Accuracy Trend Over Time', '📈')
    this.checkPageBreak(60)

    const chartX = this.margin
    const chartY = this.currentY
    const chartWidth = this.pageWidth - 2 * this.margin
    const chartHeight = 50
    const plotWidth = chartWidth - 30
    const plotHeight = chartHeight - 20

    this.doc.setDrawColor(200, 200, 200)
    this.doc.setLineWidth(0.2)
    this.doc.rect(chartX + 25, chartY, plotWidth, plotHeight)

    for (let i = 0; i <= 5; i++) {
      const y = chartY + (plotHeight * i) / 5
      this.doc.line(chartX + 25, y, chartX + 25 + plotWidth, y)
      
      const value = 100 - (i * 20)
      this.doc.setFontSize(8)
      this.doc.setTextColor(120, 120, 120)
      this.doc.text(`${value}%`, chartX + 20, y + 1, { align: 'right' })
    }

    if (analytics.accuracyOverTime.length > 0) {
      const data = analytics.accuracyOverTime
      const maxPoints = Math.min(data.length, 20)
      const displayData = data.slice(-maxPoints)
      
      this.doc.setDrawColor(...this.accentColor)
      this.doc.setLineWidth(1)

      for (let i = 0; i < displayData.length - 1; i++) {
        const x1 = chartX + 25 + (plotWidth * i) / (displayData.length - 1)
        const y1 = chartY + plotHeight - (displayData[i].accuracy / 100) * plotHeight
        const x2 = chartX + 25 + (plotWidth * (i + 1)) / (displayData.length - 1)
        const y2 = chartY + plotHeight - (displayData[i + 1].accuracy / 100) * plotHeight

        this.doc.line(x1, y1, x2, y2)
      }

      for (let i = 0; i < displayData.length; i++) {
        const x = chartX + 25 + (plotWidth * i) / (displayData.length - 1)
        const y = chartY + plotHeight - (displayData[i].accuracy / 100) * plotHeight

        this.doc.setFillColor(...this.accentColor)
        this.doc.circle(x, y, 1, 'F')
      }

      this.doc.setFontSize(7)
      this.doc.setTextColor(120, 120, 120)
      for (let i = 0; i < displayData.length; i += Math.ceil(displayData.length / 8)) {
        const x = chartX + 25 + (plotWidth * i) / (displayData.length - 1)
        this.doc.text(displayData[i].date, x, chartY + plotHeight + 5, { 
          align: 'center',
          angle: 45 
        })
      }
    }

    this.currentY = chartY + chartHeight + 15
    this.doc.setTextColor(...this.textColor)
  }

  private addCurrencyPerformanceChart(analytics: AccuracyAnalytics) {
    this.addSection('Top Currencies by Accuracy', '🏆')
    this.checkPageBreak(60)

    const topCurrencies = analytics.currencyStats.slice(0, 10)
    const chartX = this.margin
    const chartY = this.currentY
    const chartWidth = this.pageWidth - 2 * this.margin
    const barHeight = 5
    const spacing = 1

    topCurrencies.forEach((stat, index) => {
      const y = chartY + index * (barHeight + spacing)
      
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setTextColor(...this.textColor)
      this.doc.text(stat.currency, chartX, y + 3.5)

      const barX = chartX + 20
      const maxBarWidth = chartWidth - 50
      const barWidth = (stat.avgAccuracy / 100) * maxBarWidth

      this.doc.setFillColor(240, 240, 245)
      this.doc.roundedRect(barX, y, maxBarWidth, barHeight, 1, 1, 'F')

      const gradient = index < 3 ? this.accentColor : this.primaryColor
      this.doc.setFillColor(...gradient)
      this.doc.roundedRect(barX, y, barWidth, barHeight, 1, 1, 'F')

      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setTextColor(...gradient)
      this.doc.text(
        `${stat.avgAccuracy.toFixed(1)}%`,
        barX + maxBarWidth + 3,
        y + 3.5
      )
    })

    this.currentY = chartY + topCurrencies.length * (barHeight + spacing) + 5
    this.doc.setTextColor(...this.textColor)
  }

  private addTrendAccuracyTable(analytics: AccuracyAnalytics) {
    this.addSection('Accuracy by Trend Type', '📊')
    this.checkPageBreak(40)

    const tableData = analytics.trendStats.map(stat => [
      stat.trend.charAt(0).toUpperCase() + stat.trend.slice(1),
      `${stat.predictions}`,
      `${stat.avgAccuracy.toFixed(1)}%`,
    ])

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Trend Type', 'Predictions', 'Avg Accuracy']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: this.margin, right: this.margin },
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10
  }

  private addDetailedCurrencyStats(analytics: AccuracyAnalytics) {
    this.addSection('Detailed Currency Performance', '📋')
    this.checkPageBreak(40)

    const tableData = analytics.currencyStats.slice(0, 15).map((stat, idx) => [
      `${idx + 1}`,
      stat.currency,
      `${stat.predictions}`,
      `${stat.avgAccuracy.toFixed(1)}%`,
      `${stat.bestAccuracy.toFixed(1)}%`,
      `${stat.consistency.toFixed(1)}%`,
    ])

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Rank', 'Currency', 'Predictions', 'Avg Accuracy', 'Best', 'Consistency']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: this.margin, right: this.margin },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 20, fontStyle: 'bold' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 28, halign: 'right' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 26, halign: 'right' },
      },
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10
  }

  private addSummaryAndRecommendations(analytics: AccuracyAnalytics) {
    this.addSection('Summary & Recommendations', '🎯')
    this.checkPageBreak(40)

    const recommendations: string[] = []

    if (analytics.overallAccuracy >= 85) {
      recommendations.push('✅ Excellent prediction accuracy! Your models are performing exceptionally well.')
    } else if (analytics.overallAccuracy >= 70) {
      recommendations.push('📊 Good prediction accuracy with room for improvement.')
    } else {
      recommendations.push('⚠️ Consider reviewing prediction methodology to improve accuracy.')
    }

    if (analytics.isImproving) {
      recommendations.push('📈 Your accuracy is trending upward - continue your current approach.')
    }

    const bestCurrencies = analytics.currencyStats.slice(0, 3).map(s => s.currency)
    if (bestCurrencies.length > 0) {
      recommendations.push(`🏆 Top performing currencies: ${bestCurrencies.join(', ')}`)
    }

    const worstCurrencies = analytics.currencyStats.slice(-3).map(s => s.currency)
    if (worstCurrencies.length > 0 && analytics.currencyStats.length > 3) {
      recommendations.push(`⚡ Focus improvement efforts on: ${worstCurrencies.join(', ')}`)
    }

    recommendations.push('💡 Regularly review prediction history to identify patterns and improve methodology.')
    recommendations.push('📅 Longer prediction histories provide more reliable accuracy trends.')

    recommendations.forEach((rec, index) => {
      this.checkPageBreak(8)
      this.doc.setFontSize(10)
      const lines = this.doc.splitTextToSize(rec, this.pageWidth - 2 * this.margin - 5)
      this.doc.text(lines, this.margin + 2, this.currentY)
      this.currentY += lines.length * 5 + 3
    })
  }

  public async generateReport(
    analytics: AccuracyAnalytics,
    options: ReportOptions = {}
  ): Promise<Blob> {
    const {
      title = 'Prediction Accuracy Analytics Report',
      includeCharts = true,
      includeDetailedStats = true,
    } = options

    this.addHeader(title)
    this.addKeyMetrics(analytics)
    this.addPerformanceInsight(analytics)

    if (includeCharts) {
      this.addAccuracyOverTimeChart(analytics)
      this.addCurrencyPerformanceChart(analytics)
    }

    this.addTrendAccuracyTable(analytics)

    if (includeDetailedStats) {
      this.addDetailedCurrencyStats(analytics)
    }

    this.addSummaryAndRecommendations(analytics)
    this.addFooter()

    return this.doc.output('blob')
  }

  public async downloadReport(
    analytics: AccuracyAnalytics,
    filename?: string,
    options?: ReportOptions
  ): Promise<void> {
    const blob = await this.generateReport(analytics, options)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `accuracy-report-${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export function calculateAnalytics(history: HistoricalPrediction[]): AccuracyAnalytics | null {
  const predictionsWithData = history.filter(pred => 
    pred.predictions.some(p => p.actualRate !== undefined)
  )

  if (predictionsWithData.length === 0) {
    return null
  }

  const accuracyOverTime = predictionsWithData.map(pred => {
    const withActual = pred.predictions.filter(p => p.actualRate !== undefined)
    
    if (withActual.length === 0) return null

    const totalError = withActual.reduce((sum, p) => {
      const error = Math.abs(p.predicted - (p.actualRate || 0)) / (p.actualRate || 1)
      return sum + error
    }, 0)

    const accuracy = (1 - (totalError / withActual.length)) * 100
    const finalAccuracy = Math.max(0, Math.min(100, accuracy))

    const avgVariance = withActual.reduce((sum, p) => {
      return sum + Math.abs(p.predicted - (p.actualRate || 0))
    }, 0) / withActual.length

    return {
      id: pred.id,
      currency: pred.currency,
      date: new Date(pred.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: pred.createdAt,
      accuracy: finalAccuracy,
      avgVariance,
      trend: pred.overallTrend,
      dataPoints: withActual.length,
    }
  }).filter(Boolean) as any[]

  const currencyAccuracy = predictionsWithData.reduce((acc, pred) => {
    const withActual = pred.predictions.filter(p => p.actualRate !== undefined)
    
    if (withActual.length === 0) return acc

    const totalError = withActual.reduce((sum, p) => {
      const error = Math.abs(p.predicted - (p.actualRate || 0)) / (p.actualRate || 1)
      return sum + error
    }, 0)

    const accuracy = (1 - (totalError / withActual.length)) * 100
    const finalAccuracy = Math.max(0, Math.min(100, accuracy))

    if (!acc[pred.currency]) {
      acc[pred.currency] = { count: 0, totalAccuracy: 0, accuracies: [] }
    }
    
    acc[pred.currency].count++
    acc[pred.currency].totalAccuracy += finalAccuracy
    acc[pred.currency].accuracies.push(finalAccuracy)
    
    return acc
  }, {} as Record<string, { count: number; totalAccuracy: number; accuracies: number[] }>)

  const currencyStats = Object.entries(currencyAccuracy).map(([currency, stats]) => ({
    currency,
    avgAccuracy: stats.totalAccuracy / stats.count,
    predictions: stats.count,
    bestAccuracy: Math.max(...stats.accuracies),
    worstAccuracy: Math.min(...stats.accuracies),
    consistency: 100 - (Math.max(...stats.accuracies) - Math.min(...stats.accuracies)),
  })).sort((a, b) => b.avgAccuracy - a.avgAccuracy)

  const overallAccuracy = accuracyOverTime.reduce((sum, item) => sum + (item?.accuracy || 0), 0) / accuracyOverTime.length

  const trendAccuracy = predictionsWithData.reduce((acc, pred) => {
    const withActual = pred.predictions.filter(p => p.actualRate !== undefined)
    
    if (withActual.length === 0) return acc

    const totalError = withActual.reduce((sum, p) => {
      const error = Math.abs(p.predicted - (p.actualRate || 0)) / (p.actualRate || 1)
      return sum + error
    }, 0)

    const accuracy = (1 - (totalError / withActual.length)) * 100
    const finalAccuracy = Math.max(0, Math.min(100, accuracy))

    if (!acc[pred.overallTrend]) {
      acc[pred.overallTrend] = { count: 0, totalAccuracy: 0 }
    }
    
    acc[pred.overallTrend].count++
    acc[pred.overallTrend].totalAccuracy += finalAccuracy
    
    return acc
  }, {} as Record<string, { count: number; totalAccuracy: number }>)

  const trendStats = Object.entries(trendAccuracy).map(([trend, stats]) => ({
    trend,
    avgAccuracy: stats.totalAccuracy / stats.count,
    predictions: stats.count,
  })).sort((a, b) => b.avgAccuracy - a.avgAccuracy)

  const recentTrend = accuracyOverTime.length >= 3
    ? accuracyOverTime.slice(-3).reduce((sum, item) => sum + (item?.accuracy || 0), 0) / 3
    : null

  const isImproving = recentTrend && accuracyOverTime.length >= 6
    ? recentTrend > (accuracyOverTime.slice(0, 3).reduce((sum, item) => sum + (item?.accuracy || 0), 0) / 3)
    : null

  return {
    accuracyOverTime,
    currencyStats,
    overallAccuracy,
    trendStats,
    totalPredictions: predictionsWithData.length,
    totalDataPoints: predictionsWithData.reduce((sum, pred) => 
      sum + pred.predictions.filter(p => p.actualRate !== undefined).length, 0
    ),
    recentTrend,
    isImproving,
  }
}
