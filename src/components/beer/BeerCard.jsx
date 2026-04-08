import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import '../../styles/beerCard.css'

export default function BeerCard({ beer }) {
  const { latestTasting } = beer

  return (
    <Link to={`/beer/${beer.id}`} className="beer-card">
      {beer.photo_url ? (
        <img
          src={beer.photo_url}
          alt={beer.name}
          className="beer-card__photo"
          loading="lazy"
        />
      ) : (
        <div className="beer-card__photo-placeholder">🍺</div>
      )}

      <div className="beer-card__body">
        <div className="beer-card__name">{beer.name}</div>
        <div className="beer-card__brewery">{beer.brewery}</div>

        <div className="beer-card__footer">
          <Badge variant="default">{beer.style}</Badge>
          {beer.origin && (
            <Badge variant={beer.origin === 'Nacional' ? 'green' : 'gold'}>
              {beer.origin}
            </Badge>
          )}
          {latestTasting?.score != null && (
            <div>
              <span className="beer-card__score">{latestTasting.score}</span>
              <span className="beer-card__score-label">/10</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
