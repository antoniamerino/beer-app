import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBeers } from '../hooks/useBeers'
import {
  AROMA_FLAVOR_NOTES, CARBONATION_OPTIONS,
  ALCOHOL_PRESENCE_OPTIONS, BODY_OPTIONS,
} from '../constants/tastingOptions'
import '../styles/quiz.css'

const STORAGE_KEY = 'ddm_quiz_answers'
const NO_IMPORTA = '__no_importa__'

const QUESTIONS = [
  {
    id: 'bitterness',
    title: '¿Qué tan amargo te gusta?',
    subtitle: 'Del 1 (casi nada) al 5 (muy intenso)',
    type: 'bitterness',
    options: [1, 2, 3, 4, 5],
    labels: ['Muy suave', 'Suave', 'Equilibrado', 'Amargo', 'Muy amargo'],
    required: true,
  },
  {
    id: 'body',
    title: '¿Qué cuerpo prefieres?',
    subtitle: 'La sensación de densidad y peso en la boca',
    type: 'single',
    options: BODY_OPTIONS,
    required: true,
  },
  {
    id: 'aromas',
    title: '¿Qué aromas te llaman más?',
    subtitle: 'Selecciona todos los que quieras — puedes omitir esta pregunta',
    type: 'multi',
    options: AROMA_FLAVOR_NOTES,
    required: false,
  },
  {
    id: 'carbonation',
    title: '¿Cómo te gusta la espuma?',
    subtitle: 'El nivel de carbonatación de la cerveza',
    type: 'single',
    options: CARBONATION_OPTIONS,
    required: true,
  },
  {
    id: 'alcohol',
    title: '¿Cuánta presencia de alcohol prefieres?',
    subtitle: 'La calidez y potencia que sientes al beber',
    type: 'single',
    options: ALCOHOL_PRESENCE_OPTIONS,
    required: true,
  },
]

const DEFAULT_ANSWERS = {
  bitterness: null,
  body: null,
  aromas: [],
  carbonation: null,
  alcohol: null,
}

function computeResults(beers, answers) {
  return beers
    .filter(b => b.latestTasting)
    .map(b => {
      const t = b.latestTasting
      let score = 0
      let totalWeight = 0

      if (answers.bitterness !== null && answers.bitterness !== NO_IMPORTA && t.bitterness != null) {
        const diff = Math.abs(t.bitterness - answers.bitterness)
        const pts = diff === 0 ? 100 : diff === 1 ? 60 : diff === 2 ? 20 : 0
        score += pts * 0.25
        totalWeight += 0.25
      }

      if (answers.body && answers.body !== NO_IMPORTA && t.body) {
        score += (t.body === answers.body ? 100 : 0) * 0.20
        totalWeight += 0.20
      }

      if (answers.aromas?.length > 0 && answers.aromas[0] !== NO_IMPORTA) {
        const intersection = answers.aromas.filter(a => (t.aroma_notes || []).includes(a))
        score += (intersection.length / answers.aromas.length * 100) * 0.30
        totalWeight += 0.30
      }

      if (answers.carbonation && answers.carbonation !== NO_IMPORTA && t.carbonation) {
        score += (t.carbonation === answers.carbonation ? 100 : 0) * 0.15
        totalWeight += 0.15
      }

      if (answers.alcohol && answers.alcohol !== NO_IMPORTA && t.alcohol_presence) {
        score += (t.alcohol_presence === answers.alcohol ? 100 : 0) * 0.10
        totalWeight += 0.10
      }

      const match = totalWeight > 0 ? Math.round(score / totalWeight) : 50
      return { beer: b, match }
    })
    .filter(r => r.match >= 60)
    .sort((a, b) => b.match - a.match)
}

