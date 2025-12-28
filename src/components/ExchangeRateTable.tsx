import { useState, useMemo } from 'react'
import { ExchangeRate } from '@/lib/types'
import { formatExchangeRate } from '@/lib/utils'
import { CaretUp, CaretDown, Star, MagnifyingGlass, X } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useFavorites } from '@/hooks/use-favorites'
import { AddToSharedWatchlist } from '@/components/AddToSharedWatchlist'

type SortField = 'country' | 'currency' | 'currencyCode' | 'rate'
type SortDirection = 'asc' | 'desc'

interface ExchangeRateTableProps {
  rates: ExchangeRate[]
  showFavoritesOnly?: boolean
}

export function ExchangeRateTable({ rates, showFavoritesOnly = false }: ExchangeRateTableProps) {
  const [sortField, setSortField] = useState<SortField>('country')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const { isFavorite, toggleFavorite } = useFavorites()

  const filteredRates = useMemo(() => {
    let filtered = showFavoritesOnly 
      ? rates.filter(rate => isFavorite(rate.currencyCode))
      : rates

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(rate => 
        rate.country.toLowerCase().includes(query) ||
        rate.currency.toLowerCase().includes(query) ||
        rate.currencyCode.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [rates, showFavoritesOnly, searchQuery, isFavorite])

  const sortedRates = useMemo(() => {
    return [...filteredRates].sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal as string).toLowerCase()
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredRates, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <CaretUp className="inline ml-1" size={14} weight="bold" />
    ) : (
      <CaretDown className="inline ml-1" size={14} weight="bold" />
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <MagnifyingGlass 
          size={20} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
        />
        <Input
          type="text"
          placeholder="Search by country, currency, or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-11"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => setSearchQuery('')}
          >
            <X size={16} />
          </Button>
        )}
      </div>
      
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {filteredRates.length} {filteredRates.length === 1 ? 'currency' : 'currencies'} matching "{searchQuery}"
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead 
                className="cursor-pointer select-none font-semibold text-foreground"
                onClick={() => handleSort('country')}
              >
                Country <SortIcon field="country" />
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none font-semibold text-foreground"
                onClick={() => handleSort('currency')}
              >
                Currency <SortIcon field="currency" />
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none font-semibold text-foreground"
                onClick={() => handleSort('currencyCode')}
              >
                Code <SortIcon field="currencyCode" />
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Amount
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none text-right font-semibold text-foreground"
                onClick={() => handleSort('rate')}
              >
                Rate (CZK) <SortIcon field="rate" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRates.map((rate, index) => (
              <TableRow 
                key={`${rate.currencyCode}-${index}`}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="w-12">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleFavorite(rate.currencyCode)}
                  >
                    <Star 
                      size={18} 
                      weight={isFavorite(rate.currencyCode) ? "fill" : "regular"}
                      className={isFavorite(rate.currencyCode) ? "text-yellow-500" : "text-muted-foreground"}
                    />
                  </Button>
                </TableCell>
                <TableCell className="w-12">
                  <AddToSharedWatchlist currencyCode={rate.currencyCode} />
                </TableCell>
                <TableCell className="font-medium">{rate.country}</TableCell>
                <TableCell>{rate.currency}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono font-medium">
                    {rate.currencyCode}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {rate.amount}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {formatExchangeRate(rate.rate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
    
    {filteredRates.length === 0 && searchQuery && (
      <div className="text-center py-8 text-muted-foreground">
        <p>No currencies found matching "{searchQuery}"</p>
        <Button 
          variant="outline" 
          className="mt-3"
          onClick={() => setSearchQuery('')}
        >
          Clear Search
        </Button>
      </div>
    )}
    </div>
  )
}
