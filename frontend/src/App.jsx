import { BrowserRouter, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Search from './pages/Search';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

function Navbar() {
  const username = localStorage.getItem('username');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [bounceCart, setBounceCart] = useState(false);
  const suggestionRef = useRef(null);

  const updateCartBadge = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalQty);
    setBounceCart(true);
    setTimeout(() => setBounceCart(false), 300);
  };

  useEffect(() => {
    updateCartBadge();
    window.addEventListener('cart-updated', updateCartBadge);
    return () => window.removeEventListener('cart-updated', updateCartBadge);
  }, []);

  useEffect(() => {
    setSearchInput(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    if (searchInput.trim().length > 1) {
      fetch(`http://localhost:8080/api/products/search?q=${encodeURIComponent(searchInput)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSuggestions(data.slice(0, 5));
          }
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [searchInput]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSuggestions([]);
    navigate(`/?q=${encodeURIComponent(searchInput)}`);
  };

  const handleSuggestionClick = (p) => {
    setSuggestions([]);
    setSearchInput(p.name);
    navigate(`/product/${p.id}`);
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-900 text-white py-3.5 px-6 sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/" className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition min-w-[120px]">
          <span className="text-blue-500">⚡</span> VoltVibe
        </Link>
        
        {/* Amazon-style persistent Search Bar with Live Dropdown Suggestions */}
        <div ref={suggestionRef} className="flex-1 max-w-lg relative">
          <form onSubmit={handleSearchSubmit} className="flex bg-slate-900 border border-slate-800 rounded-lg overflow-hidden focus-within:border-slate-650 transition">
            <input 
              type="text" 
              placeholder="Nach Premium-Elektronik suchen..." 
              className="w-full bg-transparent px-4 py-2.5 text-white text-xs focus:outline-none placeholder-slate-650"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onFocus={() => {
                if (searchInput.trim().length > 1) {
                  setSearchInput(searchInput);
                }
              }}
            />
            <button 
              type="submit" 
              className="bg-white text-black hover:bg-slate-200 transition text-xs font-semibold px-5 cursor-pointer"
            >
              Suchen
            </button>
          </form>

          {/* Suggestions Dropdown (floating absolute) */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden divide-y divide-slate-850">
              {suggestions.map(p => (
                <div 
                  key={p.id}
                  onClick={() => handleSuggestionClick(p)}
                  className="px-4 py-2.5 hover:bg-slate-850 cursor-pointer flex justify-between items-center transition"
                >
                  <div>
                    <div className="text-white text-xs font-bold">{p.name}</div>
                    <div className="text-[10px] text-slate-500">{p.category || "Elektronik"}</div>
                  </div>
                  <span className="text-blue-400 text-xs font-bold">{p.price ? `${p.price.toFixed(2)} €` : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Links & Shopping Cart Icon */}
        <div className="flex gap-6 items-center text-xs font-medium">
          <Link to="/" className="text-slate-400 hover:text-white transition">Shop</Link>
          
          {/* Dynamic Shopping Cart Link with Bounce Badge */}
          <Link to="/cart" className="relative flex items-center gap-1.5 text-slate-400 hover:text-white transition">
            <span>Warenkorb</span>
            <span className={`bg-blue-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-slate-950 transition duration-300 ${
              bounceCart ? "scale-125 bg-blue-400" : ""
            }`}>
              {cartCount}
            </span>
          </Link>

          {username ? (
            <>
              <Link to="/orders" className="text-slate-400 hover:text-white transition">Bestellungen</Link>
              <Link to="/profile" className="text-slate-400 hover:text-white transition">Profil</Link>
              <span className="text-slate-800">|</span>
              <span className="text-blue-400">@{username}</span>
              <button onClick={logout} className="text-slate-400 hover:text-red-400 transition cursor-pointer">Abmelden</button>
            </>
          ) : (
            <Link to="/login" className="bg-white text-black px-4 py-1.5 rounded hover:bg-slate-200 transition font-medium">
              Einloggen
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>
      <footer className="bg-slate-950 border-t border-slate-900 text-center py-8 text-slate-600 text-xs">
        &copy; {new Date().getFullYear()} VoltVibe Electronics. Alle Rechte vorbehalten.
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