export default function QuizPage() {
  const { beers, loading } = useBeers()
  const [view, setView] = useState('welcome') // 'welcome' | 'quiz' | 'results'
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS)
  const [savedAnswers, setSavedAnswers] = useState(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setSavedAnswers(JSON.parse(saved))
    } catch {}
  }, [])

  const results = useMemo(
    () => view === 'results' ? computeResults(beers, answers) : [],
    [beers, answers, view]
  )

  const savedResults = useMemo(
    () => savedAnswers && !loading ? computeResults(beers, savedAnswers) : [],
    [beers, savedAnswers, loading]
  )

  function startQuiz() {
    setAnswers(DEFAULT_ANSWERS)
    setStep(0)
    setView('quiz')
  }

  function showSaved() {
    setAnswers(savedAnswers)
    setView('results')
  }

  function handleAnswer(id, value) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  function toggleMulti(id, value) {
    setAnswers(prev => {
      const current = prev[id] || []
      return {
        ...prev,
        [id]: current.includes(value) ? current.filter(v => v !== value) : [...current, value],
      }
    })
  }

  function next() {
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1)
    } else {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)) } catch {}
      setSavedAnswers(answers)
      setView('results')
    }
  }

  function back() {
    if (step > 0) setStep(s => s - 1)
    else setView('welcome')
  }

  const currentQ = QUESTIONS[step]
  const currentAnswer = answers[currentQ?.id]
  const answered = currentAnswer !== null && currentAnswer !== undefined &&
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true)
  const canNext = currentQ?.required ? answered : true

  // ── Welcome ───────────────────────────────────────────────────────────────
  if (view === 'welcome') {
    return (
      <div className="quiz-page">
        <div className="quiz-welcome">
          <img src="/default.png" alt="Cerveza" className="quiz-welcome__icon-img" />
          <h1 className="quiz-welcome__title">Descubre tu cerveza ideal</h1>
          <p className="quiz-welcome__subtitle">Test de 5 preguntas</p>

          {savedAnswers && savedResults.length > 0 ? (
            <div className="quiz-saved">
              <button className="quiz-btn quiz-btn--primary" onClick={showSaved}>
                Ver recomendación anterior
              </button>
              <button className="quiz-btn quiz-btn--ghost" onClick={startQuiz}>
                Repetir el test
              </button>
            </div>
          ) : (
            <button className="quiz-btn quiz-btn--primary" onClick={startQuiz}>
              Comenzar
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  if (view === 'quiz') {
    return (
      <div className="quiz-page">
        <div className="quiz-progress">
          <div className="quiz-progress__bar">
            <div
              className="quiz-progress__fill"
              style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>
          <span className="quiz-progress__label">{step + 1} de {QUESTIONS.length}</span>
        </div>

        <div className="quiz-question">
          <h2 className="quiz-question__title">{currentQ.title}</h2>
          <p className="quiz-question__subtitle">{currentQ.subtitle}</p>

          {currentQ.type === 'bitterness' && (
            <div className="quiz-chips">
              {currentQ.options.map((n, i) => (
                <button
                  key={n}
                  type="button"
                  className={`quiz-chip quiz-chip--bitterness ${currentAnswer === n ? 'quiz-chip--selected' : ''}`}
                  onClick={() => handleAnswer(currentQ.id, n)}
                >
                  <span className="quiz-chip__dots">
                    {[1,2,3,4,5].map(d => (
                      <span key={d} className={`quiz-dot ${d <= n ? 'quiz-dot--filled' : ''}`} />
                    ))}
                  </span>
                  <span className="quiz-chip__label">{currentQ.labels[i]}</span>
                </button>
              ))}
              <button
                type="button"
                className={`quiz-chip quiz-chip--no-importa ${currentAnswer === NO_IMPORTA ? 'quiz-chip--selected' : ''}`}
                onClick={() => handleAnswer(currentQ.id, NO_IMPORTA)}
              >
                No me importa
              </button>
            </div>
          )}

          {currentQ.type === 'single' && (
            <div className="quiz-chips">
              {currentQ.options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`quiz-chip ${currentAnswer === opt ? 'quiz-chip--selected' : ''}`}
                  onClick={() => handleAnswer(currentQ.id, opt)}
                >
                  {opt}
                </button>
              ))}
              <button
                type="button"
                className={`quiz-chip quiz-chip--no-importa ${currentAnswer === NO_IMPORTA ? 'quiz-chip--selected' : ''}`}
                onClick={() => handleAnswer(currentQ.id, NO_IMPORTA)}
              >
                No me importa
              </button>
            </div>
          )}

          {currentQ.type === 'multi' && (
            <div className="quiz-chips">
              {currentQ.options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`quiz-chip ${(currentAnswer || []).includes(opt) ? 'quiz-chip--selected' : ''}`}
                  onClick={() => toggleMulti(currentQ.id, opt)}
                >
                  {opt}
                </button>
              ))}
              <button
                type="button"
                className={`quiz-chip quiz-chip--no-importa ${(currentAnswer || []).includes(NO_IMPORTA) ? 'quiz-chip--selected' : ''}`}
                onClick={() => handleAnswer(currentQ.id, [NO_IMPORTA])}
              >
                No me importa
              </button>
            </div>
          )}
        </div>

        <div className="quiz-actions">
          <button className="quiz-btn quiz-btn--ghost" onClick={back}>
            ← Anterior
          </button>
          <button
            className="quiz-btn quiz-btn--primary"
            onClick={next}
            disabled={!canNext}
          >
            {step === QUESTIONS.length - 1 ? 'Ver resultados' : 'Siguiente →'}
          </button>
        </div>
      </div>
    )
  }

  // ── Results ───────────────────────────────────────────────────────────────
  return (
    <div className="quiz-page">
      <div className="quiz-results-header">
        <div>
          <h2 className="quiz-results__title">Tus cervezas ideales</h2>
          {results.length > 0 && (
            <p className="quiz-results__subtitle">
              {results.length} cerveza{results.length !== 1 ? 's' : ''} encontrada{results.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button className="quiz-btn quiz-btn--ghost" onClick={startQuiz}>
          Repetir el test
        </button>
      </div>

      {results.length === 0 ? (
        <div className="quiz-empty">
          <p>No encontramos coincidencias para tu búsqueda. Intenta con otras preferencias.</p>
          <button className="quiz-btn quiz-btn--primary" onClick={startQuiz}>
            Repetir el test
          </button>
        </div>
      ) : (
        <div className="quiz-results">
          {results.map(({ beer, match }) => (
            <Link key={beer.id} to={`/beer/${beer.id}`} className="quiz-result-card">
              <img
                src={beer.photo_url || '/default.png'}
                alt={beer.name}
                className={`quiz-result-card__photo ${!beer.photo_url ? 'quiz-result-card__photo--default' : ''}`}
              />
              <div className="quiz-result-card__info">
                <div className="quiz-result-card__name">{beer.name}</div>
                <div className="quiz-result-card__brewery">{beer.brewery}</div>
                {beer.latestTasting?.score != null && (
                  <div className="quiz-result-card__score">
                    Nota: <strong>{beer.latestTasting.score}</strong>/10
                  </div>
                )}
                <div className="quiz-result-card__match">
                  <div className="quiz-match-bar">
                    <div className="quiz-match-bar__fill" style={{ width: `${match}%` }} />
                  </div>
                  <span className="quiz-match-pct">{match}% match</span>
                </div>
              </div>
              <span className="quiz-result-card__arrow">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
