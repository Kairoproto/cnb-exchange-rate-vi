import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Globe, Bell, UserPlus } from '@phosphor-icons/react'
import { CreateWatchlistDialog } from './CreateWatchlistDialog'
import { SharedWatchlistManager } from './SharedWatchlistManager'
import { WatchlistInvites } from './WatchlistInvites'
import { PublicWatchlistsBrowser } from './PublicWatchlistsBrowser'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface CollaborationDashboardProps {
  onWatchlistSelect: (currencies: string[]) => void
}

export function CollaborationDashboard({ onWatchlistSelect }: CollaborationDashboardProps) {
  const [activeTab, setActiveTab] = useState('my-watchlists')

  return (
    <div className="space-y-6">
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

      <WatchlistInvites />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-2">
          <TabsTrigger value="my-watchlists" className="gap-2">
            <Users size={20} weight="duotone" />
            My Watchlists
          </TabsTrigger>
          <TabsTrigger value="public" className="gap-2">
            <Globe size={20} weight="duotone" />
            Browse Public
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-watchlists" className="mt-6">
          <SharedWatchlistManager onWatchlistSelect={onWatchlistSelect} />
        </TabsContent>

        <TabsContent value="public" className="mt-6">
          <PublicWatchlistsBrowser />
        </TabsContent>
      </Tabs>
    </div>
  )
}
