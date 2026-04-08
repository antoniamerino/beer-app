import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useBeer(id) {
  const [beer, setBeer] = useState(null)
  const [tastings, setTastings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setBeer(null)

    async function load() {
      // Fetch beer and tastings separately to avoid RLS issues with beer_categories join
      const [beerRes, tastingsRes] = await Promise.all([
        supabase.from('beers').select('*').eq('id', id).single(),
        supabase.from('tastings').select('*').eq('beer_id', id).order('tasting_date', { ascending: false }),
      ])

      if (cancelled) return

      if (beerRes.error || !beerRes.data) {
        setError(beerRes.error || new Error('No encontrada'))
        setLoading(false)
        return
      }

      setBeer(beerRes.data)
      setTastings(tastingsRes.data || [])
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [id])

  function refetch() {
    setLoading(true)
    setError(null)
    Promise.all([
      supabase.from('beers').select('*').eq('id', id).single(),
      supabase.from('tastings').select('*').eq('beer_id', id).order('tasting_date', { ascending: false }),
    ]).then(([beerRes, tastingsRes]) => {
      if (beerRes.error || !beerRes.data) { setError(beerRes.error); setLoading(false); return }
      setBeer(beerRes.data)
      setTastings(tastingsRes.data || [])
      setLoading(false)
    })
  }

  return { beer, tastings, loading, error, refetch }
}
