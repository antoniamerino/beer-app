import BeerCard from './BeerCard'
import LoadingSpinner from '../ui/LoadingSpinner'
import EmptyState from '../ui/EmptyState'
import '../../styles/beerGrid.css'

export default function BeerGrid({ beers, loading }) {
  if (loading) return <LoadingSpinner />
  if (!beers.length) return <EmptyState message="No hay cervezas que coincidan con los filtros." />

  return (
    <div className="beer-grid">
      {beers.map(beer => (
        <BeerCard key={beer.id} beer={beer} />
      ))}
    </div>
  )
}
