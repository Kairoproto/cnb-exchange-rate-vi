import { useState } from 'react'
import { useFilterPresets } from '@/hooks/use-filter-presets'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { FolderOpen, Check, Star, Gear } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface QuickFilterPresetSelectorProps {
  currentFilters: any
  onApplyPreset: (filters: any) => void
  onOpenManager?: () => void
  filterType?: 'search' | 'rate' | 'comparison' | 'custom'
}

export function QuickFilterPresetSelector({
  currentFilters,
  onApplyPreset,
  onOpenManager,
  filterType = 'custom',
}: QuickFilterPresetSelectorProps) {
  const { presets, incrementUseCount } = useFilterPresets()
  const [open, setOpen] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)

  const relevantPresets = presets
    .filter((preset) => !filterType || preset.category === filterType || filterType === 'custom')
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, 10)

  const handleSelectPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId)
    if (preset) {
      onApplyPreset(preset.filters)
      incrementUseCount(preset.id)
      setSelectedPresetId(presetId)
    }
    setOpen(false)
  }

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

  if (presets.length === 0) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FolderOpen size={16} weight="duotone" />
          Load Preset
          {relevantPresets.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {relevantPresets.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search presets..." />
          <CommandList>
            <CommandEmpty>No presets found.</CommandEmpty>
            {relevantPresets.length > 0 && (
              <CommandGroup heading="Quick Access">
                {relevantPresets.map((preset) => (
                  <CommandItem
                    key={preset.id}
                    onSelect={() => handleSelectPreset(preset.id)}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-base">{getCategoryIcon(preset.category)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{preset.name}</div>
                        {preset.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {preset.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {preset.useCount > 0 && (
                        <Badge variant="secondary" className="gap-1 text-xs h-5">
                          <Star size={10} weight="fill" />
                          {preset.useCount}
                        </Badge>
                      )}
                      {selectedPresetId === preset.id && (
                        <Check size={16} weight="bold" className="text-primary" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {onOpenManager && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onOpenManager()
                      setOpen(false)
                    }}
                    className="justify-center text-primary"
                  >
                    <Gear size={16} weight="duotone" className="mr-2" />
                    Manage All Presets
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
