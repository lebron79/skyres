import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import UserMenu from './UserMenu'
import Settings from './Settings'
import { apiFetch } from './api'
import './App.css'

const UNS = 'https://images.unsplash.com'

const destinations = [
  {
    id: 1, name: 'Bali', country: 'Indonesia', badge: 'Trending', stars: 5, tall: true,
    img: `${UNS}/photo-1537996088602-65a78a2ba015?auto=format&fit=crop&w=800&q=80`,
    fallback: '#1a5276',
  },
  {
    id: 2, name: 'Paris', country: 'France', badge: 'Popular', stars: 5, tall: false,
    img: `${UNS}/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80`,
    fallback: '#7d6608',
  },
  {
    id: 3, name: 'Tokyo', country: 'Japan', badge: 'Must-see', stars: 5, tall: false,
    img: `${UNS}/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80`,
    fallback: '#7b241c',
  },
  {
    id: 4, name: 'Santorini', country: 'Greece', badge: 'Romantic', stars: 5, tall: false,
    img: `${UNS}/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80`,
    fallback: '#154360',
  },
  {
    id: 5, name: 'Marrakech', country: 'Morocco', badge: 'Culture', stars: 4, tall: false,
    img: `${UNS}/photo-1508193638397-1c4234db14d8?auto=format&fit=crop&w=800&q=80`,
    fallback: '#6e2f1a',
  },
  {
    id: 6, name: 'Swiss Alps', country: 'Switzerland', badge: 'Adventure', stars: 5, tall: false,
    img: `${UNS}/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80`,
    fallback: '#1d4e1d',
  },
  {
    id: 7, name: 'Maldives', country: 'Maldives', badge: 'Luxury', stars: 5, tall: false,
    img: `${UNS}/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80`,
    fallback: '#0e6655',
  },
  {
    id: 8, name: 'Dubai', country: 'UAE', badge: 'Modern', stars: 5, tall: false,
    img: `${UNS}/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80`,
    fallback: '#4a235a',
  },
  {
    id: 9, name: 'Amalfi Coast', country: 'Italy', badge: 'Scenic', stars: 5, tall: false,
    img: `${UNS}/photo-1587474260584-136574297316?auto=format&fit=crop&w=800&q=80`,
    fallback: '#0a3d3d',
  },
]

const defaultActivities = [
  {
    id: 1, name: 'Scuba Diving', location: 'Great Barrier Reef', duration: '3h', price: '$85',
    img: `${UNS}/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80`,
    fallback: '#01579b',
  },
  {
    id: 2, name: 'Hot Air Balloon', location: 'Cappadocia, Turkey', duration: '2h', price: '$120',
    img: `${UNS}/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=700&q=80`,
    fallback: '#e65100',
  },
  {
    id: 3, name: 'Desert Safari', location: 'Dubai, UAE', duration: '6h', price: '$95',
    img: `${UNS}/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=700&q=80`,
    fallback: '#827717',
  },
  {
    id: 4, name: 'Northern Lights', location: 'Tromsø, Norway', duration: '4h', price: '$110',
    img: `${UNS}/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=700&q=80`,
    fallback: '#1a237e',
  },
  {
    id: 5, name: 'Mountain Trek', location: 'Nepal Himalayas', duration: '8h', price: '$60',
    img: `${UNS}/photo-1551632811-561732d1e306?auto=format&fit=crop&w=700&q=80`,
    fallback: '#1b5e20',
  },
  {
    id: 6, name: 'Cooking Class', location: 'Tuscany, Italy', duration: '3h', price: '$75',
    img: `${UNS}/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=700&q=80`,
    fallback: '#880e4f',
  },
]

