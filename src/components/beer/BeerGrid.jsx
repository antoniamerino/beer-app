import BeerCard from './BeerCard'
import LoadingSpinner from '../ui/LoadingSpinner'
import EmptyState from '../ui/EmptyState'
import '../../styles/beerGrid.css'

export default function BeerGrid({ beers, loading, cols = 2 }) {
  if (loading) return <LoadingSpinner />
  if (!beers.length) return <EmptyState message="No hay cervezas que coincidan con los filtros." />

  return (
    <div className={`beer-grid beer-grid--cols-${cols}`}>
      {beers.map(beer => (
        <BeerCard key={beer.id} beer={beer} />
      ))}
    </div>
  )
}
