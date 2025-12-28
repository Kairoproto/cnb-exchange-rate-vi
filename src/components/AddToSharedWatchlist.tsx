import { useState, useEffect } from 'react'
import { useSharedWatchlists, type SharedWatchlist } from '@/hooks/use-shared-watchlists'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserPlus, Check, Plus } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'

interface AddToSharedWatchlistProps {
  currencyCode: string
}

export function AddToSharedWatchlist({ currencyCode }: AddToSharedWatchlistProps) {
  const { watchlists, addCurrencyToWatchlist, removeCurrencyFromWatchlist, getUserWatchlists } = useSharedWatchlists()
  const [userWatchlists, setUserWatchlists] = useState<SharedWatchlist[]>([])
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

  const editableWatchlists = userWatchlists.filter(w => {
    const member = w.members.find(m => m.id === currentUserId)
    return member && member.role !== 'viewer'
  })

  if (editableWatchlists.length === 0) {
    return null
  }

  const handleToggle = (watchlistId: string, isInList: boolean) => {
    if (isInList) {
      removeCurrencyFromWatchlist(watchlistId, currencyCode)
    } else {
      addCurrencyToWatchlist(watchlistId, currencyCode)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <UserPlus size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Add to Watchlist</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {editableWatchlists.map(watchlist => {
          const isInList = watchlist.currencies.includes(currencyCode)
          
          return (
            <DropdownMenuItem
              key={watchlist.id}
              onClick={() => handleToggle(watchlist.id, isInList)}
              className="flex items-center justify-between"
            >
              <span className="flex-1 truncate">{watchlist.name}</span>
              {isInList ? (
                <Check size={16} weight="bold" className="text-accent ml-2 shrink-0" />
              ) : (
                <Plus size={16} className="text-muted-foreground ml-2 shrink-0" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
