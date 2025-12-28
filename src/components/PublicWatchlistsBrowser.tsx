import { useState } from 'react'
import { useSharedWatchlists } from '@/hooks/use-shared-watchlists'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Globe, Users, Calendar, SignIn } from '@phosphor-icons/react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function PublicWatchlistsBrowser() {
  const { watchlists, joinPublicWatchlist, getUserWatchlists } = useSharedWatchlists()
  const [joinedWatchlists, setJoinedWatchlists] = useState<string[]>([])
  
  const publicWatchlists = watchlists.filter(w => w.isPublic)

  const handleJoin = async (watchlistId: string) => {
    await joinPublicWatchlist(watchlistId)
    const userLists = await getUserWatchlists()
    setJoinedWatchlists(userLists.map(w => w.id))
  }

  if (publicWatchlists.length === 0) {
    return (
      <Alert>
        <Globe size={20} weight="duotone" />
        <AlertDescription>
          No public watchlists available yet. Create a public watchlist to share with the community!
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe size={24} weight="duotone" />
          Browse Public Watchlists
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicWatchlists.map(watchlist => {
              const isJoined = joinedWatchlists.includes(watchlist.id)
              
              return (
                <div
                  key={watchlist.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold">{watchlist.name}</h4>
                      <Badge variant="outline">
                        <Globe size={12} className="mr-1" />
                        Public
                      </Badge>
                    </div>
                    {watchlist.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {watchlist.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={watchlist.ownerAvatar} alt={watchlist.ownerLogin} />
                      <AvatarFallback>
                        {watchlist.ownerLogin.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-xs text-muted-foreground">
                      by @{watchlist.ownerLogin}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {watchlist.members.length} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {watchlist.currencies.length} currencies
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {watchlist.currencies.slice(0, 5).map(code => (
                      <Badge key={code} variant="secondary" className="text-xs font-mono">
                        {code}
                      </Badge>
                    ))}
                    {watchlist.currencies.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{watchlist.currencies.length - 5}
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant={isJoined ? 'outline' : 'default'}
                    className="w-full gap-2"
                    onClick={() => handleJoin(watchlist.id)}
                    disabled={isJoined}
                  >
                    {isJoined ? (
                      <>Joined</>
                    ) : (
                      <><SignIn size={16} weight="bold" /> Join Watchlist</>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
