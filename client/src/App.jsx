import { useEffect, useState } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const images = [
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85',
]

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (options.token) headers.Authorization = `Bearer ${options.token}`
  let response
  try {
    response = await fetch(`${API}${path}`, { ...options, headers })
  } catch {
    throw new Error('The booking service is offline. Start the server and try again.')
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data
}

function Header({ user, signOut }) {
  return <header className="nav"><a className="brand" href="#/"><span className="brand-mark">B</span> Bellcorp <em>House</em></a><nav><a href="#/rooms">Rooms</a>{user && <a href="#/bookings">My stays</a>}{user ? <button className="text-button" onClick={signOut}>Sign out</button> : <a href="#/login">Sign in</a>}</nav></header>
}

function Card({ room }) {
  return <a className="room-card" href={`#/rooms/${room.id}`}><div className="room-image"><img src={room.image_url} alt={room.room_type} /><span>Room {room.room_number}</span></div><div className="room-copy"><div><p className="eyebrow">{room.room_type}</p><h3>Quietly considered</h3></div><strong>₹{Number(room.price_per_night).toLocaleString('en-IN')}<small> / night</small></strong></div></a>
}

function Home({ rooms }) {
  return <><section className="hero"><div className="hero-image" /><div className="hero-content"><p className="eyebrow light">A stay with room to breathe</p><h1>Come away<br /><i>well.</i></h1><p className="hero-lede">A small collection of considered rooms, tucked between the city and the sea.</p><a className="button" href="#/rooms">Explore the rooms <b>↗</b></a></div><div className="hero-note">01 <span /> 04<br /><b>Est. 1987</b></div></section><section className="intro"><div><p className="eyebrow">The Bellcorp feeling</p><h2>Quiet luxury,<br /><i>naturally.</i></h2></div><p>We believe the best stays are felt more than seen. Soft light, thoughtful details, and the freedom to make the day yours.</p></section><section className="section"><div className="section-head"><div><p className="eyebrow">Stay awhile</p><h2>Rooms made for <i>rest.</i></h2></div><a href="#/rooms" className="arrow-link">View all rooms ↗</a></div><div className="room-grid">{rooms.slice(0, 3).map((room) => <Card key={room.id} room={room} />)}</div></section></>
}

function Rooms({ rooms }) {
  return <main className="page"><div className="page-heading"><p className="eyebrow">Find your room</p><h1>Stay <i>beautifully.</i></h1><p>Four distinct spaces. One easy rhythm.</p></div><div className="room-grid full-grid">{rooms.map((room) => <Card key={room.id} room={room} />)}</div></main>
}

function Auth({ type, onAuth }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault(); setError('')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    setBusy(true)
    try { onAuth(await api(`/auth/${type}`, { method: 'POST', body: JSON.stringify(form) })); window.location.hash = '#/rooms' } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <main className="auth-page"><div className="auth-visual"><p className="eyebrow light">Bellcorp House</p><h1>Make yourself<br /><i>at home.</i></h1></div><form className="auth-form" onSubmit={submit}><p className="eyebrow">Your next chapter</p><h2>{type === 'login' ? 'Welcome back.' : 'Join us.'}</h2>{type === 'register' && <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>}<label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Password<input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>{error && <p className="form-error">{error}</p>}<button className="button wide" disabled={busy}>{busy ? 'Please wait...' : type === 'login' ? 'Sign in' : 'Create account'} <b>↗</b></button><p className="switch-auth">{type === 'login' ? 'New to Bellcorp?' : 'Already a member?'} <a href={`#/${type === 'login' ? 'register' : 'login'}`}>{type === 'login' ? 'Create an account' : 'Sign in'}</a></p></form></main>
}

