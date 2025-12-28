import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, Circle, Crown, PencilSimple, Eye as EyeIcon, Clock, Users, Cursor } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { SimulateActivity } from './SimulateActivity'
import type { SharedWatchlist, WatchlistMember } from '@/hooks/use-shared-watchlists'

interface WatchlistActivityPanelProps {
  watchlist: SharedWatchlist
  currentUserId: string
  activeCursorCount?: number
}

export function WatchlistActivityPanel({ watchlist, currentUserId, activeCursorCount = 0 }: WatchlistActivityPanelProps) {
  const [activeMembers, setActiveMembers] = useState<WatchlistMember[]>([])
  const [recentMembers, setRecentMembers] = useState<WatchlistMember[]>([])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const ACTIVE_THRESHOLD = 2 * 60 * 1000
    const RECENT_THRESHOLD = 30 * 60 * 1000
    
    const active: WatchlistMember[] = []
    const recent: WatchlistMember[] = []
    
    watchlist.members.forEach(member => {
      if (member.id === currentUserId) return
      if (!member.lastActive) return
      
      const lastActiveTime = new Date(member.lastActive).getTime()
      const timeSinceActive = now - lastActiveTime
      
      if (timeSinceActive < ACTIVE_THRESHOLD) {
        active.push(member)
      } else if (timeSinceActive < RECENT_THRESHOLD) {
        recent.push(member)
      }
    })
    
    active.sort((a, b) => {
      const aTime = a.lastActive ? new Date(a.lastActive).getTime() : 0
      const bTime = b.lastActive ? new Date(b.lastActive).getTime() : 0
      return bTime - aTime
    })
    
    recent.sort((a, b) => {
      const aTime = a.lastActive ? new Date(a.lastActive).getTime() : 0
      const bTime = b.lastActive ? new Date(b.lastActive).getTime() : 0
      return bTime - aTime
    })
    
    setActiveMembers(active)
    setRecentMembers(recent)
  }, [watchlist.members, currentUserId, now])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown
      case 'editor': return PencilSimple
      case 'viewer': return EyeIcon
      default: return EyeIcon
    }
  }

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
    switch (role) {
      case 'owner': return 'default'
      case 'editor': return 'secondary'
      case 'viewer': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <Card className="shadow-lg border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye size={24} weight="duotone" className="text-primary" />
          Activity Monitor
        </CardTitle>
        <CardDescription>
          Real-time collaboration status for "{watchlist.name}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SimulateActivity watchlistId={watchlist.id} />
        
        {activeCursorCount > 0 && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Cursor size={20} weight="duotone" className="text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  Live Cursor Tracking Active
                  <Circle size={10} weight="fill" className="text-accent animate-pulse" />
                </div>
                <div className="text-xs text-muted-foreground">
                  {activeCursorCount} team {activeCursorCount === 1 ? 'member' : 'members'} hovering in real-time
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeMembers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Circle size={12} weight="fill" className="text-accent animate-pulse" />
              <h3 className="font-semibold text-sm">Currently Viewing ({activeMembers.length})</h3>
            </div>
            <div className="space-y-2">
              {activeMembers.map((member) => {
                const RoleIcon = getRoleIcon(member.role)
                return (
                  <div 
                    key={member.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10 border-2 border-background">
                        <AvatarImage src={member.avatar} alt={member.login} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                          {member.login.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Circle 
                        size={14} 
                        weight="fill" 
                        className="absolute -bottom-0.5 -right-0.5 text-accent drop-shadow-lg animate-pulse"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">@{member.login}</span>
                        <Badge variant={getRoleBadgeVariant(member.role)} className="h-5 text-xs shrink-0">
                          <RoleIcon size={12} weight="fill" className="mr-1" />
                          {member.role}
                        </Badge>
                      </div>
                      {member.lastActive && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock size={12} />
                          <span>Active {formatDistanceToNow(new Date(member.lastActive), { addSuffix: true })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeMembers.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Eye size={32} weight="duotone" className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No other team members are currently viewing this watchlist</p>
          </div>
        )}

        {recentMembers.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-muted-foreground" />
                <h3 className="font-semibold text-sm text-muted-foreground">Recently Active ({recentMembers.length})</h3>
              </div>
              <div className="space-y-2">
                {recentMembers.map((member) => {
                  const RoleIcon = getRoleIcon(member.role)
                  return (
                    <div 
                      key={member.id} 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} alt={member.login} />
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          {member.login.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate">@{member.login}</span>
                          <Badge variant="outline" className="h-4 text-xs shrink-0">
                            <RoleIcon size={10} className="mr-0.5" />
                            {member.role}
                          </Badge>
                        </div>
                        {member.lastActive && (
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(member.lastActive), { addSuffix: true })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <Separator />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{watchlist.members.length} total member{watchlist.members.length !== 1 ? 's' : ''}</span>
          </div>
          <span className="text-xs">Updates every 10 seconds</span>
        </div>
      </CardContent>
    </Card>
  )
}
