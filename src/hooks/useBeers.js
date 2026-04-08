import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useBeers() {
  const [beers, setBeers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function load() {
      const { data, error: err } = await supabase
        .from('beers')
        .select(`
          id, name, brewery, style, origin, country, photo_url,
          tastings (
            id, score, tasting_date, color, turbidity,
            foam_amount, foam_persistence, aroma_intensity,
            body, bitterness, carbonation, alcohol_presence
          )
        `)

      if (cancelled) return
      if (err) { setError(err); setLoading(false); return }

      const result = (data || []).map(beer => ({
        ...beer,
        latestTasting: (beer.tastings || [])
          .sort((a, b) => new Date(b.tasting_date) - new Date(a.tasting_date))[0] || null,
      }))

      setBeers(result)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { beers, loading, error }
}
