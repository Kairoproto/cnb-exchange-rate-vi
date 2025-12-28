import { useState } from 'react'
import { useFilterPresets, FilterPreset } from '@/hooks/use-filter-presets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FloppyDisk,
  FolderOpen,
  DotsThree,
  Pencil,
  Trash,
  Copy,
  Check,
  Star,
  Clock,
  Tag,
  Plus,
} from '@phosphor-icons/react'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface FilterPresetManagerProps {
  currentFilters: any
  onApplyPreset: (filters: any) => void
  filterType?: 'search' | 'rate' | 'comparison' | 'custom'
}

export function FilterPresetManager({
  currentFilters,
  onApplyPreset,
  filterType = 'custom',
}: FilterPresetManagerProps) {
  const {
    presets,
    createPreset,
    updatePreset,
    deletePreset,
    incrementUseCount,
    duplicatePreset,
    getPresetsByCategory,
  } = useFilterPresets()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<FilterPreset | null>(null)
  const [presetName, setPresetName] = useState('')
  const [presetDescription, setPresetDescription] = useState('')
  const [presetCategory, setPresetCategory] = useState<FilterPreset['category']>(filterType)
  const [filterCategory, setFilterCategory] = useState<FilterPreset['category'] | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'usage'>('date')

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name')
      return
    }

    createPreset(presetName, currentFilters, presetDescription, presetCategory)
    toast.success(`Preset "${presetName}" saved successfully`)
    
    setPresetName('')
    setPresetDescription('')
    setPresetCategory(filterType)
    setIsCreateDialogOpen(false)
  }

  const handleUpdatePreset = () => {
    if (!editingPreset) return
    
    if (!presetName.trim()) {
      toast.error('Please enter a preset name')
      return
    }

    updatePreset(editingPreset.id, {
      name: presetName,
      description: presetDescription,
      category: presetCategory,
    })
    
    toast.success(`Preset "${presetName}" updated successfully`)
    
    setEditingPreset(null)
    setPresetName('')
    setPresetDescription('')
    setIsEditDialogOpen(false)
  }

  const handleApplyPreset = (preset: FilterPreset) => {
    onApplyPreset(preset.filters)
    incrementUseCount(preset.id)
    toast.success(`Applied preset: ${preset.name}`)
  }

  const handleDeletePreset = (preset: FilterPreset) => {
    deletePreset(preset.id)
    toast.success(`Deleted preset: ${preset.name}`)
  }

  const handleDuplicatePreset = (preset: FilterPreset) => {
    const duplicated = duplicatePreset(preset.id)
    if (duplicated) {
      toast.success(`Duplicated preset: ${duplicated.name}`)
    }
  }

  const handleEditPreset = (preset: FilterPreset) => {
    setEditingPreset(preset)
    setPresetName(preset.name)
    setPresetDescription(preset.description || '')
    setPresetCategory(preset.category || 'custom')
    setIsEditDialogOpen(true)
  }

  const filteredPresets =
    filterCategory === 'all'
      ? presets
      : getPresetsByCategory(filterCategory)

  const sortedPresets = [...filteredPresets].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'date':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'usage':
        return b.useCount - a.useCount
      default:
        return 0
    }
  })

  const getCategoryIcon = (category?: FilterPreset['category']) => {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Filter Presets</CardTitle>
              <CardDescription>
                Save and reuse your favorite filter configurations
              </CardDescription>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} weight="bold" />
                Save Current
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Filter Preset</DialogTitle>
                <DialogDescription>
                  Create a new preset from your current filter configuration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="preset-name">Preset Name *</Label>
                  <Input
                    id="preset-name"
                    placeholder="e.g., High Value Currencies"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preset-description">Description (Optional)</Label>
                  <Textarea
                    id="preset-description"
                    placeholder="Describe what this preset filters for..."
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preset-category">Category</Label>
                  <Select
                    value={presetCategory}
                    onValueChange={(value) => setPresetCategory(value as FilterPreset['category'])}
                  >
                    <SelectTrigger id="preset-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search">🔍 Search</SelectItem>
                      <SelectItem value="rate">💱 Rate</SelectItem>
                      <SelectItem value="comparison">📊 Comparison</SelectItem>
                      <SelectItem value="custom">⚙️ Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePreset} className="gap-2">
                  <FloppyDisk size={18} weight="bold" />
                  Save Preset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select
            value={filterCategory}
            onValueChange={(value) => setFilterCategory(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="search">🔍 Search</SelectItem>
              <SelectItem value="rate">💱 Rate</SelectItem>
              <SelectItem value="comparison">📊 Comparison</SelectItem>
              <SelectItem value="custom">⚙️ Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Recently Updated</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="usage">Most Used</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto text-sm text-muted-foreground">
            {sortedPresets.length} preset{sortedPresets.length !== 1 ? 's' : ''}
          </div>
        </div>

        <Separator />

        {sortedPresets.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen size={48} weight="duotone" className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Presets Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {filterCategory === 'all'
                ? 'Save your current filter configuration to quickly reuse it later'
                : `No presets found in the "${filterCategory}" category`}
            </p>
            {filterCategory !== 'all' && (
              <Button variant="outline" onClick={() => setFilterCategory('all')}>
                View All Presets
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {sortedPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="group p-4 border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(preset.category)}</span>
                        <h4 className="font-semibold text-base">{preset.name}</h4>
                        {preset.useCount > 0 && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Star size={12} weight="fill" />
                            {preset.useCount}
                          </Badge>
                        )}
                      </div>
                      {preset.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {preset.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(preset.updatedAt)}
                        </span>
                        {preset.category && (
                          <span className="flex items-center gap-1">
                            <Tag size={12} />
                            {preset.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleApplyPreset(preset)}
                        className="gap-2"
                      >
                        <Check size={16} weight="bold" />
                        Apply
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0"
                          >
                            <DotsThree size={20} weight="bold" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPreset(preset)}>
                            <Pencil size={16} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicatePreset(preset)}>
                            <Copy size={16} className="mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeletePreset(preset)}
                            className="text-destructive"
                          >
                            <Trash size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Filter Preset</DialogTitle>
            <DialogDescription>
              Update the details of your saved preset
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-preset-name">Preset Name *</Label>
              <Input
                id="edit-preset-name"
                placeholder="e.g., High Value Currencies"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-preset-description">Description (Optional)</Label>
              <Textarea
                id="edit-preset-description"
                placeholder="Describe what this preset filters for..."
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-preset-category">Category</Label>
              <Select
                value={presetCategory}
                onValueChange={(value) => setPresetCategory(value as FilterPreset['category'])}
              >
                <SelectTrigger id="edit-preset-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="search">🔍 Search</SelectItem>
                  <SelectItem value="rate">💱 Rate</SelectItem>
                  <SelectItem value="comparison">📊 Comparison</SelectItem>
                  <SelectItem value="custom">⚙️ Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingPreset(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePreset} className="gap-2">
              <Check size={18} weight="bold" />
              Update Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
