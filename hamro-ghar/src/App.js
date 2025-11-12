import React, { useState } from 'react';
import {
  Menu,
  X,
  Home,
  LogIn,
  User,
  MapPin,
  Search,
  Heart,
  Shield,
  Star,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';

// --- Mock data ---

const FEATURED_LISTINGS = [
  {
    id: 1,
    price: 'Rs. 45,000 / month',
    beds: 3,
    baths: 2,
    sqft: '1,450',
    address: 'Modern Apartment, Lazimpat',
    city: 'Kathmandu',
    image:
      'https://images.unsplash.com/photo-1600596542815-7b95e06b5f3c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    price: 'Rs. 35,000 / month',
    beds: 2,
    baths: 1,
    sqft: '1,020',
    address: 'Cozy Flat, Baneshwor',
    city: 'Kathmandu',
    image:
      'https://images.unsplash.com/photo-1590490359854-dfba19688d70?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    price: 'Rs. 60,000 / month',
    beds: 4,
    baths: 3,
    sqft: '1,900',
    address: 'Family House, Pokhara Lakeside',
    city: 'Pokhara',
    image:
      'https://images.unsplash.com/photo-1600585154340-0ef3c08c0632?auto=format&fit=crop&w=900&q=80',
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sara K.',
    role: 'Student',
    quote: 'HamroGhar made it easy to find a safe, clean flat near my college.',
  },
  {
    id: 2,
    name: 'Ram B.',
    role: 'Working professional',
    quote: 'Clean interface, no spam calls, just real homes that matched my budget.',
  },
  {
    id: 3,
    name: 'Anushka R.',
    role: 'First-time renter',
    quote: 'I liked how simple everything looked — blue and white, no confusion.',
  },
];

// --- App root ---

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'login' | 'register' | 'membership'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate('membership');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('home');
  };

  const renderPage = () => {
    if (isLoggedIn && currentPage === 'membership') {
      return (
        <MembershipPage
          onLogout={handleLogout}
          onGoHome={() => navigate('home')}
        />
      );
    }

    switch (currentPage) {
      case 'login':
        return (
          <AuthLayout>
            <LoginForm
              onLogin={handleLoginSuccess}
              onGoRegister={() => navigate('register')}
            />
          </AuthLayout>
        );
      case 'register':
        return (
          <AuthLayout>
            <RegistrationForm onGoLogin={() => navigate('login')} />
          </AuthLayout>
        );
      default:
        return (
          <HomePage
            onGoLogin={() => navigate('login')}
            onGoRegister={() => navigate('register')}
            onGoMembership={() =>
              isLoggedIn ? navigate('membership') : navigate('login')
            }
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header
        currentPage={currentPage}
        isLoggedIn={isLoggedIn}
        onNav={navigate}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <main className="flex-1 pt-16 lg:pt-20">{renderPage()}</main>
      <Footer onNav={navigate} />
    </div>
  );
}

export default App;

// --- Header / Navigation ---

const Header = ({
  currentPage,
  isLoggedIn,
  onNav,
  onLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => (
  <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100">
    <div className="max-w-6xl mx-auto px-4 lg:px-6 h-16 lg:h-20 flex items-center justify-between">
      <button
        type="button"
        onClick={() => onNav('home')}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          HG
        </div>
        <div className="text-left leading-tight">
          <p className="text-sm font-semibold text-slate-900">HamroGhar</p>
          <p className="text-[11px] text-blue-500">Blue &amp; White Homes</p>
        </div>
      </button>

      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <NavButton
          label="Home"
          active={currentPage === 'home'}
          onClick={() => onNav('home')}
        />
        <NavButton label="Buy" onClick={() => onNav('home')} />
        <NavButton label="Rent" onClick={() => onNav('home')} />
        <NavButton label="Agents" onClick={() => onNav('home')} />
      </nav>

      <div className="hidden md:flex items-center gap-3">
        {!isLoggedIn && (
          <>
            <button
              type="button"
              onClick={() => onNav('login')}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-700"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
            <button
              type="button"
              onClick={() => onNav('register')}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Join free
            </button>
          </>
        )}
        {isLoggedIn && (
          <>
            <button
              type="button"
              onClick={() => onNav('membership')}
              className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              Membership
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="text-sm text-slate-600 hover:text-red-500"
            >
              Logout
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden inline-flex items-center justify-center rounded-full border border-blue-100 p-2 text-slate-700"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </div>

    {isMobileMenuOpen && (
      <div className="md:hidden border-t border-blue-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => onNav('home')}
            className="text-sm text-slate-700 text-left"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNav('home')}
            className="text-sm text-slate-700 text-left"
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => onNav('home')}
            className="text-sm text-slate-700 text-left"
          >
            Rent
          </button>
          <button
            type="button"
            onClick={() => onNav('home')}
            className="text-sm text-slate-700 text-left"
          >
            Agents
          </button>

          <div className="pt-3 mt-2 border-t border-blue-50 flex flex-col gap-2">
            {!isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => onNav('login')}
                  className="w-full rounded-full border border-blue-200 py-2 text-sm font-medium text-blue-700"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => onNav('register')}
                  className="w-full rounded-full bg-blue-600 py-2 text-sm font-semibold text-white"
                >
                  Join free
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNav('membership')}
                  className="w-full rounded-full bg-blue-50 py-2 text-sm font-semibold text-blue-700"
                >
                  Membership
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full rounded-full border border-slate-200 py-2 text-sm text-slate-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )}
  </header>
);

const NavButton = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative px-1 py-0.5 text-sm ${
      active ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'
    }`}
  >
    {label}
    {active && (
      <span className="absolute left-0 -bottom-1 h-[2px] w-full rounded-full bg-blue-500" />
    )}
  </button>
);

// --- Home page ---

const HomePage = ({ onGoLogin, onGoRegister, onGoMembership }) => (
  <>
    <HeroSection onGoLogin={onGoLogin} />
    <FeaturedListings />
    <HighlightStrip />
    <Testimonials />
    <CallToAction
      onGoRegister={onGoRegister}
      onGoMembership={onGoMembership}
    />
  </>
);

// Hero C style: blue/white, left text + right stats card
const HeroSection = ({ onGoLogin }) => {
  const [query, setQuery] = useState('');

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100 mb-4">
            <Shield className="h-3.5 w-3.5" />
            Verified homes · No broker spam
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
            Find a home that
            <span className="text-blue-600"> feels like you.</span>
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-md">
            Search blue &amp; white modern homes, cozy apartments, and family spaces
            across the city in just a few clicks.
          </p>

          <div className="mt-6 rounded-2xl bg-white shadow-lg border border-blue-50 p-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50">
              <MapPin className="h-4 w-4 text-blue-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter area, city, or postcode"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
              Search homes
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>4.9/5 from 2k+ users</span>
            </div>
            <button
              type="button"
              onClick={onGoLogin}
              className="underline-offset-2 hover:underline text-blue-700"
            >
              Already a member? Sign in
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-3xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-12 h-32 w-32 rounded-full bg-white/10" />

            <p className="text-xs uppercase tracking-[0.2em] text-blue-100 mb-2">
              Live listings
            </p>
            <p className="text-3xl font-bold mb-1">12,430</p>
            <p className="text-xs text-blue-100 mb-6">
              properties available right now
            </p>

            <div className="space-y-3 text-xs">
              <HeroStat label="Average response time" value="15 min" />
              <HeroStat label="Homes viewed per user" value="9+" />
              <HeroStat label="Cities covered" value="32" />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                <AvatarInitial label="A" />
                <AvatarInitial label="B" />
                <AvatarInitial label="C" />
              </div>
              <p className="text-[11px] text-blue-100">
                “Clean, simple and fast. Found my flat in 2 days.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HeroStat = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
    <p className="text-[11px] text-blue-100">{label}</p>
    <p className="text-xs font-semibold">{value}</p>
  </div>
);

const AvatarInitial = ({ label }) => (
  <div className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-xs font-semibold text-blue-700 border border-blue-100">
    {label}
  </div>
);

// --- Highlight strip ---

const HighlightStrip = () => (
  <section className="bg-white border-y border-blue-50">
    <div className="max-w-6xl mx-auto px-4 py-6 grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
      <HighlightItem
        icon={<Shield className="h-4 w-4 text-blue-500" />}
        title="Verified listings"
        text="Every home is checked by our team before it goes live."
      />
      <HighlightItem
        icon={<Home className="h-4 w-4 text-blue-500" />}
        title="Student friendly"
        text="Filter by furnished rooms, Wi-Fi, and walking distance."
      />
      <HighlightItem
        icon={<Phone className="h-4 w-4 text-blue-500" />}
        title="Human support"
        text="Talk to a real person when you feel stuck."
      />
    </div>
  </section>
);

const HighlightItem = ({ icon, title, text }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
      {icon}
    </div>
    <div>
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-slate-500 text-xs">{text}</p>
    </div>
  </div>
);

// --- Featured listings (Card B style) ---

const FeaturedListings = () => (
  <section className="bg-slate-50 py-10">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-blue-500 uppercase">
            Featured
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Homes picked for you
          </h2>
        </div>
        <button
          type="button"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_LISTINGS.map((home) => (
          <ListingCard key={home.id} home={home} />
        ))}
      </div>
    </div>
  </section>
);

const ListingCard = ({ home }) => (
  <div className="group rounded-2xl border border-blue-50 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
    <div className="relative h-40 w-full overflow-hidden">
      <img
        src={home.image}
        alt={home.address}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            'https://placehold.co/600x400/eff6ff/0f172a?text=Home';
        }}
      />
      <button
        type="button"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm hover:bg-blue-50"
      >
        <Heart className="h-4 w-4" />
      </button>
      <span className="absolute left-3 bottom-3 rounded-full bg-blue-600/90 px-2.5 py-1 text-[11px] font-semibold text-white">
        {home.price}
      </span>
    </div>
    <div className="p-3.5 space-y-2">
      <p className="text-sm font-semibold text-slate-900 truncate">
        {home.address}
      </p>
      <p className="text-xs text-slate-500 flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5 text-blue-500" />
        {home.city}
      </p>
      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
        <span>{home.beds} beds</span>
        <span>{home.baths} baths</span>
        <span>{home.sqft} sqft</span>
      </div>
    </div>
  </div>
);

// --- Testimonials ---

const Testimonials = () => (
  <section className="bg-white py-12">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-blue-500 uppercase">
            Stories
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            What members say
          </h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-blue-50 bg-slate-50/60 p-4 shadow-sm"
          >
            <div className="flex items-center gap-1 mb-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <p className="text-sm text-slate-700 mb-4">“{item.quote}”</p>
            <p className="text-xs font-semibold text-slate-900">
              {item.name}
            </p>
            <p className="text-[11px] text-slate-500">{item.role}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- CTA ---

const CallToAction = ({ onGoRegister, onGoMembership }) => (
  <section className="bg-gradient-to-r from-blue-600 to-sky-500 text-white py-12">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-blue-100 mb-1">
          Membership
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold">
          Unlock member-only homes &amp; support
        </h2>
        <p className="mt-2 text-sm text-blue-100 max-w-md">
          Get saved searches, instant alerts, and priority help from our team — all
          in one clean, simple dashboard.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={onGoRegister}
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-md hover:bg-slate-100"
        >
          Get started free
        </button>
        <button
          type="button"
          onClick={onGoMembership}
          className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-blue-500/20 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500/40"
        >
          View member dashboard
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </section>
);

// --- Membership page (keeps Auth logic) ---

const MembershipPage = ({ onLogout, onGoHome }) => (
  <div className="min-h-[calc(100vh-5rem)] bg-slate-50 flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-xl rounded-3xl bg-white border border-blue-100 shadow-md px-6 py-7 sm:px-8 sm:py-9 text-center">
      <Home className="h-10 w-10 mx-auto text-blue-600 mb-3" />
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        Membership dashboard
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        You are logged in. Here you can manage saved homes, alerts and profile
        details. (You can wire this up to a backend later.)
      </p>

      <div className="grid gap-3 sm:grid-cols-3 text-left text-xs text-slate-600 mb-7">
        <div className="rounded-2xl bg-slate-50 border border-blue-50 p-3">
          <p className="font-semibold text-slate-900 mb-1">Saved homes</p>
          <p>Keep track of favourites in one place.</p>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-blue-50 p-3">
          <p className="font-semibold text-slate-900 mb-1">Instant alerts</p>
          <p>Get a ping when new homes match your search.</p>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-blue-50 p-3">
          <p className="font-semibold text-slate-900 mb-1">Support</p>
          <p>Talk to a real person when you need help.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <button
          type="button"
          onClick={onGoHome}
          className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-slate-50"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to home
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center justify-center rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
        >
          <LogIn className="mr-1.5 h-4 w-4 rotate-180" />
          Log out
        </button>
      </div>
    </div>
  </div>
);

// --- Auth layout (Auth: B style) ---

const AuthLayout = ({ children }) => (
  <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md rounded-3xl bg-white border border-blue-100 shadow-lg px-6 py-7 sm:px-8 sm:py-8">
      {children}
    </div>
  </div>
);

// --- Auth input helper ---

const AuthInput = ({ id, type, label, placeholder, Icon, value, onChange }) => (
  <div className="space-y-1">
    <label
      htmlFor={id}
      className="block text-xs font-medium text-slate-700"
    >
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </div>
  </div>
);

// --- Login form (keeps working demo auth) ---

const LoginForm = ({ onLogin, onGoRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'user@example.com' && password === 'password123') {
      setError('');
      onLogin();
    } else {
      setError('Use demo login: user@example.com / password123');
    }
  };

  return (
    <>
      <div className="mb-5 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white mb-2">
          <LogIn className="h-4 w-4" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Sign in with the demo account to open the membership dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="login-email"
          type="email"
          label="Email"
          placeholder="user@example.com"
          Icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          id="login-password"
          type="password"
          label="Password"
          placeholder="password123"
          Icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          className="mt-1 w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Sign in
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-600">
        Don&apos;t have an account yet?{' '}
        <button
          type="button"
          onClick={onGoRegister}
          className="font-semibold text-blue-700 hover:text-blue-800 underline-offset-2 hover:underline"
        >
          Create one
        </button>
      </p>
    </>
  );
};

// --- Registration form ---

const RegistrationForm = ({ onGoLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <div className="mb-5 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white mb-2">
          <User className="h-4 w-4" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">
          Create an account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          This is a front-end demo. Fill the form and then continue with the demo
          login.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="reg-name"
          type="text"
          label="Full name"
          placeholder="Your name"
          Icon={User}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <AuthInput
          id="reg-email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          Icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          id="reg-password"
          type="password"
          label="Password"
          placeholder="Create a strong password"
          Icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="mt-1 w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Continue
        </button>
      </form>

      {submitted && (
        <p className="mt-3 text-xs text-blue-700 text-center">
          Registration saved on this page only. Use{' '}
          <span className="font-semibold">user@example.com</span> /{' '}
          <span className="font-semibold">password123</span> to log in to the
          demo dashboard.
        </p>
      )}

      <p className="mt-4 text-center text-xs text-slate-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onGoLogin}
          className="font-semibold text-blue-700 hover:text-blue-800 underline-offset-2 hover:underline"
        >
          Sign in
        </button>
      </p>
    </>
  );
};

// --- Footer ---

const Footer = ({ onNav }) => (
  <footer className="border-t border-blue-50 bg-white">
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
      <div className="flex items-center gap-2">
        <Home className="h-4 w-4 text-blue-500" />
        <span>© {new Date().getFullYear()} HamroGhar. All rights reserved.</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onNav('login')}
          className="hover:text-blue-700"
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => onNav('register')}
          className="hover:text-blue-700"
        >
          Register
        </button>
        <a
          href="mailto:support@example.com"
          className="inline-flex items-center gap-1 hover:text-blue-700"
        >
          <Mail className="h-3.5 w-3.5" />
          Support
        </a>
      </div>
    </div>
  </footer>
);
