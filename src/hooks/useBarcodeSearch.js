const STYLE_MAP = [
  { tags: ['ipa', 'india-pale-ale', 'india_pale_ale'],             style: 'IPA' },
  { tags: ['double-ipa', 'imperial-ipa', 'dipa'],                  style: 'Double IPA / Imperial IPA' },
  { tags: ['session-ipa'],                                         style: 'Session IPA' },
  { tags: ['neipa', 'new-england-ipa', 'hazy-ipa'],               style: 'New England IPA (NEIPA)' },
  { tags: ['west-coast-ipa'],                                      style: 'West Coast IPA' },
  { tags: ['stout', 'dry-stout'],                                  style: 'Stout' },
  { tags: ['imperial-stout', 'russian-imperial-stout'],            style: 'Imperial Stout' },
  { tags: ['milk-stout', 'sweet-stout'],                          style: 'Milk Stout / Sweet Stout' },
  { tags: ['oatmeal-stout'],                                       style: 'Oatmeal Stout' },
  { tags: ['porter', 'robust-porter'],                             style: 'Porter' },
  { tags: ['baltic-porter'],                                       style: 'Baltic Porter' },
  { tags: ['pale-ale', 'pale_ale', 'american-pale-ale', 'apa'],   style: 'Pale Ale' },
  { tags: ['amber-ale', 'amber_ale'],                              style: 'Amber Ale' },
  { tags: ['red-ale', 'irish-red'],                                style: 'Red Ale' },
  { tags: ['brown-ale'],                                           style: 'Brown Ale' },
  { tags: ['barleywine'],                                          style: 'Barleywine' },
  { tags: ['witbier', 'wit', 'white-beer'],                        style: 'Witbier' },
  { tags: ['saison', 'farmhouse'],                                 style: 'Saison / Farmhouse Ale' },
  { tags: ['belgian-tripel', 'tripel'],                            style: 'Belgian Tripel' },
  { tags: ['belgian-dubbel', 'dubbel'],                            style: 'Belgian Dubbel' },
  { tags: ['belgian-quadrupel', 'quadrupel'],                      style: 'Belgian Quadrupel' },
  { tags: ['belgian'],                                             style: 'Belgian Strong Ale' },
  { tags: ['hefeweizen', 'weizen', 'weiss'],                       style: 'Hefeweizen' },
  { tags: ['dunkelweizen'],                                        style: 'Dunkelweizen' },
  { tags: ['wheat', 'trigo'],                                      style: 'Wheat Beer' },
  { tags: ['berliner-weisse', 'berliner'],                         style: 'Berliner Weisse' },
  { tags: ['gose'],                                                style: 'Gose' },
  { tags: ['sour', 'acida', 'wild-ale'],                          style: 'Sour Ale' },
  { tags: ['lambic'],                                              style: 'Lambic' },
  { tags: ['gueuze'],                                              style: 'Gueuze' },
  { tags: ['pilsner', 'pilsener', 'pils'],                        style: 'Pilsner' },
  { tags: ['helles', 'munich-helles'],                             style: 'Munich Helles' },
  { tags: ['marzen', 'märzen', 'oktoberfest'],                    style: 'Märzen / Oktoberfest' },
  { tags: ['bock'],                                                style: 'Bock' },
  { tags: ['doppelbock'],                                          style: 'Doppelbock' },
  { tags: ['lager', 'lagered'],                                    style: 'Lager' },
  { tags: ['fruit-beer', 'fruit-ale'],                             style: 'Fruit Ale' },
  { tags: ['honey'],                                               style: 'Honey Ale' },
  { tags: ['rauchbier', 'smoked'],                                 style: 'Rauchbier / Ahumada' },
]

function inferStyle(tags) {
  const flat = tags.join(' ').toLowerCase()
  for (const { tags: keywords, style } of STYLE_MAP) {
    if (keywords.some(k => flat.includes(k))) return style
  }
  return ''
}

export async function searchByBarcode(code) {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
    { headers: { 'User-Agent': 'CataCervezasDDM/1.0' } }
  )
  if (!res.ok) return null

  const json = await res.json()
  if (json.status !== 1 || !json.product) return null

  const p = json.product
  const countries = (p.countries_tags || []).map(c => c.toLowerCase())
  const isArgentina = countries.some(c => c.includes('argentina'))

  // Country label: take first country from the human-readable field
  let country = ''
  if (!isArgentina && p.countries) {
    country = p.countries.split(',')[0].trim()
  }

  return {
    name:      p.product_name || p.product_name_en || '',
    brewery:   p.brands || '',
    origin:    isArgentina ? 'Argentina' : countries.length > 0 ? 'Internacional' : '',
    country,
    photo_url: p.image_front_url || '',
    style:     inferStyle(p.categories_tags || []),
  }
}
