import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { toast } from 'sonner'

export interface SharedWatchlist {
  id: string
  name: string
  description: string
  currencies: string[]
  ownerId: string
  ownerLogin: string
  ownerAvatar: string
  members: WatchlistMember[]
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

export interface WatchlistMember {
  id: string
  login: string
  avatar: string
  role: 'owner' | 'editor' | 'viewer'
  joinedAt: string
  lastActive?: string
}

export interface WatchlistInvite {
  id: string
  watchlistId: string
  watchlistName: string
  fromUserId: string
  fromUserLogin: string
  fromUserAvatar: string
  toUserLogin: string
  createdAt: string
  status: 'pending' | 'accepted' | 'declined'
}

export function useSharedWatchlists() {
  const [watchlists, setWatchlists] = useKV<SharedWatchlist[]>('shared-watchlists', [])
  const [invites, setInvites] = useKV<WatchlistInvite[]>('watchlist-invites', [])
  const [activeUsers, setActiveUsers] = useState<Map<string, string[]>>(new Map())

  const createWatchlist = async (name: string, description: string, isPublic: boolean, currencies: string[] = []) => {
    try {
      const user = await window.spark.user()
      if (!user) return null
      
      const newWatchlist: SharedWatchlist = {
        id: `wl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        currencies,
        ownerId: String(user.id),
        ownerLogin: user.login,
        ownerAvatar: user.avatarUrl,
        members: [{
          id: String(user.id),
          login: user.login,
          avatar: user.avatarUrl,
          role: 'owner',
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic
      }
      
      setWatchlists((current) => [...(current || []), newWatchlist])
      toast.success(`Watchlist "${name}" created successfully`)
      return newWatchlist
    } catch (error) {
      toast.error('Failed to create watchlist')
      return null
    }
  }

  const deleteWatchlist = async (watchlistId: string) => {
    const user = await window.spark.user()
    if (!user) return
    
    const watchlist = (watchlists || []).find(w => w.id === watchlistId)
    
    if (!watchlist) {
      toast.error('Watchlist not found')
      return
    }

    if (watchlist.ownerId !== String(user.id)) {
      toast.error('Only the owner can delete this watchlist')
      return
    }

    setWatchlists((current) => (current || []).filter(w => w.id !== watchlistId))
    toast.success('Watchlist deleted successfully')
  }

  const updateWatchlist = async (watchlistId: string, updates: Partial<SharedWatchlist>) => {
    const user = await window.spark.user()
    if (!user) return
    
    const watchlist = (watchlists || []).find(w => w.id === watchlistId)
    
    if (!watchlist) {
      toast.error('Watchlist not found')
      return
    }

    const member = watchlist.members.find(m => m.id === String(user.id))
    if (!member || (member.role === 'viewer' && updates.currencies)) {
      toast.error('You do not have permission to edit this watchlist')
      return
    }

    setWatchlists((current) =>
      (current || []).map(w => w.id === watchlistId ? {
        ...w,
        ...updates,
        updatedAt: new Date().toISOString()
      } : w)
    )
  }

  const addCurrencyToWatchlist = async (watchlistId: string, currencyCode: string) => {
    const user = await window.spark.user()
    if (!user) return
    
    const watchlist = (watchlists || []).find(w => w.id === watchlistId)
    
    if (!watchlist) {
      toast.error('Watchlist not found')
      return
    }

    const member = watchlist.members.find(m => m.id === String(user.id))
    if (!member || member.role === 'viewer') {
      toast.error('You do not have permission to edit this watchlist')
      return
    }

    if (watchlist.currencies.includes(currencyCode)) {
      toast.info('Currency already in watchlist')
      return
    }

    setWatchlists((current) =>
      (current || []).map(w => w.id === watchlistId ? {
        ...w,
        currencies: [...w.currencies, currencyCode],
        updatedAt: new Date().toISOString()
      } : w)
    )
    
    toast.success(`${currencyCode} added to "${watchlist.name}"`)
  }

  const removeCurrencyFromWatchlist = async (watchlistId: string, currencyCode: string) => {
    const user = await window.spark.user()
    if (!user) return
    
    const watchlist = (watchlists || []).find(w => w.id === watchlistId)
    
    if (!watchlist) {
      toast.error('Watchlist not found')
      return
    }

    const member = watchlist.members.find(m => m.id === String(user.id))
    if (!member || member.role === 'viewer') {
      toast.error('You do not have permission to edit this watchlist')
      return
    }

    setWatchlists((current) =>
      (current || []).map(w => w.id === watchlistId ? {
        ...w,
        currencies: w.currencies.filter(c => c !== currencyCode),
        updatedAt: new Date().toISOString()
      } : w)
    )
    
    toast.success(`${currencyCode} removed from "${watchlist.name}"`)
  }

  const inviteUser = async (watchlistId: string, userLogin: string) => {
    const user = await window.spark.user()
    if (!user) return
    
    const watchlist = (watchlists || []).find(w => w.id === watchlistId)
    
    if (!watchlist) {
      toast.error('Watchlist not found')
      return
    }

    if (watchlist.ownerId !== String(user.id)) {
      toast.error('Only the owner can invite users')
      return
    }

    if (watchlist.members.some(m => m.login === userLogin)) {
      toast.error('User is already a member')
      return
    }

    const invite: WatchlistInvite = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      watchlistId: watchlist.id,
      watchlistName: watchlist.name,
      fromUserId: String(user.id),
      fromUserLogin: user.login,
      fromUserAvatar: user.avatarUrl,
      toUserLogin: userLogin,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }

    setInvites((current) => [...(current || []), invite])
    toast.success(`Invitation sent to @${userLogin}`)
  }

  const acceptInvite = async (inviteId: string) => {
    const user = await window.spark.user()
    if (!user) return
    
    const invite = (invites || []).find(i => i.id === inviteId)
    
    if (!invite) {
      toast.error('Invite not found')
      return
    }

    if (invite.toUserLogin !== user.login) {
      toast.error('This invite is not for you')
      return
    }

    const watchlist = (watchlists || []).find(w => w.id === invite.watchlistId)
    if (!watchlist) {
      toast.error('Watchlist no longer exists')
      return
    }

    const newMember: WatchlistMember = {
      id: String(user.id),
      login: user.login,
      avatar: user.avatarUrl,
      role: 'viewer',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }

    setWatchlists((current) =>
      (current || []).map(w => w.id === invite.watchlistId ? {
        ...w,
        members: [...w.members, newMember],
        updatedAt: new Date().toISOString()
      } : w)
    )

    setInvites((current) =>
      (current || []).map(i => i.id === inviteId ? { ...i, status: 'accepted' as const } : i)
    )

    toast.success(`You joined "${invite.watchlistName}"`)
  }

  const declineInvite = async (inviteId: string) => {
    setInvites((current) =>
      (current || []).map(i => i.id === inviteId ? { ...i, status: 'declined' as const } : i)
    )
    toast.info('Invite declined')
  }

  const leaveWatchlist = async (watchlistId: string) => {
    const user = await window.spark.user()
    if (!user) return
    
    const watchlist = (watchlists || []).find(w => w.id === watchlistId)
    
    if (!watchlist) {
      toast.error('Watchlist not found')
      return
    }

    if (watchlist.ownerId === String(user.id)) {
      toast.error('Owner cannot leave. Delete the watchlist instead.')
      return
    }

    setWatchlists((current) =>
      (current || []).map(w => w.id === watchlistId ? {
        ...w,
        members: w.members.filter(m => m.id !== String(user.id)),
        updatedAt: new Date().toISOString()
      } : w)
    )

    toast.success(`You left "${watchlist.name}"`)
  }

  const removeMember = async (watchlistId: string, memberId: string) => {
    const user = await window.spark.user()
    if (!user) return
    
    const watchlist = (watchlists || []).find(w => w.id === watchlistId)
    
    if (!watchlist) {
      toast.error('Watchlist not found')
      return
    }

    if (watchlist.ownerId !== String(user.id)) {
      toast.error('Only the owner can remove members')
      return
    }

    const member = watchlist.members.find(m => m.id === memberId)
    if (member?.role === 'owner') {
      toast.error('Cannot remove the owner')
      return
    }

    setWatchlists((current) =>
      (current || []).map(w => w.id === watchlistId ? {
        ...w,
        members: w.members.filter(m => m.id !== memberId),
        updatedAt: new Date().toISOString()
      } : w)
    )

    toast.success('Member removed')
  }

  const updateMemberRole = async (watchlistId: string, memberId: string, newRole: 'editor' | 'viewer') => {
    const user = await window.spark.user()
    if (!user) return
    
    const watchlist = (watchlists || []).find(w => w.id === watchlistId)
    
    if (!watchlist) {
      toast.error('Watchlist not found')
      return
    }

    if (watchlist.ownerId !== String(user.id)) {
      toast.error('Only the owner can change roles')
      return
    }

    setWatchlists((current) =>
      (current || []).map(w => w.id === watchlistId ? {
        ...w,
        members: w.members.map(m => m.id === memberId ? { ...m, role: newRole } : m),
        updatedAt: new Date().toISOString()
      } : w)
    )

    toast.success('Member role updated')
  }

  const updateLastActive = async (watchlistId: string) => {
    const user = await window.spark.user()
    if (!user) return
    
    setWatchlists((current) =>
      (current || []).map(w => w.id === watchlistId ? {
        ...w,
        members: w.members.map(m => m.id === String(user.id) ? { 
          ...m, 
          lastActive: new Date().toISOString() 
        } : m)
      } : w)
    )
  }

  const getUserWatchlists = async () => {
    const user = await window.spark.user()
    if (!user) return []
    return (watchlists || []).filter(w => w.members.some(m => m.id === String(user.id)))
  }

  const getPendingInvites = async () => {
    const user = await window.spark.user()
    if (!user) return []
    return (invites || []).filter(i => i.toUserLogin === user.login && i.status === 'pending')
  }

  const getPublicWatchlists = () => {
    return (watchlists || []).filter(w => w.isPublic)
  }

  const joinPublicWatchlist = async (watchlistId: string) => {
    const user = await window.spark.user()
    if (!user) return
    
    const watchlist = (watchlists || []).find(w => w.id === watchlistId)
    
    if (!watchlist) {
      toast.error('Watchlist not found')
      return
    }

    if (!watchlist.isPublic) {
      toast.error('This watchlist is not public')
      return
    }

    if (watchlist.members.some(m => m.id === String(user.id))) {
      toast.info('You are already a member')
      return
    }

    const newMember: WatchlistMember = {
      id: String(user.id),
      login: user.login,
      avatar: user.avatarUrl,
      role: 'viewer',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }

    setWatchlists((current) =>
      (current || []).map(w => w.id === watchlistId ? {
        ...w,
        members: [...w.members, newMember],
        updatedAt: new Date().toISOString()
      } : w)
    )

    toast.success(`You joined "${watchlist.name}"`)
  }

  return {
    watchlists: watchlists || [],
    invites: invites || [],
    activeUsers,
    createWatchlist,
    deleteWatchlist,
    updateWatchlist,
    addCurrencyToWatchlist,
    removeCurrencyFromWatchlist,
    inviteUser,
    acceptInvite,
    declineInvite,
    leaveWatchlist,
    removeMember,
    updateMemberRole,
    updateLastActive,
    getUserWatchlists,
    getPendingInvites,
    getPublicWatchlists,
    joinPublicWatchlist
  }
}
