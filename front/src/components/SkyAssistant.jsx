import { useCallback, useEffect, useRef, useState } from 'react'
import { apiFetchPublic } from '../services/api'
import { humanizeApiError } from '../checkoutUi'

function stripMd(s) {
  return (s || '').replace(/\*\*/g, '')
}

const INITIAL_ASSISTANT =
  'Hi — I’m **Sky Assistant**. Ask in chat or open **Trip preferences** and submit — I match destinations, hotels, guides, and activities from our RAG catalog (Groq-powered).'

export default function SkyAssistant() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('chat')
  const [messages, setMessages] = useState(() => [{ role: 'assistant', content: INITIAL_ASSISTANT }])
  const [input, setInput] = useState('')
  const [budgetEur, setBudgetEur] = useState('')
  const [season, setSeason] = useState('')
  const [destinationHint, setDestinationHint] = useState('')
  const [adults, setAdults] = useState('')
  const [youngestChildAge, setYoungestChildAge] = useState('')
  const [interests, setInterests] = useState('')
  const [loading, setLoading] = useState(false)
  const [ragHint, setRagHint] = useState(null)
  const listEndRef = useRef(null)

  useEffect(() => {
    if (open) listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const buildPreferences = useCallback(() => {
    const p = {}
    const b = budgetEur.trim()
    if (b !== '' && !Number.isNaN(Number(b))) p.budgetEur = Number(b)
    if (season.trim()) p.season = season.trim()
    if (destinationHint.trim()) p.destinationHint = destinationHint.trim()
    const ad = adults.trim()
    if (ad !== '' && !Number.isNaN(Number(ad))) p.adults = Number(ad)
    const y = youngestChildAge.trim()
    if (y !== '' && !Number.isNaN(Number(y))) p.youngestChildAge = Number(y)
    if (interests.trim()) p.interests = interests.trim()
    return Object.keys(p).length ? p : undefined
  }, [budgetEur, season, destinationHint, adults, youngestChildAge, interests])

  const runAssistant = async ({ messageText, preferences, userBubble }) => {
    setLoading(true)
    setRagHint(null)
    try {
      const historyForApi = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-12)
        .map((m) => ({ role: m.role, content: stripMd(m.content) }))

      const body = {
        message: messageText || '',
        history: historyForApi,
        preferences,
      }

      const data = await apiFetchPublic('/api/intelligence/chatbot', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      setRagHint(data?.ragLoaded === false ? 'Catalog not loaded — place skyres_db.json in RAG/ or classpath rag/.' : null)
      const reply = data?.reply || 'No reply.'

      setMessages((prev) => {
        const next = [...prev]
        if (userBubble) next.push({ role: 'user', content: userBubble })
        next.push({ role: 'assistant', content: reply })
        return next
      })
      setInput('')
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: humanizeApiError(e.message || 'Request failed.') },
      ])
    } finally {
      setLoading(false)
    }
  }

  const sendChat = async () => {
    const trimmed = input.trim()
    const prefs = buildPreferences()
    if (!trimmed && !prefs) {
      setTab('prefs')
      return
    }
    await runAssistant({
      messageText: trimmed,
      preferences: prefs,
      userBubble:
        trimmed ||
        (prefs ? 'Recommend destinations, hotels, guides, and activities for my trip preferences.' : null),
    })
  }

  const submitPrefsForm = async (e) => {
    e.preventDefault()
    const prefs = buildPreferences()
    if (!prefs) return
    await runAssistant({
      messageText: '',
      preferences: prefs,
      userBubble: 'Here are my trip preferences — what do you recommend?',
    })
    setTab('chat')
  }

  return (
    <>
      <button
        type="button"
        className={`sky-assistant-fab${open ? ' sky-assistant-fab--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="sky-assistant-panel"
        title="Sky Assistant"
      >
        <span className="sky-assistant-fab-icon" aria-hidden>
          ✦
        </span>
        <span className="sky-assistant-fab-label">Assistant</span>
      </button>

      {open && (
        <div id="sky-assistant-panel" className="sky-assistant-panel" role="dialog" aria-label="Sky Assistant chat">
          <div className="sky-assistant-head">
            <div>
              <div className="sky-assistant-title">Sky Assistant</div>
              <div className="sky-assistant-sub">Groq + RAG catalog</div>
            </div>
            <button type="button" className="sky-assistant-close" onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="sky-assistant-tabs">
            <button type="button" className={tab === 'chat' ? 'active' : undefined} onClick={() => setTab('chat')}>
              Chat
            </button>
            <button type="button" className={tab === 'prefs' ? 'active' : undefined} onClick={() => setTab('prefs')}>
              Trip preferences
            </button>
          </div>

          {tab === 'chat' && (
            <div className="sky-assistant-chat">
              <div className="sky-assistant-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`sky-assistant-msg sky-assistant-msg--${m.role}`}>
                    <div className="sky-assistant-msg-role">{m.role === 'user' ? 'You' : 'Assistant'}</div>
                    <div className="sky-assistant-msg-text">{m.content}</div>
                  </div>
                ))}
                {loading && <div className="sky-assistant-msg sky-assistant-msg--assistant sky-assistant-typing">…</div>}
                <div ref={listEndRef} />
              </div>
              {ragHint && <p className="sky-assistant-rag-hint">{ragHint}</p>}
              <div className="sky-assistant-compose">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for destinations, hotels, guides, activities…"
                  rows={2}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendChat()
                    }
                  }}
                />
                <button type="button" className="sky-assistant-send" disabled={loading} onClick={() => sendChat()}>
                  Send
                </button>
              </div>
            </div>
          )}

          {tab === 'prefs' && (
            <form className="sky-assistant-form" onSubmit={submitPrefsForm}>
              <label>
                Budget (EUR, ballpark)
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={budgetEur}
                  onChange={(e) => setBudgetEur(e.target.value)}
                  placeholder="e.g. 1200"
                />
              </label>
              <label>
                Season
                <select value={season} onChange={(e) => setSeason(e.target.value)}>
                  <option value="">Any</option>
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="autumn">Autumn</option>
                  <option value="winter">Winter</option>
                  <option value="year-round">Year-round</option>
                </select>
              </label>
              <label>
                Destination hint
                <input
                  type="text"
                  value={destinationHint}
                  onChange={(e) => setDestinationHint(e.target.value)}
                  placeholder="City, country, or region"
                />
              </label>
              <label>
                Adults
                <input
                  type="number"
                  min={1}
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                  placeholder="2"
                />
              </label>
              <label>
                Youngest child age (optional)
                <input
                  type="number"
                  min={0}
                  value={youngestChildAge}
                  onChange={(e) => setYoungestChildAge(e.target.value)}
                />
              </label>
              <label className="sky-assistant-form-span">
                Interests
                <textarea
                  rows={2}
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Beach, culture, northern lights, food…"
                />
              </label>
              <button type="submit" className="sky-assistant-form-submit" disabled={loading}>
                Get recommendations
              </button>
            </form>
          )}
        </div>
      )}
    </>
  )
}
