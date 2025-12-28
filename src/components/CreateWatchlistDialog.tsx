import { useState } from 'react'
import { useSharedWatchlists } from '@/hooks/use-shared-watchlists'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Users, Globe, Lock } from '@phosphor-icons/react'

export function CreateWatchlistDialog() {
  const { createWatchlist } = useSharedWatchlists()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    
    setIsCreating(true)
    const result = await createWatchlist(name, description, isPublic)
    setIsCreating(false)
    
    if (result) {
      setOpen(false)
      setName('')
      setDescription('')
      setIsPublic(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus size={20} weight="bold" />
          Create Shared Watchlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={24} weight="duotone" />
            Create Shared Watchlist
          </DialogTitle>
          <DialogDescription>
            Create a collaborative watchlist to track currencies with your team
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="watchlist-name">Watchlist Name</Label>
            <Input
              id="watchlist-name"
              placeholder="e.g., European Currencies, Team Portfolio"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="watchlist-description">Description (Optional)</Label>
            <Textarea
              id="watchlist-description"
              placeholder="Describe the purpose of this watchlist..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                {isPublic ? (
                  <Globe size={20} weight="duotone" className="text-accent" />
                ) : (
                  <Lock size={20} weight="duotone" className="text-muted-foreground" />
                )}
                <Label htmlFor="public-toggle" className="cursor-pointer">
                  {isPublic ? 'Public' : 'Private'} Watchlist
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {isPublic
                  ? 'Anyone can discover and join this watchlist'
                  : 'Only invited members can access this watchlist'}
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || isCreating}>
            {isCreating ? 'Creating...' : 'Create Watchlist'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
