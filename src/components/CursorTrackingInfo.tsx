import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cursor, Users, Eye } from '@phosphor-icons/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function CursorTrackingInfo() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cursor size={24} weight="duotone" className="text-primary" />
          Real-Time Cursor Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          See where your team members are hovering in real-time when viewing shared watchlists. Live cursors appear with user avatars and names.
        </p>
        
        <div className="grid gap-2">
          <div className="flex items-start gap-2 text-sm">
            <div className="p-1.5 bg-primary/10 rounded-md mt-0.5">
              <Cursor size={16} weight="duotone" className="text-primary" />
            </div>
            <div>
              <div className="font-medium">Live Cursor Display</div>
              <div className="text-xs text-muted-foreground">
                Colored cursors show each team member's position with smooth animations
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-sm">
            <div className="p-1.5 bg-accent/10 rounded-md mt-0.5">
              <Users size={16} weight="duotone" className="text-accent" />
            </div>
            <div>
              <div className="font-medium">Active User Counter</div>
              <div className="text-xs text-muted-foreground">
                See how many team members are currently active on the watchlist
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-sm">
            <div className="p-1.5 bg-secondary/50 rounded-md mt-0.5">
              <Eye size={16} weight="duotone" className="text-secondary-foreground" />
            </div>
            <div>
              <div className="font-medium">Auto-Cleanup</div>
              <div className="text-xs text-muted-foreground">
                Inactive cursors automatically disappear after 5 seconds
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
