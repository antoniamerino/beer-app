export const COLOR_OPTIONS = [
  'Rubio pálido', 'Dorado', 'Cobre', 'Caramelo', 'Rojizo', 'Café', 'Negro',
]

export const TURBIDITY_OPTIONS = [
  'Transparente', 'Semi-turbio', 'Turbio', 'Opaco',
]

export const FOAM_AMOUNT_OPTIONS = [
  'Sin espuma', 'Escasa', 'Moderada', 'Abundante',
]

export const FOAM_PERSISTENCE_OPTIONS = [
  'Poco persistente', 'Persistente',
]

export const AROMA_INTENSITY_OPTIONS = [
  'Imperceptible', 'Suave', 'Moderado', 'Fuerte',
]

export const AROMA_FLAVOR_NOTES = [
  'Frutal', 'Cítrico', 'Floral', 'Tostado', 'Caramelo', 'Chocolate',
  'Café', 'Ahumado', 'Miel', 'Mosto', 'Ácido', 'Resinoso',
  'Herbal', 'Vainilla', 'Especiado',
]

export const BODY_OPTIONS = [
  'Liviano', 'Medio', 'Espeso',
]

export const CARBONATION_OPTIONS = [
  'Baja', 'Media', 'Alta',
]

export const ALCOHOL_PRESENCE_OPTIONS = [
  'No se siente', 'Suave', 'Moderado', 'Marcado',
]

export const BEER_STYLE_GROUPS = [
  { group: 'IPAs', styles: ['IPA', 'Session IPA', 'Double IPA / Imperial IPA', 'New England IPA (NEIPA)', 'West Coast IPA', 'Black IPA'] },
  { group: 'Ales', styles: ['Pale Ale', 'American Pale Ale', 'English Pale Ale', 'Amber Ale', 'Red Ale', 'Brown Ale', 'Cream Ale', 'Kolsch', 'Scotch Ale / Wee Heavy', 'Barleywine'] },
  { group: 'Stouts & Porters', styles: ['Stout', 'Dry Stout', 'Milk Stout / Sweet Stout', 'Oatmeal Stout', 'Imperial Stout', 'Porter', 'Robust Porter', 'Baltic Porter'] },
  { group: 'Belgas', styles: ['Witbier', 'Saison / Farmhouse Ale', 'Belgian Blonde', 'Belgian Dubbel', 'Belgian Tripel', 'Belgian Quadrupel', 'Belgian Strong Ale'] },
  { group: 'Trigo', styles: ['Hefeweizen', 'Dunkelweizen', 'Weizenbock', 'Wheat Beer', 'Berliner Weisse'] },
  { group: 'Ácidas / Salvajes', styles: ['Sour Ale', 'Gose', 'Lambic', 'Gueuze', 'Flanders Red Ale', 'American Wild Ale'] },
  { group: 'Lagers', styles: ['Lager', 'American Lager', 'Pilsner', 'Bohemian Pilsner', 'Munich Helles', 'Vienna Lager', 'Märzen / Oktoberfest', 'Red Lager', 'Dark Lager / Dunkel', 'Schwarzbier'] },
  { group: 'Bocks', styles: ['Bock', 'Maibock', 'Doppelbock', 'Eisbock'] },
  { group: 'Especiales', styles: ['Fruit Ale', 'Honey Ale', 'Rauchbier / Ahumada', 'Rye Beer', 'Gluten Free', 'Dark Ale', 'Otro'] },
]

export const BEER_STYLES = BEER_STYLE_GROUPS.flatMap(g => g.styles)

export const ORIGIN_OPTIONS = [
  'Nacional', 'Internacional',
]

export const SORT_OPTIONS = [
  { value: 'score_desc', label: 'Mejor puntuación' },
  { value: 'date_desc', label: 'Más reciente' },
  { value: 'name_asc', label: 'Nombre A-Z' },
]

export const MIN_SCORE_OPTIONS = [
  { value: '', label: 'Cualquier nota' },
  { value: '6', label: '6 o más' },
  { value: '7', label: '7 o más' },
  { value: '8', label: '8 o más' },
  { value: '9', label: '9 o más' },
]
