import { useState, useEffect } from 'react'
import { useSharedWatchlists } from '@/hooks/use-shared-watchlists'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Check, X, Users, Clock } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function WatchlistInvites() {
  const { invites, acceptInvite, declineInvite, getPendingInvites } = useSharedWatchlists()
  const [pendingInvites, setPendingInvites] = useState<typeof invites>([])

  useEffect(() => {
    const loadInvites = async () => {
      const pending = await getPendingInvites()
      setPendingInvites(pending)
    }
    loadInvites()
  }, [invites])

  if (pendingInvites.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={24} weight="duotone" />
          Watchlist Invitations
          <Badge variant="destructive" className="ml-auto">
            {pendingInvites.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-3">
            {pendingInvites.map(invite => (
              <div
                key={invite.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={invite.fromUserAvatar} alt={invite.fromUserLogin} />
                  <AvatarFallback>
                    {invite.fromUserLogin.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    <span className="font-semibold">@{invite.fromUserLogin}</span> invited you to join
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {invite.watchlistName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                  </p>
                </div>
                
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => acceptInvite(invite.id)}
                  >
                    <Check size={16} weight="bold" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => declineInvite(invite.id)}
                  >
                    <X size={16} weight="bold" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