const reviews = [
  { id: 1, name: 'Sophie Martin',  country: 'Paris, France',   avatar: 'SM', color: '#7C3AED', stars: 5, text: 'Booked three hotels in one afternoon. The AI suggestions nailed it — Bali matched every preference I had. Will never plan a trip the old way again.' },
  { id: 2, name: 'Kenji Nakamura', country: 'Tokyo, Japan',    avatar: 'KN', color: '#0C7A6E', stars: 5, text: 'The PDF invoice with a QR code came through instantly. The guide I found spoke fluent Japanese and knew every hidden gem in Kyoto.' },
  { id: 3, name: 'Amara Diallo',   country: 'Dakar, Senegal',  avatar: 'AD', color: '#E8601A', stars: 5, text: 'I used the budget filter and found a 5-star resort in Marrakech for half what I expected. The experience was absolutely surreal.' },
  { id: 4, name: 'Luca Ferretti',  country: 'Rome, Italy',     avatar: 'LF', color: '#059669', stars: 5, text: 'The interactive map made it so easy to spot which hotels were close to the Amalfi coastline. Booked in 5 minutes flat.' },
]

const team = [
  {
    cls: 'c1', num: 'Person 01', role: 'Auth & Users',
    desc: 'Owns all identity, roles, and access management.',
    items: ['Register / login with JWT', 'Google OAuth integration', 'Email verification flow', 'Role system: Tourist · Guide · Admin', 'Profile & password management'],
  },
  {
    cls: 'c2', num: 'Person 02', role: 'Destinations & Hotels',
    desc: 'Builds the core catalog and discovery experience.',
    items: ['Destination CRUD (country, climate, budget)', 'Hotel CRUD (stars, price, availability)', 'Advanced search & filters', 'Interactive hotel map', 'Top trending destinations'],
  },
  {
    cls: 'c3', num: 'Person 03', role: 'Reservations & Payments',
    desc: 'Manages the entire booking and payment pipeline.',
    items: ['Hotel reservation lifecycle', 'Payment processing & status', 'PDF invoice generation', 'QR code per reservation', 'Coupons & budget simulation'],
  },
  {
    cls: 'c4', num: 'Person 04', role: 'Guides, Activities & AI',
    desc: 'Powers smart recommendations and guide discovery.',
    items: ['Guide CRUD (languages, tariff, region)', 'Activity CRUD (excursion, hiking, safari…)', 'AI recommendations by budget & season', 'Tourist chatbot', 'Reviews, ratings & auto travel planner'],
  },
]

const tech = [
  { icon: '☕', name: 'Spring Boot',     cat: 'Backend'    },
  { icon: '⚛️', name: 'React',           cat: 'Frontend'   },
  { icon: '🐬', name: 'MySQL',           cat: 'Database'   },
  { icon: '🔒', name: 'Spring Security', cat: 'Auth'       },
  { icon: '🪙', name: 'JWT',             cat: 'Tokens'     },
  { icon: '📄', name: 'Swagger UI',      cat: 'API Docs'   },
  { icon: '📑', name: 'iText PDF',       cat: 'Documents'  },
  { icon: '📧', name: 'Spring Mail',     cat: 'Email'      },
  { icon: '🗺️', name: 'OpenStreetMap',   cat: 'Maps'       },
  { icon: '🤖', name: 'AI Engine',       cat: 'Smart Recs' },
]

const pills = ['🌴 Bali', '🗼 Paris', '🗾 Tokyo', '🏔️ Alps', '🏜️ Marrakech', '🌊 Maldives']

const steps = [
  { n: '01', icon: '🔍', title: 'Search your destination', desc: 'Browse 200+ destinations filtered by budget, season, climate, or popularity. Compare side by side.' },
  { n: '02', icon: '🏨', title: 'Pick a hotel & guide',    desc: 'Filter hotels by stars, price per night, and availability. Add a certified local guide in seconds.' },
  { n: '03', icon: '✈️', title: 'Book & go',               desc: 'Confirm your reservation, pay securely, and receive a PDF invoice with a QR code instantly.' },
]

const heroCards = [
  { cls: 'fc-1', img: `${UNS}/photo-1537996088602-65a78a2ba015?auto=format&fit=crop&w=300&q=70`, label: 'Bali, Indonesia'    },
  { cls: 'fc-2', img: `${UNS}/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=300&q=70`, label: 'Santorini, Greece'  },
  { cls: 'fc-3', img: `${UNS}/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=300&q=70`, label: 'Tokyo, Japan'       },
]

