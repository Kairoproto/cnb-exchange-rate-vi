import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Globe, Bell, UserPlus, Phone } from '@phosphor-icons/react'
import { CreateWatchlistDialog } from './CreateWatchlistDialog'
import { SharedWatchlistManager } from './SharedWatchlistManager'
import { WatchlistInvites } from './WatchlistInvites'
import { PublicWatchlistsBrowser } from './PublicWatchlistsBrowser'
import { WatchlistActivityPanel } from './WatchlistActivityPanel'
import { CursorTrackingInfo } from './CursorTrackingInfo'
import { VoiceVideoCall } from './VoiceVideoCall'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useSharedWatchlists, type SharedWatchlist } from '@/hooks/use-shared-watchlists'
import { useCursorTracking } from '@/hooks/use-cursor-tracking'
import { LiveCursorsOverlay } from './LiveCursor'
import { ActiveCursorsIndicator } from './ActiveCursorsIndicator'

interface CollaborationDashboardProps {
  onWatchlistSelect: (currencies: string[], watchlist: SharedWatchlist | null) => void
}

export function CollaborationDashboard({ onWatchlistSelect }: CollaborationDashboardProps) {
  const [activeTab, setActiveTab] = useState('my-watchlists')
  const [selectedWatchlist, setSelectedWatchlist] = useState<SharedWatchlist | null>(null)
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentUser, setCurrentUser] = useState<{ login: string; avatarUrl: string } | null>(null)
  const { watchlists } = useSharedWatchlists()
  const { cursors } = useCursorTracking(
    selectedWatchlist?.id || null,
    selectedWatchlist !== null
  )

  useEffect(() => {
    const loadUser = async () => {
      const user = await window.spark.user()
      if (user) {
        setCurrentUserId(String(user.id))
        setCurrentUser({
          login: user.login,
          avatarUrl: user.avatarUrl,
        })
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (selectedWatchlist) {
      const updated = watchlists.find(w => w.id === selectedWatchlist.id)
      if (updated) {
        setSelectedWatchlist(updated)
      }
    }
  }, [watchlists, selectedWatchlist])

  const handleWatchlistSelect = (currencies: string[], watchlist: SharedWatchlist | null) => {
    onWatchlistSelect(currencies, watchlist)
    setSelectedWatchlist(watchlist)
  }

  return (
    <div className="space-y-6">
      {selectedWatchlist && (
        <>
          <LiveCursorsOverlay cursors={cursors} />
          <ActiveCursorsIndicator cursors={cursors} />
        </>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users size={32} weight="duotone" className="text-primary" />
            Collaborative Watchlists
          </h2>
          <p className="text-muted-foreground mt-1">
            Create, share, and collaborate on currency watchlists with your team
          </p>
        </div>
        <CreateWatchlistDialog />
      </div>

      <Alert className="border-accent/50 bg-accent/5">
        <UserPlus size={20} weight="duotone" />
        <AlertTitle>Multi-User Collaboration</AlertTitle>
        <AlertDescription>
          Shared watchlists allow you to track currencies collaboratively. Create private watchlists for your team or public ones for the community. Invite members with different permission levels (Owner, Editor, Viewer) to control who can modify your watchlists.
        </AlertDescription>
      </Alert>

      <CursorTrackingInfo />

      <WatchlistInvites />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedWatchlist ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-3xl grid-cols-3">
              <TabsTrigger value="my-watchlists" className="gap-2">
                <Users size={20} weight="duotone" />
                My Watchlists
              </TabsTrigger>
              <TabsTrigger value="public" className="gap-2">
                <Globe size={20} weight="duotone" />
                Browse Public
              </TabsTrigger>
              <TabsTrigger value="calls" className="gap-2">
                <Phone size={20} weight="duotone" />
                Voice & Video
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-watchlists" className="mt-6">
              <SharedWatchlistManager onWatchlistSelect={handleWatchlistSelect} />
            </TabsContent>

            <TabsContent value="public" className="mt-6">
              <PublicWatchlistsBrowser />
            </TabsContent>

            <TabsContent value="calls" className="mt-6">
              {currentUser && selectedWatchlist && (
                <VoiceVideoCall
                  watchlistId={selectedWatchlist.id}
                  watchlistMembers={selectedWatchlist.members.map(m => ({
                    userId: m.id,
                    userName: m.login,
                    userAvatar: m.avatar,
                    role: m.role,
                  }))}
                  currentUser={currentUser}
                />
              )}
              {!selectedWatchlist && (
                <Alert>
                  <Phone size={20} weight="duotone" />
                  <AlertDescription>
                    Select a shared watchlist from the "My Watchlists" tab to enable voice and video calls with team members.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {selectedWatchlist && currentUserId && (
          <div className="lg:col-span-1">
            <WatchlistActivityPanel 
              watchlist={selectedWatchlist} 
              currentUserId={currentUserId}
              activeCursorCount={cursors.length}
            />
          </div>
        )}
      </div>
    </div>
  )
}
