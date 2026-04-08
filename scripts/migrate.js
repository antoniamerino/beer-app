/**
 * Migration script: load beers from beers-data.json into Supabase.
 *
 * Usage:
 *   node scripts/migrate.js
 *
 * Requires in .env:
 *   VITE_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   <-- bypasses RLS
 *
 * Expected JSON shape per entry (all fields optional except name + brewery):
 * {
 *   "name": "Antares Cream Stout",
 *   "brewery": "Antares",
 *   "style": "Cream Stout",
 *   "origin": "Nacional",          // "Nacional" | "Internacional"
 *   "country": null,               // if origin === "Internacional"
 *   "photo_url": null,             // optional direct URL
 *   "tasting": {
 *     "tasting_date": "2024-11-15",
 *     "color": "Negro",
 *     "turbidity": "Transparente",
 *     "foam_amount": "Moderada",
 *     "foam_persistence": "Persistente",
 *     "aroma_intensity": "Moderado",
 *     "aroma_notes": ["Chocolate", "Café"],
 *     "flavor_notes": ["Tostado", "Caramelo"],
 *     "bitterness": 3,
 *     "body": "Espeso",
 *     "carbonation": "Media",
 *     "alcohol_presence": "Suave",
 *     "score": 8.5,
 *     "comment": "Muy equilibrada."
 *   }
 * }
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('ERROR: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

const dataPath = join(__dirname, 'beers-data.json')
let beers

try {
  beers = JSON.parse(readFileSync(dataPath, 'utf-8'))
} catch (err) {
  console.error(`ERROR: Could not read ${dataPath}`)
  console.error(err.message)
  process.exit(1)
}

console.log(`\nMigrating ${beers.length} beers...\n`)

let successCount = 0
let errorCount = 0

for (const [i, entry] of beers.entries()) {
  const label = `[${i + 1}/${beers.length}] ${entry.name} — ${entry.brewery}`

  try {
    // 1. Insert beer
    const { data: beerData, error: beerErr } = await supabase
      .from('beers')
      .insert({
        name: entry.name,
        brewery: entry.brewery,
        style: entry.style || null,
        origin: entry.origin || null,
        country: entry.origin === 'Internacional' ? entry.country || null : null,
        photo_url: entry.photo_url || null,
      })
      .select()
      .single()

    if (beerErr) throw new Error(`beers insert: ${beerErr.message}`)

    // 2. Insert tasting (if provided)
    if (entry.tasting) {
      const t = entry.tasting
      const { error: tastingErr } = await supabase
        .from('tastings')
        .insert({
          beer_id: beerData.id,
          tasting_date: t.tasting_date || null,
          color: t.color || null,
          turbidity: t.turbidity || null,
          foam_amount: t.foam_amount || null,
          foam_persistence: t.foam_persistence || null,
          aroma_intensity: t.aroma_intensity || null,
          aroma_notes: Array.isArray(t.aroma_notes) ? t.aroma_notes : [],
          flavor_notes: Array.isArray(t.flavor_notes) ? t.flavor_notes : [],
          bitterness: t.bitterness ?? null,
          body: t.body || null,
          carbonation: t.carbonation || null,
          alcohol_presence: t.alcohol_presence || null,
          score: t.score ?? null,
          comment: t.comment || t.free_notes || null,
        })

      if (tastingErr) throw new Error(`tastings insert: ${tastingErr.message}`)
    }

    console.log(`  ✓ ${label}`)
    successCount++

  } catch (err) {
    console.error(`  ✗ ${label}`)
    console.error(`    ${err.message}`)
    errorCount++
  }
}

console.log(`\n--- Migration complete ---`)
console.log(`  Success: ${successCount}`)
console.log(`  Errors:  ${errorCount}`)
console.log(`  Total:   ${beers.length}\n`)
