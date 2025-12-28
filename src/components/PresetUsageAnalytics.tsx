import { useState } from 'react'
import { usePresetAnalytics } from '@/hooks/use-preset-analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  ChartLine,
  TrendUp,
  Star,
  Tag,
  Clock,
  ChartBar,
  CalendarBlank,
  Trash,
  Trophy,
  Pulse,
} from '@phosphor-icons/react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = [
  'oklch(0.55 0.18 160)',
  'oklch(0.35 0.12 250)',
  'oklch(0.646 0.222 41.116)',
  'oklch(0.6 0.118 184.704)',
  'oklch(0.398 0.07 227.392)',
  'oklch(0.828 0.189 84.429)',
  'oklch(0.769 0.188 70.08)',
]

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'search':
      return '🔍'
    case 'rate':
      return '💱'
    case 'comparison':
      return '📊'
    default:
      return '⚙️'
  }
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'search':
      return 'Search'
    case 'rate':
      return 'Rate'
    case 'comparison':
      return 'Comparison'
    default:
      return 'Custom'
  }
}

export function PresetUsageAnalytics() {
  const { analytics, clearHistory, usageHistory } = usePresetAnalytics()
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day')

  const handleClearHistory = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all usage history? This action cannot be undone.'
      )
    ) {
      clearHistory()
      toast.success('Usage history cleared')
    }
  }

  const getTimeRangeData = () => {
    switch (timeRange) {
      case 'week':
        return analytics.usageByWeek.map((item) => ({
          name: new Date(item.weekStart).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          uses: item.count,
        }))
      case 'month':
        return analytics.usageByMonth.map((item) => ({
          name: new Date(item.month + '-01').toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
          uses: item.count,
        }))
      default:
        return analytics.usageByDay.map((item) => ({
          name: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          uses: item.count,
        }))
    }
  }

  const pieChartData = analytics.categoryBreakdown.map((item) => ({
    name: getCategoryLabel(item.category),
    value: item.count,
  }))

  if (usageHistory.length === 0) {
    return (
      <Alert>
        <Pulse size={20} weight="duotone" />
        <AlertTitle>No Usage Data Yet</AlertTitle>
        <AlertDescription>
          Start using presets to see analytics about your most frequently used filters and usage
          patterns over time.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <ChartBar size={24} weight="duotone" className="text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">Usage Analytics</CardTitle>
                <CardDescription>
                  Track your preset usage patterns and trends over time
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearHistory} className="gap-2">
              <Trash size={16} />
              Clear History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Star size={16} weight="fill" className="text-accent" />
                  Total Uses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.totalUses}</div>
                <p className="text-xs text-muted-foreground mt-1">Preset applications</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Tag size={16} weight="fill" className="text-primary" />
                  Unique Presets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.uniquePresetsUsed}</div>
                <p className="text-xs text-muted-foreground mt-1">Different presets used</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Trophy size={16} weight="fill" className="text-amber-500" />
                  Most Used
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.mostUsedPreset ? (
                  <>
                    <div className="text-lg font-semibold truncate">
                      {analytics.mostUsedPreset.name}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analytics.mostUsedPreset.count} uses
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">No data</div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Usage Over Time</CardTitle>
              <CardDescription>See how your preset usage changes over time</CardDescription>
            </div>
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <TabsList>
                <TabsTrigger value="day">Daily</TabsTrigger>
                <TabsTrigger value="week">Weekly</TabsTrigger>
                <TabsTrigger value="month">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getTimeRangeData()}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="name"
                fontSize={12}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.99 0 0)',
                  border: '1px solid oklch(0.88 0.01 250)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="uses"
                stroke="oklch(0.35 0.12 250)"
                strokeWidth={2}
                dot={{ fill: 'oklch(0.35 0.12 250)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag size={20} weight="duotone" />
              Usage by Category
            </CardTitle>
            <CardDescription>Distribution of preset usage across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.99 0 0)',
                      border: '1px solid oklch(0.88 0.01 250)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No category data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy size={20} weight="duotone" />
              Top 10 Presets
            </CardTitle>
            <CardDescription>Your most frequently used presets</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topPresets.length > 0 ? (
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-3">
                  {analytics.topPresets.map((preset, index) => (
                    <div key={preset.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge
                            variant={index === 0 ? 'default' : 'secondary'}
                            className="shrink-0"
                          >
                            #{index + 1}
                          </Badge>
                          <span className="text-xs">{getCategoryIcon(preset.category)}</span>
                          <span className="text-sm font-medium truncate">{preset.name}</span>
                        </div>
                        <div className="text-sm font-semibold text-muted-foreground shrink-0 ml-2">
                          {preset.count}
                        </div>
                      </div>
                      <Progress value={preset.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No preset data</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock size={20} weight="duotone" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest preset applications</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {analytics.recentActivity.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Pulse size={16} weight="duotone" className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getCategoryIcon(event.category)}</span>
                      <span className="text-sm font-medium truncate">{event.presetName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                      {event.category && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(event.category)}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