function Detail({ room, user }) {
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' }); const [available, setAvailable] = useState(null); const [booking, setBooking] = useState(null); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
  function changeDate(field, value) { setDates((current) => ({ ...current, [field]: value })); setAvailable(null); setMessage('') }
  async function check() { setMessage(''); if (!dates.checkIn || !dates.checkOut || dates.checkOut <= dates.checkIn) return setMessage('Choose a check-out date after check-in.'); setBusy(true); try { setAvailable((await api(`/rooms/${room.id}/availability?checkIn=${dates.checkIn}&checkOut=${dates.checkOut}`)).available) } catch (err) { setMessage(err.message) } finally { setBusy(false) } }
  async function book() { if (!user) return (window.location.hash = '#/login'); setBusy(true); try { const result = await api('/bookings', { method: 'POST', token: user.token, body: JSON.stringify({ roomId: room.id, ...dates }) }); setBooking(result.booking); setAvailable(true); setMessage('Your stay is confirmed.') } catch (err) { setAvailable(false); setMessage(err.message) } finally { setBusy(false) } }
  const nights = booking ? Math.round((Date.parse(`${booking.check_out_date}T00:00:00Z`) - Date.parse(`${booking.check_in_date}T00:00:00Z`)) / 86400000) : 0
    return <main className="detail-page"><a className="back-link" href="#/rooms">← All rooms</a><div className="detail-grid"><div className="detail-photo"><img src={room.image_url} alt={room.room_type} /><span>Room {room.room_number}</span></div><div className="detail-copy"><p className="eyebrow">{room.room_type}</p><h1>A little more<br /><i>space to be.</i></h1><p className="description">{room.description}</p><div className="stats"><span><b>Up to {room.capacity}</b> guests</span><span><b>₹{Number(room.price_per_night).toLocaleString('en-IN')}</b> per night</span></div><div className="booking-panel"><p className="eyebrow">Check availability</p><div className="date-row"><label>Check in<input type="date" value={dates.checkIn} onChange={(e) => changeDate('checkIn', e.target.value)} /></label><label>Check out<input type="date" value={dates.checkOut} onChange={(e) => changeDate('checkOut', e.target.value)} /></label></div><button className="button wide" onClick={available ? book : check} disabled={busy}>{busy ? 'Checking...' : available ? 'Confirm booking' : 'Check dates'} <b>↗</b></button>{available === true && <p className="success">Available for your dates.</p>}{message && <p className={available === false ? 'form-error' : 'success'}>{message}</p>}{booking && <div className="confirmation"><h3>Booking confirmed</h3><p><b>Booking ID</b> {booking.id}</p><p><b>Guest</b> {booking.guest_name}</p><p><b>Room</b> {room.room_number} · {room.room_type}</p><p><b>Dates</b> {booking.check_in_date} to {booking.check_out_date} · {nights} night{nights === 1 ? '' : 's'}</p><p><b>Rate</b> ₹{Number(booking.room.price_per_night).toLocaleString('en-IN')} / night</p><p><b>Total</b> ₹{Number(booking.total_amount).toLocaleString('en-IN')}</p><p><b>Status</b> {booking.status}</p></div>}</div></div></div></main>
}

function Bookings({ user }) { const [items, setItems] = useState([]); const [error, setError] = useState(''); useEffect(() => { api('/bookings/my', { token: user.token }).then((data) => setItems(data.bookings)).catch((err) => setError(err.message)) }, [user.token]); return <main className="page"><div className="page-heading"><p className="eyebrow">Your private ledger</p><h1>My <i>stays.</i></h1></div>{error && <p className="form-error">{error}</p>}{!items.length && !error ? <div className="empty"><h2>No stays yet.</h2><p>Your next room is waiting.</p><a className="button" href="#/rooms">Explore rooms ↗</a></div> : <div className="booking-list">{items.map((item) => <article className="booking-item" key={item.id}><img src={item.image_url} alt="" /><div><p className="eyebrow">Room {item.room_number} · {item.room_type}</p><h3>{item.check_in_date} <span>to</span> {item.check_out_date}</h3><p className="booking-total">₹{Number(item.total_amount).toLocaleString('en-IN')}</p><p className="booking-status">{item.status}</p></div></article>)}</div>}</main> }

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('bellcorp_user') || 'null')); const [rooms, setRooms] = useState([]); const [route, setRoute] = useState(window.location.hash.slice(1) || '/')
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.slice(1) || '/')
    window.addEventListener('hashchange', onHash)
    api('/rooms').then((data) => {
      setRooms(data.rooms)
      const requestedId = window.location.hash.match(/^#\/rooms\/(.+)$/)?.[1]
      const matchedRoom = data.rooms.find((item) => item.id === requestedId || item.room_number === requestedId)
      if (matchedRoom && matchedRoom.id !== requestedId) window.location.hash = `#/rooms/${matchedRoom.id}`
    }).catch(() => setRooms(images.map((image_url, index) => ({ id: String(index + 1), room_number: ['101', '202', '303', '404'][index], room_type: ['Coastal King', 'Garden Suite', 'Skyline Studio', 'Family Residence'][index], capacity: [2, 3, 2, 5][index], price_per_night: [2850, 3900, 3250, 4750][index], description: 'A calm, sunlit retreat with considered details and space to settle in.', image_url }))))
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  function auth(result) { setUser(result); localStorage.setItem('bellcorp_user', JSON.stringify(result)) } function signOut() { setUser(null); localStorage.removeItem('bellcorp_user'); window.location.hash = '#/' }
  const id = route.match(/^\/rooms\/(.+)$/)?.[1]; const room = rooms.find((item) => item.id === id); let content = route === '/' ? <Home rooms={rooms} /> : route === '/rooms' ? <Rooms rooms={rooms} /> : route === '/login' ? <Auth type="login" onAuth={auth} /> : route === '/register' ? <Auth type="register" onAuth={auth} /> : route === '/bookings' && user ? <Bookings user={user} /> : room ? <Detail room={room} user={user} /> : <main className="page"><div className="empty"><h2>We couldn't find that page.</h2><a className="button" href="#/">Return home ↗</a></div></main>
  return <><Header user={user} signOut={signOut} />{content}<footer><span>Bellcorp House</span><span>Stay curious · Stay awhile</span><span>© 2026</span></footer></>
}

export default App
