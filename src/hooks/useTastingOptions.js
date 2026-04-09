import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Returns options grouped by category, each entry is { id, value, group_name }
export function useTastingOptions() {
  const [options, setOptions] = useState({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('tasting_options')
      .select('*')
      .order('created_at')

    if (data) {
      const grouped = {}
      data.forEach(row => {
        if (!grouped[row.category]) grouped[row.category] = []
        grouped[row.category].push(row)
      })
      setOptions(grouped)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Helper: get flat list of values for a category
  function values(category) {
    return (options[category] || []).map(r => r.value)
  }

  // Helper: get beer style groups from DB
  function beerStyleGroups() {
    const rows = options['beer_styles'] || []
    const map = {}
    rows.forEach(r => {
      const g = r.group_name || 'Otros'
      if (!map[g]) map[g] = []
      map[g].push(r.value)
    })
    return Object.entries(map).map(([group, styles]) => ({ group, styles }))
  }

  return { options, loading, reload: load, values, beerStyleGroups }
}
