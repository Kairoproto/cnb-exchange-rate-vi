import { useState, useMemo } from 'react'
import { ExchangeRate } from '@/lib/types'
import { formatExchangeRate } from '@/lib/utils'
import { CaretUp, CaretDown } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type SortField = 'country' | 'currency' | 'currencyCode' | 'rate'
type SortDirection = 'asc' | 'desc'

interface ExchangeRateTableProps {
  rates: ExchangeRate[]
}

export function ExchangeRateTable({ rates }: ExchangeRateTableProps) {
  const [sortField, setSortField] = useState<SortField>('country')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedRates = useMemo(() => {
    return [...rates].sort((a, b) => {
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
  }, [rates, sortField, sortDirection])

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
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
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
  )
}
