import { useKV } from '@github/spark/hooks'

export function useFavorites() {
  const [favorites, setFavorites] = useKV<string[]>('currency-favorites', [])

  const toggleFavorite = (currencyCode: string) => {
    setFavorites((current) => {
      const currentFavorites = current || []
      if (currentFavorites.includes(currencyCode)) {
        return currentFavorites.filter(code => code !== currencyCode)
      } else {
        return [...currentFavorites, currencyCode]
      }
    })
  }

  const isFavorite = (currencyCode: string) => {
    return (favorites || []).includes(currencyCode)
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  }
}
