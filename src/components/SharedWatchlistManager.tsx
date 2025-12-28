import { useState, useEffect, createElement } from 'react'
import { useSharedWatchlists, type SharedWatchlist } from '@/hooks/use-shared-watchlists'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, Crown, PencilSimple, Eye, Globe, Lock, Trash, SignOut, Calendar, Clock } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface WatchlistCardProps {
  watchlist: SharedWatchlist
  currentUserId: string
  onSelect: (watchlist: SharedWatchlist) => void
  isSelected: boolean
}

export function WatchlistCard({ watchlist, currentUserId, onSelect, isSelected }: WatchlistCardProps) {
  const { deleteWatchlist, leaveWatchlist } = useSharedWatchlists()
  const [showConfirm, setShowConfirm] = useState(false)
  
  const isOwner = watchlist.ownerId === currentUserId
  const currentMember = watchlist.members.find(m => m.id === currentUserId)
  const roleIcon = currentMember?.role === 'owner' ? Crown : currentMember?.role === 'editor' ? PencilSimple : Eye
  
  const handleDelete = () => {
    deleteWatchlist(watchlist.id)
    setShowConfirm(false)
  }
  
  const handleLeave = () => {
    leaveWatchlist(watchlist.id)
  }

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 mb-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="truncate">{watchlist.name}</span>
                <Badge variant={watchlist.isPublic ? 'default' : 'secondary'} className="shrink-0">
                  {watchlist.isPublic ? (
                    <><Globe size={12} className="mr-1" /> Public</>
                  ) : (
                    <><Lock size={12} className="mr-1" /> Private</>
                  )}
                </Badge>
              </div>
            </CardTitle>
            {watchlist.description && (
              <CardDescription className="line-clamp-2">
                {watchlist.description}
              </CardDescription>
            )}
          </div>
          <Badge variant="outline" className="shrink-0">
            {createElement(roleIcon, { size: 14, weight: "fill", className: "mr-1" })}
            {currentMember?.role}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{watchlist.members.length} member{watchlist.members.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{watchlist.currencies.length} {watchlist.currencies.length === 1 ? 'currency' : 'currencies'}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {watchlist.currencies.slice(0, 10).map(code => (
            <Badge key={code} variant="secondary" className="text-xs font-mono">
              {code}
            </Badge>
          ))}
          {watchlist.currencies.length > 10 && (
            <Badge variant="secondary" className="text-xs">
              +{watchlist.currencies.length - 10} more
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={14} />
          Updated {formatDistanceToNow(new Date(watchlist.updatedAt), { addSuffix: true })}
        </div>
        
        <Separator />
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(watchlist)}
            className="flex-1"
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
          
          {!showConfirm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(true)}
            >
              {isOwner ? (
                <><Trash size={16} /></>
              ) : (
                <><SignOut size={16} /></>
              )}
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="destructive"
                size="sm"
                onClick={isOwner ? handleDelete : handleLeave}
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface SharedWatchlistManagerProps {
  onWatchlistSelect: (currencies: string[]) => void
}

export function SharedWatchlistManager({ onWatchlistSelect }: SharedWatchlistManagerProps) {
  const { watchlists, getUserWatchlists } = useSharedWatchlists()
  const [userWatchlists, setUserWatchlists] = useState<SharedWatchlist[]>([])
  const [selectedWatchlist, setSelectedWatchlist] = useState<SharedWatchlist | null>(null)
  const [currentUserId, setCurrentUserId] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const user = await window.spark.user()
      if (user) {
        setCurrentUserId(String(user.id))
        const userLists = await getUserWatchlists()
        setUserWatchlists(userLists)
      }
    }
    loadData()
  }, [watchlists])

  const handleSelectWatchlist = (watchlist: SharedWatchlist) => {
    if (selectedWatchlist?.id === watchlist.id) {
      setSelectedWatchlist(null)
      onWatchlistSelect([])
    } else {
      setSelectedWatchlist(watchlist)
      onWatchlistSelect(watchlist.currencies)
    }
  }

  if (userWatchlists.length === 0) {
    return (
      <Alert>
        <Users size={20} weight="duotone" />
        <AlertDescription>
          No shared watchlists yet. Create one to start collaborating with your team on currency tracking.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {userWatchlists.map(watchlist => (
        <WatchlistCard
          key={watchlist.id}
          watchlist={watchlist}
          currentUserId={currentUserId}
          onSelect={handleSelectWatchlist}
          isSelected={selectedWatchlist?.id === watchlist.id}
        />
      ))}
    </div>
  )
}
