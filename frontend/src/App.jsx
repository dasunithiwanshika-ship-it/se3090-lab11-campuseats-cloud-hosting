import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiRequest } from './api'
import './App.css'

const categories = ['All', 'Meals', 'Snacks', 'Drinks']

const currency = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
})

const dateTime = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem('campusEatsCart') || '[]')
    return Array.isArray(stored)
      ? stored.filter(
          (item) => Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.quantity) && item.quantity > 0,
        )
      : []
  } catch {
    return []
  }
}

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <path d="m5 12 14 0m-6-6 6 6-6 6" />,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    flame: <path d="M12 2c1 4 4 6 4 10a6 6 0 1 1-12 0c0-3 2-6 4-8 0 3 2 4 4-2Z" />,
    leaf: <path d="M11 20A7 7 0 0 1 4 13C4 7 11 3 20 3c0 9-4 17-9 17Zm0 0v-7" />,
    minus: <path d="M5 12h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></>,
    shield: <path d="M12 3s8 3 8 9c0 5-5 9-8 10-3-1-8-5-8-10 0-6 8-9 8-9Z" />,
    trash: <><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7" /><path d="M10 11v5m4-5v5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
  }

  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name] || paths.arrow}
    </svg>
  )
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M3 17h18" />
        <path d="M5 17c0-5 3.5-9 7-9s7 4 7 9" />
        <path d="M12 5v3" />
        <circle cx="12" cy="4" r="1" />
      </svg>
    </span>
  )
}

