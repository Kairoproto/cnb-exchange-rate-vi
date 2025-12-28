import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, CalendarDots, Trash, PencilSimple, Check, X, FloppyDisk, Star } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface CustomTemplate {
  id: string
  name: string
  description: string
  dates: string[]
  createdAt: string
  isFavorite?: boolean
}

interface CustomTemplateBuilderProps {
  onApplyTemplate: (dates: string[]) => void
  isLoading?: boolean
}

export function CustomTemplateBuilder({ onApplyTemplate, isLoading }: CustomTemplateBuilderProps) {
  const [customTemplates, setCustomTemplates] = useKV<CustomTemplate[]>('custom-comparison-templates', [])
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleAddDate = (date: Date | undefined) => {
    if (!date) return
    
    const dateStr = format(date, 'yyyy-MM-dd')
    const dateObj = new Date(dateStr)
    
    const isDuplicate = selectedDates.some(
      d => format(d, 'yyyy-MM-dd') === dateStr
    )
    
    if (isDuplicate) {
      toast.error('This date is already added')
      return
    }
    
    setSelectedDates((current) => [...current, dateObj].sort((a, b) => b.getTime() - a.getTime()))
    toast.success('Date added to template')
  }

  const handleRemoveDate = (index: number) => {
    setSelectedDates((current) => current.filter((_, i) => i !== index))
    toast.success('Date removed from template')
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name')
      return
    }
    
    if (selectedDates.length === 0) {
      toast.error('Please select at least one date')
      return
    }

    const dateStrings = selectedDates.map(d => format(d, 'yyyy-MM-dd'))

    if (isEditMode && editingTemplateId) {
      setCustomTemplates((current) =>
        (current || []).map(template =>
          template.id === editingTemplateId
            ? {
                ...template,
                name: templateName.trim(),
                description: templateDescription.trim(),
                dates: dateStrings
              }
            : template
        )
      )
      toast.success('Template updated successfully')
    } else {
      const newTemplate: CustomTemplate = {
        id: `custom-${Date.now()}`,
        name: templateName.trim(),
        description: templateDescription.trim(),
        dates: dateStrings,
        createdAt: new Date().toISOString(),
        isFavorite: false
      }

      setCustomTemplates((current) => [...(current || []), newTemplate])
      toast.success('Template saved successfully')
    }

    handleCloseBuilder()
  }

  const handleEditTemplate = (template: CustomTemplate) => {
    setIsEditMode(true)
    setEditingTemplateId(template.id)
    setTemplateName(template.name)
    setTemplateDescription(template.description)
    setSelectedDates(template.dates.map(d => new Date(d)))
    setIsBuilderOpen(true)
  }

  const handleDeleteTemplate = (id: string) => {
    setCustomTemplates((current) => (current || []).filter(t => t.id !== id))
    setDeleteConfirmId(null)
    toast.success('Template deleted successfully')
  }

  const handleToggleFavorite = (id: string) => {
    setCustomTemplates((current) =>
      (current || []).map(template =>
        template.id === id
          ? { ...template, isFavorite: !template.isFavorite }
          : template
      )
    )
  }

  const handleCloseBuilder = () => {
    setIsBuilderOpen(false)
    setIsEditMode(false)
    setEditingTemplateId(null)
    setTemplateName('')
    setTemplateDescription('')
    setSelectedDates([])
  }

  const sortedTemplates = [...(customTemplates || [])].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Custom Templates</CardTitle>
            <CardDescription className="text-base">
              Create and save your own personalized comparison periods
            </CardDescription>
          </div>
          <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 shrink-0">
                <Plus size={20} weight="bold" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {isEditMode ? 'Edit Template' : 'Create Custom Template'}
                </DialogTitle>
                <DialogDescription>
                  Build a custom comparison template by selecting specific dates
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name" className="text-base font-semibold">
                    Template Name *
                  </Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., Q1 Review, Year End Comparison"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-description" className="text-base font-semibold">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="template-description"
                    placeholder="Describe what this template is used for..."
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    className="text-base min-h-20"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Select Dates * ({selectedDates.length} selected)
                  </Label>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2 text-base h-11">
                        <CalendarDots size={20} weight="duotone" />
                        Add Date to Template
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        onSelect={handleAddDate}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {selectedDates.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        Selected Dates (sorted newest to oldest):
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                        {selectedDates.map((date, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2.5 bg-background rounded-md border"
                          >
                            <div className="flex items-center gap-2">
                              <CalendarDots size={18} weight="duotone" className="text-primary" />
                              <span className="font-mono text-sm font-medium">
                                {format(date, 'yyyy-MM-dd')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({format(date, 'EEEE, MMMM d, yyyy')})
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDate(index)}
                              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X size={16} weight="bold" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDates.length === 0 && (
                    <div className="p-6 border-2 border-dashed rounded-lg text-center">
                      <CalendarDots size={32} weight="duotone" className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No dates selected yet. Click "Add Date to Template" to begin.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleCloseBuilder}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} className="gap-2">
                  <FloppyDisk size={18} weight="bold" />
                  {isEditMode ? 'Update Template' : 'Save Template'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {sortedTemplates.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Plus size={48} weight="duotone" className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Custom Templates Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Create your first custom template to save frequently used comparison periods
            </p>
            <Button onClick={() => setIsBuilderOpen(true)} className="gap-2">
              <Plus size={18} weight="bold" />
              Create Your First Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTemplates.map((template) => (
              <div
                key={template.id}
                className="group relative flex flex-col gap-3 p-5 rounded-lg border-2 transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(template.id)}
                      className={cn(
                        "p-1.5 h-auto shrink-0",
                        template.isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Star size={20} weight={template.isFavorite ? "fill" : "regular"} />
                    </Button>
                    <h3 className="font-semibold text-base text-foreground truncate">
                      {template.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      className="p-1.5 h-auto text-muted-foreground hover:text-primary"
                    >
                      <PencilSimple size={18} weight="bold" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(template.id)}
                      className="p-1.5 h-auto text-muted-foreground hover:text-destructive"
                    >
                      <Trash size={18} weight="bold" />
                    </Button>
                  </div>
                </div>

                {template.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {template.description}
                  </p>
                )}

                <div className="pt-2 border-t space-y-2">
                  <div className="text-xs text-muted-foreground font-mono">
                    {template.dates.length} date{template.dates.length !== 1 ? 's' : ''}
                  </div>
                  <Button
                    onClick={() => onApplyTemplate(template.dates)}
                    disabled={isLoading}
                    className="w-full gap-2"
                    size="sm"
                  >
                    <Check size={16} weight="bold" />
                    Apply Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteTemplate(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