export function HomePage() {
  const [search, setSearch] = useState('')
  const { user } = useAuth()
  const [showSettings, setShowSettings] = useState(false)
  const [activities, setActivities] = useState(defaultActivities)
  const [activitiesLoading, setActivitiesLoading] = useState(true)

  useEffect(() => {
    const loadActivities = async () => {
      setActivitiesLoading(true)
      try {
        const data = await apiFetch('/api/activities', { method: 'GET' })
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((a, idx) => ({
            id: a.id ?? `db-${idx}`,
            name: a.name || 'Activity',
            location: a.destination
              ? `${a.destination.city ?? ''}${a.destination.city && a.destination.country ? ', ' : ''}${a.destination.country ?? ''}`.trim() || 'Location not specified'
              : 'Location not specified',
            duration: a.type || (a.season ? `${a.season} season` : 'Custom experience'),
            price: typeof a.price === 'number' ? `$${a.price}` : 'Price on request',
            img: a.imageUrl || defaultActivities[idx % defaultActivities.length].img,
            fallback: defaultActivities[idx % defaultActivities.length].fallback,
          }))
          setActivities(mapped)
        }
      } catch {
        setActivities(defaultActivities)
      } finally {
        setActivitiesLoading(false)
      }
    }

    loadActivities()
  }, [])

  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-logo">
          <div className="nav-logo-mark">✈</div>
          SkyRes
        </div>
        <ul className="nav-links">
          <li><a href="#destinations">Destinations</a></li>
          <li><a href="#activities">Activities</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#team">Team</a></li>
          {user?.role === 'ADMIN' && (
            <li><Link to="/admin">Admin</Link></li>
          )}
        </ul>
        <div className="nav-right">
          <UserMenu onSettingsClick={() => setShowSettings(true)} />
          <a href="#team" className="nav-cta">Explore</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        {/* Floating destination preview cards */}
        <div className="hero-float-cards" aria-hidden="true">
          {heroCards.map(c => (
            <div key={c.cls} className={`float-card ${c.cls}`}>
              <div className="fc-img" style={{ backgroundImage: `url(${c.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <span>{c.label}</span>
            </div>
          ))}
        </div>

        <span className="hero-eyebrow">✈ Smart Tourism Platform</span>
        <h1 className="hero-title">
          Discover the world,<br />
          <em>your way</em>
        </h1>
        <p className="hero-sub">
          Search hotels, book guided tours, and get personalised travel
          recommendations — all in one platform built for modern explorers.
        </p>

        <div className="search-bar">
          <div className="search-field">
            <label>Where to?</label>
            <input
              placeholder="Destination, city or country"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="search-field">
            <label>Check in</label>
            <span>Add dates</span>
          </div>
          <div className="search-field">
            <label>Guests</label>
            <span>Add guests</span>
          </div>
          <button className="search-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search
          </button>
        </div>

        <div className="hero-tags">
          <strong>Popular:</strong>
          {pills.map(p => <button key={p} className="dest-pill">{p}</button>)}
        </div>

        <div className="hero-stats">
          <div className="stat"><div className="stat-val">500<span>+</span></div><div className="stat-lbl">Hotels listed</div></div>
          <div className="stat"><div className="stat-val">200<span>+</span></div><div className="stat-lbl">Destinations</div></div>
          <div className="stat"><div className="stat-val">1K<span>+</span></div><div className="stat-lbl">Activities</div></div>
          <div className="stat"><div className="stat-val">4.9<span>★</span></div><div className="stat-lbl">Avg. rating</div></div>
        </div>
      </section>

      {/* ── Destinations ── */}
      <section id="destinations" className="section alt">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Explore</div>
            <h2 className="section-heading">Popular destinations</h2>
            <p className="section-body">
              Hand-picked destinations loved by thousands of travellers,
              from tropical beaches to alpine adventures.
            </p>
          </div>
          <div className="dest-grid">
            {destinations.map(d => (
              <div key={d.id} className={`dest-card${d.tall ? ' tall' : ''}`}>
                <div
                  className="dest-photo"
                  style={{
                    backgroundImage: `url(${d.img})`,
                    backgroundColor: d.fallback,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <span className="dest-badge">{d.badge}</span>
                  <div className="dest-info">
                    <div className="dest-name">{d.name}</div>
                    <div className="dest-country">{d.country}</div>
                    <div className="dest-stars">{'★'.repeat(d.stars)}{'☆'.repeat(5 - d.stars)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Activities ── */}
      <section id="activities" className="section">
        <div className="container">
          <div className="section-header split-header">
            <div>
              <div className="section-label">Experiences</div>
              <h2 className="section-heading">Unforgettable activities</h2>
            </div>
            <p className="section-body">
              From scuba diving the Great Barrier Reef to hot air balloons over
              Cappadocia — curated experiences for every type of traveller.
            </p>
          </div>
          <div className="act-grid">
            {activitiesLoading && <p>Loading activities...</p>}
            {activities.map(a => (
              <div key={a.id} className="act-card">
                <div
                  className="act-photo"
                  style={{
                    backgroundImage: `url(${a.img})`,
                    backgroundColor: a.fallback,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="act-price">{a.price}</div>
                </div>
                <div className="act-body">
                  <div className="act-name">{a.name}</div>
                  <div className="act-meta">
                    <span>📍 {a.location}</span>
                    <span>⏱ {a.duration}</span>
                  </div>
                  <button className="act-btn">Book experience</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="section bg-alt">
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">Simple process</div>
            <h2 className="section-heading">Plan your trip in 3 steps</h2>
            <p className="section-body">No travel agent needed. Go from idea to boarding pass in minutes.</p>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={s.n} className="step-card">
                <div className="step-num">{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
                {i < steps.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>

          <div className="how-visual">
            <div className="how-card">
              <div className="how-card-header">
                <span className="how-card-dot green" />
                <span className="how-card-dot amber" />
                <span className="how-card-dot red"   />
                <span className="how-card-title">Your reservation</span>
              </div>
              {[
                ['Destination', 'Bali, Indonesia'],
                ['Hotel', 'Alaya Resort Ubud ★★★★★'],
                ['Check-in', 'May 14, 2025'],
                ['Check-out', 'May 21, 2025'],
                ['Guests', '2 adults'],
              ].map(([l, v]) => (
                <div key={l} className="how-row">
                  <span className="how-lbl">{l}</span>
                  <span className="how-val">{v}</span>
                </div>
              ))}
              <div className="how-divider" />
              <div className="how-row total"><span>Total</span><span className="how-total">$1,204</span></div>
              <button className="how-confirm-btn">Confirm &amp; Pay</button>
            </div>
            <div className="how-side">
              <div className="how-badge confirmed"><span>✓</span> Booking confirmed</div>
              <div className="how-badge pdf"><span>📄</span> Invoice sent to your email</div>
              <div className="how-badge qr"><span>⬛</span> QR code generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="section alt">
        <div className="container">
          <div className="features-row">
            <div>
              <div className="section-label">Why SkyRes</div>
              <h2 className="section-heading">Everything in one place</h2>
              <div className="features-list">
                {[
                  { icon: '🔐', title: 'Secure by default',    desc: 'JWT auth, BCrypt hashing, and role-based access control on every endpoint.' },
                  { icon: '🗺️', title: 'Interactive maps',     desc: 'Browse hotels and activities on a live map. Filter by distance, price, and rating.' },
                  { icon: '🤖', title: 'AI recommendations',   desc: 'The platform adapts to your budget, season preference, and travel style.' },
                  { icon: '📑', title: 'Instant PDF invoices', desc: 'Every confirmed booking generates a downloadable invoice with a QR code.' },
                ].map(f => (
                  <div key={f.title} className="feat-item">
                    <div className="feat-icon-wrap">{f.icon}</div>
                    <div><h4>{f.title}</h4><p>{f.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="features-visual">
              <div className="visual-card">
                <div className="visual-number">98%</div>
                <div className="visual-label">Booking success rate</div>
                <div className="visual-bar"><div className="visual-bar-fill" style={{ width: '98%' }} /></div>
              </div>
              <div className="visual-card">
                <div className="visual-number">4.9</div>
                <div className="visual-label">Customer satisfaction</div>
                <div className="visual-bar"><div className="visual-bar-fill" style={{ width: '97%' }} /></div>
              </div>
              <div className="visual-card span-2">
                <div className="visual-label" style={{ marginBottom: 14 }}>Recent bookings</div>
                {[
                  { label: 'Hotel Burj Al Arab · Dubai', sub: 'Check-in Apr 30', amt: '$420', cls: 'dot-green' },
                  { label: 'Safari Maasai Mara · Kenya', sub: 'Check-in May 3',  amt: '$280', cls: 'dot-amber' },
                  { label: 'Ryokan Kyoto · Japan',       sub: 'Check-in May 7',  amt: '$195', cls: 'dot-blue'  },
                ].map(b => (
                  <div key={b.label} className="mini-booking">
                    <div className={`mini-dot ${b.cls}`} />
                    <div>
                      <div className="mini-booking-text">{b.label}</div>
                      <div className="mini-booking-sub">{b.sub}</div>
                    </div>
                    <div className="mini-booking-amt">{b.amt}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="section">
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">Travellers love us</div>
            <h2 className="section-heading">Real stories, real adventures</h2>
            <p className="section-body">Over 12,000 trips planned through SkyRes. Here's what some of them said.</p>
          </div>
          <div className="reviews-grid">
            {reviews.map(r => (
              <div key={r.id} className="review-card">
                <div className="review-stars">{'★'.repeat(r.stars)}</div>
                <p className="review-text">"{r.text}"</p>
                <div className="review-author">
                  <div className="review-avatar" style={{ background: r.color }}>{r.avatar}</div>
                  <div>
                    <div className="review-name">{r.name}</div>
                    <div className="review-country">{r.country}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section id="team" className="section bg-alt">
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">Team of 4</div>
            <h2 className="section-heading">Each person, one domain</h2>
            <p className="section-body">
              Clear ownership, no overlap. Every member ships a full vertical —
              backend, frontend, and database included.
            </p>
          </div>
          <div className="team-grid">
            {team.map(m => (
              <div key={m.num} className={`team-card ${m.cls}`}>
                <div className="team-num">{m.num}</div>
                <div className="team-role-title">{m.role}</div>
                <p className="team-desc">{m.desc}</p>
                <ul className="team-checklist">
                  {m.items.map(i => (
                    <li key={i}><span className="chk">✓</span>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section id="tech" className="section alt">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Technology</div>
            <h2 className="section-heading">Built on a solid stack</h2>
            <p className="section-body">
              Industry-standard tools chosen for reliability and learning value.
              Spring Boot on port 8080, React on 5173 — two terminals and you're running.
            </p>
          </div>
          <div className="tech-pills">
            {tech.map(t => (
              <div key={t.name} className="tech-pill">
                <span className="tech-pill-icon">{t.icon}</span>
                <div>
                  <div className="tech-pill-name">{t.name}</div>
                  <div className="tech-pill-cat">{t.cat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to start building?</h2>
          <p>Push to GitHub, each person picks their branch, and the platform comes to life.</p>
          <div className="cta-btns">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="btn-white">Clone on GitHub →</a>
            <a href="#team" className="btn-ghost">View team modules</a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-logo">
          <div className="footer-logo-mark">✈</div>
          SkyRes
        </div>
        <ul className="footer-links">
          <li><a href="#destinations">Destinations</a></li>
          <li><a href="#activities">Activities</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#team">Team</a></li>
          <li><a href="#tech">Stack</a></li>
        </ul>
        <span className="footer-copy">Smart Tourism Platform — Spring Boot · React · MySQL</span>
      </footer>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}