function FoodArt({ item }) {
  // Rich culinary vector styling tailored to each dish ID
  const palettes = [
    { bg: '#fef3c7', main: '#d97706', accent: '#059669', rim: '#b45309' }, // Chicken Rice
    { bg: '#ecfdf5', main: '#059669', accent: '#d97706', rim: '#047857' }, // Veg Rice
    { bg: '#ffedd5', main: '#ea580c', accent: '#059669', rim: '#c2410c' }, // Chicken Kottu
    { bg: '#f0fdf4', main: '#16a34a', accent: '#ea580c', rim: '#15803d' }, // Veg Kottu
    { bg: '#fef9c3', main: '#ca8a04', accent: '#dc2626', rim: '#a16207' }, // Chicken Sandwich
    { bg: '#fef3c7', main: '#d97706', accent: '#16a34a', rim: '#b45309' }, // Veg Roll
    { bg: '#fae8ff', main: '#a855f7', accent: '#9333ea', rim: '#7e22ce' }, // Milk Tea
    { bg: '#ecfdf5', main: '#10b981', accent: '#f59e0b', rim: '#047857' }, // Lime Juice
  ]
  const p = palettes[(item.id - 1) % palettes.length] || palettes[0]

  if (item.category === 'Drinks') {
    return (
      <svg viewBox="0 0 320 200" role="img" aria-label={`${item.name} illustration`}>
        <defs>
          <linearGradient id={`drinkGrad-${item.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.main} stopOpacity="0.75" />
            <stop offset="100%" stopColor={p.rim} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <rect width="320" height="200" rx="20" fill={p.bg} />
        <circle cx="160" cy="110" r="75" fill="#ffffff" opacity="0.6" />
        {/* Glass cup */}
        <path d="M120 54 L132 165 C133 172, 140 176, 148 176 L172 176 C180 176, 187 172, 188 165 L200 54 Z" fill={`url(#drinkGrad-${item.id})`} stroke="#334155" strokeWidth="4" />
        {/* Drink liquid surface */}
        <ellipse cx="160" cy="74" rx="34" ry="7" fill="#ffffff" opacity="0.4" />
        {/* Straw */}
        <path d="M168 30 L182 18 C185 15, 192 18, 190 24 L170 120" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
        {/* Garnish (lemon or mint) */}
        <circle cx="132" cy="56" r="16" fill={p.accent} opacity="0.9" />
        <path d="M132 40 L132 72 M116 56 L148 56" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
        {/* Bubbles */}
        <circle cx="152" cy="120" r="4" fill="#ffffff" opacity="0.6" />
        <circle cx="166" cy="140" r="5" fill="#ffffff" opacity="0.6" />
        <circle cx="148" cy="150" r="3" fill="#ffffff" opacity="0.6" />
      </svg>
    )
  }

  if (item.category === 'Snacks') {
    return (
      <svg viewBox="0 0 320 200" role="img" aria-label={`${item.name} illustration`}>
        <defs>
          <linearGradient id={`snackGrad-${item.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={p.main} />
            <stop offset="100%" stopColor={p.rim} />
          </linearGradient>
        </defs>
        <rect width="320" height="200" rx="20" fill={p.bg} />
        <circle cx="160" cy="105" r="75" fill="#ffffff" opacity="0.6" />
        {/* Plate */}
        <ellipse cx="160" cy="148" rx="100" ry="24" fill="#e2e8f0" />
        <ellipse cx="160" cy="144" rx="90" ry="20" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
        {/* Roll / Sandwich shape */}
        <path d="M95 130 C90 100, 120 75, 160 75 C200 75, 230 100, 225 130 C220 142, 190 148, 160 148 C130 148, 100 142, 95 130 Z" fill={`url(#snackGrad-${item.id})`} stroke="#334155" strokeWidth="4" />
        {/* Filling layers */}
        <path d="M102 124 Q160 136 218 124" stroke={p.accent} strokeWidth="6" strokeLinecap="round" />
        <path d="M108 116 Q160 128 212 116" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
        {/* Sesame seeds */}
        <ellipse cx="145" cy="94" rx="3" ry="1.5" fill="#ffffff" />
        <ellipse cx="162" cy="88" rx="3" ry="1.5" fill="#ffffff" />
        <ellipse cx="178" cy="96" rx="3" ry="1.5" fill="#ffffff" />
      </svg>
    )
  }

  // Meals (Rice & Kottu bowls)
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label={`${item.name} illustration`}>
      <defs>
        <linearGradient id={`mealGrad-${item.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.main} />
          <stop offset="100%" stopColor={p.rim} />
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="20" fill={p.bg} />
      <circle cx="160" cy="100" r="75" fill="#ffffff" opacity="0.6" />
      {/* Ceramic bowl */}
      <ellipse cx="160" cy="156" rx="96" ry="18" fill="#e2e8f0" />
      <path d="M72 108 C75 152, 115 168, 160 168 C205 168, 245 152, 248 108 Z" fill="#ffffff" stroke="#334155" strokeWidth="4" />
      {/* Delicious Food Heap */}
      <path d="M80 108 C90 70, 130 52, 160 52 C190 52, 230 70, 240 108 Z" fill={`url(#mealGrad-${item.id})`} stroke="#334155" strokeWidth="3" />
      {/* Curry / Toppings */}
      <circle cx="135" cy="85" r="14" fill={p.accent} />
      <circle cx="168" cy="76" r="12" fill="#ef4444" />
      <circle cx="188" cy="88" r="13" fill="#15803d" />
      {/* Steam lines */}
      <path d="M148 38 Q144 26 148 16" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M165 34 Q169 22 165 12" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  )
}

function Header({ cartCount, onCart, onHome, onMenu, onOrders, onAccount, user, currentView }) {
  return (
    <header className="site-header">
      <div className="header-left">
        <button className="brand" type="button" onClick={onHome} aria-label="CampusEats home">
          <BrandMark />
          <span>CampusEats</span>
        </button>
        <span className="student-badge" title="Student Submission">
          <span className="student-badge-dot" />
          IT24104355
        </span>
      </div>

      <nav className="site-nav" aria-label="Primary navigation">
        <button
          type="button"
          className={`nav-link ${currentView === 'menu' ? 'active' : ''}`}
          onClick={onMenu}
        >
          Menu
        </button>
        <button
          type="button"
          className={`nav-link ${currentView === 'orders' ? 'active' : ''}`}
          onClick={onOrders}
        >
          My Orders
        </button>
      </nav>

      <div className="header-actions">
        <button className="account-button" type="button" onClick={onAccount}>
          <Icon name="user" size={17} />
          <span>{user ? user.name.split(' ')[0] : 'Sign in'}</span>
        </button>
        <button
          className="cart-button"
          type="button"
          onClick={onCart}
          aria-label={`Open cart with ${cartCount} items`}
        >
          <Icon name="bag" size={19} />
          <span>Cart</span>
          <span className="cart-count">{cartCount}</span>
        </button>
      </div>
    </header>
  )
}

function MenuCard({ item, onAdd }) {
  const isVegetarian = item.name.toLowerCase().includes('vegetable')
  const isPopular = item.name.toLowerCase().includes('chicken')

  return (
    <article className="menu-card">
      <div className="food-art-wrapper">
        <FoodArt item={item} />
        {isVegetarian ? (
          <span className="card-tag veg">
            <Icon name="leaf" size={12} /> Veg
          </span>
        ) : isPopular ? (
          <span className="card-tag popular">
            <Icon name="flame" size={12} /> Popular
          </span>
        ) : (
          <span className="card-tag">{item.category}</span>
        )}
        <span className="prep-time">
          <Icon name="clock" size={12} /> 10-15m
        </span>
      </div>

      <div className="menu-card-body">
        <span className="category-meta">{item.category}</span>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="menu-card-footer">
          <span className="menu-price">{currency.format(item.price)}</span>
          <button
            type="button"
            className="add-button"
            onClick={() => onAdd(item)}
            aria-label={`Add ${item.name} to cart`}
          >
            <Icon name="plus" size={16} /> Add to cart
          </button>
        </div>
      </div>
    </article>
  )
}

function MenuSkeletons() {
  return (
    <div className="menu-grid" aria-label="Loading campus menu" aria-busy="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="menu-card skeleton-card" key={index}>
          <div className="skeleton artwork-skeleton" />
          <div className="menu-card-body">
            <span className="skeleton short-line" />
            <span className="skeleton title-line" />
            <span className="skeleton text-line" />
            <span className="skeleton text-line small" />
          </div>
        </div>
      ))}
    </div>
  )
}

function CartDrawer({ items, isOpen, isSubmitting, onClose, onExplore, onQuantity, onRemove, onCheckout }) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <>
      <button
        className={`scrim ${isOpen ? 'visible' : ''}`}
        type="button"
        onClick={onClose}
        aria-label="Close cart backdrop"
        tabIndex={isOpen ? 0 : -1}
      />
      <aside
        className={`cart-drawer ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
        aria-label="Campus food cart"
        role="dialog"
        aria-modal="true"
        inert={!isOpen ? '' : undefined}
      >
        <div className="drawer-header">
          <div>
            <span className="eyebrow">Your order</span>
            <h2>Campus Cart</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close cart">
            <Icon name="close" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-cart">
            <span className="empty-cart-icon">
              <Icon name="bag" size={32} />
            </span>
            <h3>Your cart is empty</h3>
            <p>Select delicious dishes from the menu and they will appear here ready for pickup.</p>
            <button type="button" className="primary-button" onClick={onExplore}>
              Explore Menu
            </button>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {items.map((item) => (
                <div className="cart-line" key={item.id}>
                  <div className="cart-line-art">
                    <FoodArt item={item} />
                  </div>
                  <div className="cart-line-copy">
                    <h3>{item.name}</h3>
                    <span className="cart-line-price">{currency.format(item.price)}</span>
                    <div className="quantity-row">
                      <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          onClick={() => onQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Icon name="minus" size={14} />
                        </button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 20}
                          aria-label={`Increase ${item.name}`}
                        >
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                      <button
                        className="remove-button"
                        type="button"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-footer">
              <div className="subtotal-row">
                <span>Subtotal</span>
                <strong>{currency.format(subtotal)}</strong>
              </div>
              <p className="pickup-info-note">
                <Icon name="shield" size={15} /> Pay on pickup · Cash or Card at canteen counter
              </p>
              <button
                className="primary-button checkout-button"
                type="button"
                onClick={onCheckout}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting order…' : 'Place Pickup Order'}
                {!isSubmitting && <Icon name="arrow" />}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

function AuthModal({ mode, isOpen, error, isSubmitting, onClose, onMode, onSubmit, user, onLogout }) {
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})

  const update = (event) => {
    const { name, value } = event.target
    setFields((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (mode === 'register' && fields.name.trim().length < 2) nextErrors.name = 'Please enter at least 2 characters.'
    if (!/^\S+@\S+\.\S+$/.test(fields.email)) nextErrors.email = 'Enter a valid campus email address.'
    if (fields.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.'
    if (mode === 'register' && fields.password !== fields.confirmPassword)
      nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSubmit(fields)
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" />
        </button>

        {user ? (
          <div className="account-panel">
            <span className="account-avatar">
              <Icon name="user" size={32} />
            </span>
            <span className="eyebrow">Signed In</span>
            <h2 id="auth-title">{user.name}</h2>
            <p>{user.email}</p>
            <button className="secondary-button" type="button" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <BrandMark />
              <h2 id="auth-title">{mode === 'login' ? 'Sign In to CampusEats' : 'Create an Account'}</h2>
              <p className="modal-intro">
                {mode === 'login'
                  ? 'Sign in to place orders and view your campus pickup history.'
                  : 'Register your student account to start ordering ahead.'}
              </p>
            </div>

            <div className="auth-tabs" role="tablist" aria-label="Account action">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                className={mode === 'login' ? 'active' : ''}
                onClick={() => onMode('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                className={mode === 'register' ? 'active' : ''}
                onClick={() => onMode('register')}
              >
                Register
              </button>
            </div>

            <form onSubmit={submit} className="auth-form" noValidate>
              {mode === 'register' && (
                <div className="form-field">
                  <label htmlFor="auth-name">Full Name</label>
                  <input
                    id="auth-name"
                    name="name"
                    value={fields.name}
                    onChange={update}
                    autoComplete="name"
                    placeholder="Kasun Perera"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
              )}

              <div className="form-field">
                <label htmlFor="auth-email">Email Address</label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  value={fields.email}
                  onChange={update}
                  autoComplete="email"
                  placeholder="student@sliit.lk"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  value={fields.password}
                  onChange={update}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="At least 8 characters"
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              {mode === 'register' && (
                <div className="form-field">
                  <label htmlFor="auth-confirm">Confirm Password</label>
                  <input
                    id="auth-confirm"
                    name="confirmPassword"
                    type="password"
                    value={fields.confirmPassword}
                    onChange={update}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                  />
                  {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                </div>
              )}

              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}

              <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}

function OrdersView({ orders, isLoading, error, onRetry, onMenu }) {
  return (
    <main className="orders-page">
      <div className="page-heading">
        <span className="eyebrow">Pickup History</span>
        <h1>My Orders</h1>
        <p>Review all your campus pickup orders, newest first.</p>
      </div>

      {isLoading ? (
        <div className="orders-list" aria-busy="true">
          {[1, 2, 3].map((item) => (
            <div className="order-card order-skeleton skeleton" key={item} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Could not retrieve orders"
          copy={error}
          action="Try again"
          onAction={onRetry}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders placed yet"
          copy="You have not placed any orders yet. Choose your meal from the menu and order ahead!"
          action="Explore Menu"
          onAction={onMenu}
        />
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-header">
                <div>
                  <span className="order-num-label">Order Number</span>
                  <strong className="order-num">#{String(order.id).padStart(4, '0')}</strong>
                </div>
                <span className="status-pill">
                  <Icon name="check" size={14} /> {order.status}
                </span>
              </div>

              <div className="order-meta">
                <span>{dateTime.format(new Date(order.createdAtUtc))}</span>
                <span>Payment: {order.paymentMethod}</span>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div className="order-item-row" key={`${order.id}-${item.menuItemId}`}>
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <strong>{currency.format(item.lineTotal)}</strong>
                  </div>
                ))}
              </div>

              <div className="order-total-row">
                <span>Total Amount</span>
                <strong>{currency.format(order.total)}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

function EmptyState({ title, copy, action, onAction }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <BrandMark />
      </span>
      <h2>{title}</h2>
      <p>{copy}</p>
      <button className="primary-button" type="button" onClick={onAction}>
        {action}
      </button>
    </div>
  )
}

function Confirmation({ order, onOrders, onMenu }) {
  return (
    <main className="confirmation-page">
      <div className="confirmation-card">
        <span className="success-mark">
          <Icon name="check" size={38} />
        </span>
        <span className="eyebrow">Order Confirmed</span>
        <h1>Lunch is Ready for Prep!</h1>
        <p>
          Your pickup order <strong>#{String(order.id).padStart(4, '0')}</strong> has been placed.
          Please pay <strong>{currency.format(order.total)}</strong> at the canteen counter upon collection.
        </p>
        <div className="confirmation-actions">
          <button className="primary-button" type="button" onClick={onOrders}>
            View My Orders
          </button>
          <button className="secondary-button" type="button" onClick={onMenu}>
            Back to Menu
          </button>
        </div>
      </div>
    </main>
  )
}

function App() {
  const [menu, setMenu] = useState([])
  const [menuState, setMenuState] = useState({ loading: true, error: '' })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState(readCart)
  const [cartOpen, setCartOpen] = useState(false)
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authState, setAuthState] = useState({ loading: false, error: '' })
  const [authIntent, setAuthIntent] = useState(null)
  const [view, setView] = useState('menu')
  const [orders, setOrders] = useState([])
  const [ordersState, setOrdersState] = useState({ loading: false, error: '' })
  const [checkoutState, setCheckoutState] = useState({ loading: false, error: '' })
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [announcement, setAnnouncement] = useState('')

  const loadMenu = useCallback(async () => {
    setMenuState({ loading: true, error: '' })
    try {
      const data = await apiRequest('/api/menu')
      const items = Array.isArray(data) ? data : []
      setMenu(items)
      const menuIds = new Set(items.map((item) => item.id))
      setCart((current) =>
        current
          .filter((line) => menuIds.has(line.id))
          .map((line) => ({ ...line, quantity: Math.min(20, line.quantity) })),
      )
      setMenuState({ loading: false, error: '' })
    } catch (error) {
      setMenuState({ loading: false, error: error.message })
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMenu()
  }, [loadMenu])

  useEffect(() => {
    localStorage.setItem('campusEatsCart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setCartOpen(false)
        setAuthOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const cartItems = useMemo(
    () =>
      cart
        .map((line) => {
          const item = menu.find((candidate) => candidate.id === line.id)
          return item ? { ...item, quantity: line.quantity } : null
        })
        .filter(Boolean),
    [cart, menu],
  )

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const filteredMenu = useMemo(() => {
    const term = search.trim().toLowerCase()
    return menu.filter((item) => {
      const inCategory = category === 'All' || item.category === category
      const matches = !term || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(term)
      return inCategory && matches
    })
  }, [menu, search, category])

  const announce = (message) => {
    setAnnouncement('')
    window.setTimeout(() => setAnnouncement(message), 20)
  }

  const showMenu = () => {
    setView('menu')
    setCartOpen(false)
    window.setTimeout(() => document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' }), 0)
  }

  const showHome = () => {
    setView('menu')
    setCartOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addToCart = (item) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === item.id)
      if (existing) {
        return current.map((line) =>
          line.id === item.id ? { ...line, quantity: Math.min(20, line.quantity + 1) } : line,
        )
      }
      return [...current, { id: item.id, quantity: 1 }]
    })
    announce(`${item.name} added to your cart.`)
  }

  const changeQuantity = (id, quantity) => {
    if (quantity < 1) {
      setCart((current) => current.filter((line) => line.id !== id))
      return
    }
    setCart((current) =>
      current.map((line) => (line.id === id ? { ...line, quantity: Math.min(20, quantity) } : line)),
    )
  }

  const loadOrders = useCallback(
    async (activeToken = token) => {
      if (!activeToken) return
      setOrdersState({ loading: true, error: '' })
      try {
        const data = await apiRequest('/api/orders/me', { token: activeToken })
        setOrders(Array.isArray(data) ? data : [])
        setOrdersState({ loading: false, error: '' })
      } catch (error) {
        if (error.status === 401) {
          setToken(null)
          setUser(null)
          setView('menu')
          setAuthIntent('orders')
          setAuthOpen(true)
          setAuthState({ loading: false, error: 'Your session has expired. Please sign in again.' })
        } else {
          setOrdersState({ loading: false, error: error.message })
        }
      }
    },
    [token],
  )

  const showOrders = () => {
    if (!user) {
      setAuthMode('login')
      setAuthIntent('orders')
      setAuthOpen(true)
      setAuthState({ loading: false, error: 'Please sign in to view your past orders.' })
      return
    }
    setView('orders')
    loadOrders()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitAuth = async (fields) => {
    setAuthState({ loading: true, error: '' })
    const path = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body =
      authMode === 'login'
        ? { email: fields.email.trim(), password: fields.password }
        : { name: fields.name.trim(), email: fields.email.trim(), password: fields.password }

    try {
      const data = await apiRequest(path, { method: 'POST', body: JSON.stringify(body) })
      setToken(data.token)
      setUser(data.user)
      setAuthOpen(false)
      setAuthState({ loading: false, error: '' })

      if (authIntent === 'orders') {
        setView('orders')
        loadOrders(data.token)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (authIntent === 'checkout') {
        setCartOpen(true)
      }
      setAuthIntent(null)
      announce(`Welcome, ${data.user.name}.`)
    } catch (error) {
      setAuthState({ loading: false, error: error.message })
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setOrders([])
    setView('menu')
    setAuthOpen(false)
    setAuthIntent(null)
    announce('You have been signed out.')
  }

  const checkout = async () => {
    if (!user || !token) {
      setCartOpen(false)
      setAuthMode('login')
      setAuthIntent('checkout')
      setAuthOpen(true)
      setAuthState({ loading: false, error: 'Sign in to confirm your pickup order.' })
      return
    }
    if (cartItems.length === 0) return
    setCheckoutState({ loading: true, error: '' })

    try {
      const order = await apiRequest('/api/orders', {
        method: 'POST',
        token,
        body: JSON.stringify({
          items: cartItems.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
        }),
      })
      setConfirmedOrder(order)
      setCart([])
      setCartOpen(false)
      setCheckoutState({ loading: false, error: '' })
      setView('confirmation')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      if (error.status === 401) {
        setToken(null)
        setUser(null)
        setCartOpen(false)
        setCheckoutState({ loading: false, error: '' })
        setAuthIntent('checkout')
        setAuthOpen(true)
        setAuthState({ loading: false, error: 'Your session has expired. Please sign in again.' })
      } else {
        setCheckoutState({ loading: false, error: error.message })
      }
    }
  }

  return (
    <div className="app-shell">
      <Header
        cartCount={cartCount}
        onCart={() => setCartOpen(true)}
        onHome={showHome}
        onMenu={showMenu}
        onOrders={showOrders}
        onAccount={() => {
          setAuthIntent(null)
          setAuthState({ loading: false, error: '' })
          setAuthOpen(true)
        }}
        user={user}
        currentView={view}
      />

      {view === 'orders' ? (
        <OrdersView
          orders={orders}
          isLoading={ordersState.loading}
          error={ordersState.error}
          onRetry={() => loadOrders()}
          onMenu={showMenu}
        />
      ) : view === 'confirmation' && confirmedOrder ? (
        <Confirmation order={confirmedOrder} onOrders={showOrders} onMenu={showMenu} />
      ) : (
        <main>
          <section className="hero-section">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="live-dot" /> Fresh on campus, every day
              </span>
              <h1>
                Fresh Flavours,<br />
                <em>Zero Queue.</em>
              </h1>
              <p>
                Skip the long cafeteria lines. Order your favourite meals, snacks, and drinks ahead of time and
                collect seamlessly between lectures at the SLIIT canteen counter.
              </p>
              <div className="hero-actions">
                <button className="primary-button" type="button" onClick={showMenu}>
                  Explore Menu <Icon name="arrow" />
                </button>
                <div className="hero-stats">
                  <span>
                    <strong>8</strong> signature items available today
                  </span>
                </div>
              </div>
            </div>

            <div className="hero-visual" aria-label="CampusEats culinary presentation">
              <div className="hero-card-glow" />
              <div className="hero-food-card">
                <FoodArt item={{ id: 1, name: 'Campus Biryani Bowl', category: 'Meals' }} />
              </div>
              <span className="floating-note note-one">
                <span className="badge-icon">
                  <Icon name="check" size={16} />
                </span>
                Ready in 10-15m
              </span>
              <span className="floating-note note-two">
                <span className="badge-icon">
                  <Icon name="leaf" size={16} />
                </span>
                Prepared Fresh Daily
              </span>
            </div>
          </section>

          <section className="benefit-strip" aria-label="CampusEats advantages">
            <div className="benefit-item">
              <span className="benefit-icon-box">
                <Icon name="clock" size={22} />
              </span>
              <div className="benefit-text">
                <strong>Fast Express Pickup</strong>
                <span>Order between classes and grab your food on time</span>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon-box">
                <Icon name="flame" size={22} />
              </span>
              <div className="benefit-text">
                <strong>Cooked Fresh to Order</strong>
                <span>Hot meals prepared on campus with quality ingredients</span>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon-box">
                <Icon name="shield" size={22} />
              </span>
              <div className="benefit-text">
                <strong>Flexible Counter Pay</strong>
                <span>No online card required; pay on pickup at the counter</span>
              </div>
            </div>
          </section>

          <section className="menu-section" id="menu">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Campus Dining Menu</span>
                <h2>Explore Today's Selection</h2>
              </div>
              <p>Wholesome Sri Lankan meals, quick student snacks, and chilled beverages.</p>
            </div>

            <div className="menu-toolbar">
              <label className="search-box">
                <span className="sr-only">Search menu items</span>
                <Icon name="search" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search dishes, drinks, or snacks…"
                />
                {search && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <Icon name="close" size={16} />
                  </button>
                )}
              </label>

              <div className="category-chips" aria-label="Filter dishes by category">
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`category-chip ${category === item ? 'active' : ''}`}
                    aria-pressed={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {menuState.loading ? (
              <MenuSkeletons />
            ) : menuState.error ? (
              <EmptyState
                title="Unable to load the menu"
                copy={menuState.error}
                action="Retry Connection"
                onAction={loadMenu}
              />
            ) : filteredMenu.length === 0 ? (
              <EmptyState
                title="No items found"
                copy="No dishes match your search or filter. Try a different query."
                action="Clear Filters"
                onAction={() => {
                  setSearch('')
                  setCategory('All')
                }}
              />
            ) : (
              <div className="menu-grid">
                {filteredMenu.map((item) => (
                  <MenuCard item={item} onAdd={addToCart} key={item.id} />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <BrandMark />
            <span>CampusEats</span>
          </div>
          <div className="footer-meta">
            <p>SE3090 — Software Engineering Frameworks</p>
            <span className="footer-student">Lab Practical 11 Submission · Student ID: IT24104355</span>
          </div>
        </div>
      </footer>

      <CartDrawer
        items={cartItems}
        isOpen={cartOpen}
        isSubmitting={checkoutState.loading}
        onClose={() => {
          setCartOpen(false)
          setCheckoutState({ loading: false, error: '' })
        }}
        onExplore={showMenu}
        onQuantity={changeQuantity}
        onRemove={(id) => setCart((current) => current.filter((line) => line.id !== id))}
        onCheckout={checkout}
      />

      {checkoutState.error && (
        <div className="error-toast" role="alert">
          <span>{checkoutState.error}</span>
          <button
            type="button"
            onClick={() => setCheckoutState({ loading: false, error: '' })}
            aria-label="Dismiss message"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      <AuthModal
        key={`${authOpen}-${authMode}-${user?.id ?? 'guest'}`}
        mode={authMode}
        isOpen={authOpen}
        error={authState.error}
        isSubmitting={authState.loading}
        onClose={() => {
          setAuthOpen(false)
          setAuthIntent(null)
        }}
        onMode={(nextMode) => {
          setAuthMode(nextMode)
          setAuthState({ loading: false, error: '' })
        }}
        onSubmit={submitAuth}
        user={user}
        onLogout={logout}
      />

      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>
    </div>
  )
}

export default App
