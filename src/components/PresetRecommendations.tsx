import { useState } from 'react'
import { usePresetRecommendations, PresetRecommendation } from '@/hooks/use-preset-recommendations'
import { useFilterPresets } from '@/hooks/use-filter-presets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sparkle,
  Clock,
  TrendUp,
  Brain,
  Check,
  ArrowsClockwise,
  Star,
  Plus,
  Lightbulb,
  Target,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PresetRecommendationsProps {
  onApplyPreset: (filters: any) => void
  currentFilters?: any
}

export function PresetRecommendations({
  onApplyPreset,
  currentFilters,
}: PresetRecommendationsProps) {
  const {
    recommendations,
    usageRecommendations,
    timeRecommendations,
    aiRecommendations,
    isGenerating,
    getSimilarRecommendations,
    refreshRecommendations,
  } = usePresetRecommendations()

  const { createPreset } = useFilterPresets()
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<PresetRecommendation | null>(null)
  const [presetName, setPresetName] = useState('')
  const [presetDescription, setPresetDescription] = useState('')

  const similarRecommendations = currentFilters ? getSimilarRecommendations(currentFilters) : []

  const handleApplyRecommendation = (recommendation: PresetRecommendation) => {
    if (recommendation.preset) {
      onApplyPreset(recommendation.preset.filters)
      toast.success(`Applied preset: ${recommendation.preset.name}`)
    } else if (recommendation.suggestedFilters) {
      onApplyPreset(recommendation.suggestedFilters)
      toast.success('Applied recommended filters')
    }
  }

  const handleSaveRecommendationAsPreset = (recommendation: PresetRecommendation) => {
    setSelectedRecommendation(recommendation)
    setPresetName(recommendation.suggestedName || '')
    setPresetDescription(recommendation.suggestedDescription || recommendation.reason || '')
    setIsCreateDialogOpen(true)
  }

  const handleSavePreset = () => {
    if (!selectedRecommendation) return
    
    if (!presetName.trim()) {
      toast.error('Please enter a preset name')
      return
    }

    const filters = selectedRecommendation.preset?.filters || selectedRecommendation.suggestedFilters || {}
    createPreset(
      presetName,
      filters,
      presetDescription,
      selectedRecommendation.category
    )

    toast.success(`Preset "${presetName}" saved successfully`)
    setIsCreateDialogOpen(false)
    setPresetName('')
    setPresetDescription('')
    setSelectedRecommendation(null)
  }

  const getRecommendationIcon = (type: PresetRecommendation['type']) => {
    switch (type) {
      case 'ai':
        return <Brain size={20} weight="duotone" className="text-primary" />
      case 'usage':
        return <TrendUp size={20} weight="duotone" className="text-accent" />
      case 'time':
        return <Clock size={20} weight="duotone" className="text-orange-500" />
      case 'similar':
        return <Target size={20} weight="duotone" className="text-blue-500" />
      default:
        return <Lightbulb size={20} weight="duotone" className="text-yellow-500" />
    }
  }

  const getRecommendationTypeLabel = (type: PresetRecommendation['type']) => {
    switch (type) {
      case 'ai':
        return 'AI Powered'
      case 'usage':
        return 'Based on Usage'
      case 'time':
        return 'Time-Based'
      case 'similar':
        return 'Similar Filters'
      default:
        return 'Recommended'
    }
  }

  const allRecommendations = [...recommendations, ...similarRecommendations]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkle size={24} weight="duotone" className="text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Smart Recommendations</CardTitle>
                <CardDescription>
                  AI-powered preset suggestions based on your usage patterns
                </CardDescription>
              </div>
            </div>

            <Button
              onClick={refreshRecommendations}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ArrowsClockwise
                size={16}
                weight="bold"
                className={cn(isGenerating && 'animate-spin')}
              />
              {isGenerating ? 'Generating...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {allRecommendations.length === 0 ? (
            <div className="text-center py-12">
              <Sparkle size={48} weight="duotone" className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Start using filter presets to get personalized recommendations based on your patterns
              </p>
              <Button onClick={refreshRecommendations} disabled={isGenerating} className="gap-2">
                <Brain size={18} weight="bold" />
                Generate AI Recommendations
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkle size={16} weight="fill" className="text-primary" />
                <span>
                  {usageRecommendations.length} usage-based • {timeRecommendations.length} time-based
                  {aiRecommendations.length > 0 && ` • ${aiRecommendations.length} AI-powered`}
                </span>
              </div>

              <Separator />

              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {allRecommendations.map((recommendation) => (
                    <div
                      key={recommendation.id}
                      className="group p-4 border rounded-lg hover:border-primary/50 hover:bg-accent/30 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getRecommendationIcon(recommendation.type)}</div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-base">
                                  {recommendation.preset?.name || recommendation.suggestedName || 'Recommended Preset'}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  {getRecommendationTypeLabel(recommendation.type)}
                                </Badge>
                                {recommendation.score >= 8 && (
                                  <Badge variant="default" className="text-xs gap-1">
                                    <Star size={12} weight="fill" />
                                    Top Pick
                                  </Badge>
                                )}
                              </div>
                              {(recommendation.preset?.description || recommendation.suggestedDescription) && (
                                <p className="text-sm text-muted-foreground">
                                  {recommendation.preset?.description || recommendation.suggestedDescription}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Lightbulb size={14} className="text-muted-foreground" />
                            <p className="text-sm text-muted-foreground italic">{recommendation.reason}</p>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              onClick={() => handleApplyRecommendation(recommendation)}
                              className="gap-2"
                            >
                              <Check size={16} weight="bold" />
                              Apply Now
                            </Button>

                            {!recommendation.preset && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveRecommendationAsPreset(recommendation)}
                                className="gap-2"
                              >
                                <Plus size={16} weight="bold" />
                                Save as Preset
                              </Button>
                            )}

                            {recommendation.preset && (
                              <Badge variant="outline" className="gap-1 text-xs">
                                Used {recommendation.preset.useCount}x
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Recommended Preset</DialogTitle>
            <DialogDescription>
              Save this recommendation as a reusable preset
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rec-preset-name">Preset Name *</Label>
              <Input
                id="rec-preset-name"
                placeholder="e.g., Morning Currency Check"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rec-preset-description">Description (Optional)</Label>
              <Textarea
                id="rec-preset-description"
                placeholder="Describe what this preset filters for..."
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset} className="gap-2">
              <Plus size={18} weight="bold" />
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
