import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function Search() {
    const [products, setProducts] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [toastMessage, setToastMessage] = useState("");
    const [activeSlide, setActiveSlide] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("Alle");

    const [timeLeft, setTimeLeft] = useState(10500); 

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 10500));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const loadProducts = () => {
        const url = query 
            ? `http://localhost:8080/api/products/search?q=${encodeURIComponent(query)}` 
            : `http://localhost:8080/api/products`;
            
        fetch(url)
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadProducts();
    }, [query]);

    useEffect(() => {
        if (!query) {
            const slideInterval = setInterval(() => {
                setActiveSlide(prev => (prev + 1) % 3);
            }, 4000);
            return () => clearInterval(slideInterval);
        }
    }, [query]);

    const addToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(item => item.id === product.id);
        
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.image_url || product.imageUrl,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
        
        setToastMessage(`"${product.name}" wurde zum Warenkorb hinzugefügt.`);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const carouselSlides = [
        {
            productId: 1,
            title: "VoltVibe Kopfhörer Pro",
            desc: "Hybrid ANC, smarter Ambient-Modus und bis zu 45 Std. Akku. Entdecken Sie die nächste Ära des Klangs.",
            badge: "Bestseller der Woche",
            bg: "from-blue-950 via-slate-900 to-indigo-950",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            productId: 12,
            title: "CyberCore i9 Gaming-System",
            desc: "64GB DDR5 RAM, Custom-Wasserkühlung und maximale Rechenleistung. Erbaut für AI und High-End Gaming.",
            badge: "Exklusive Tech Rigs",
            bg: "from-violet-950 via-slate-900 to-fuchsia-950",
            image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Z2FtaW5nJTIwcGN8ZW58MHx8MHx8fDA%3D"
        },
        {
            productId: 21,
            title: "Pulse Watch Serie X",
            desc: "Medizinische Präzision an Ihrem Handgelenk. EKG-Messung, Blutsauerstoff, AMOLED-Display und Fitness-Coaching.",
            badge: "Neuheit: Wearables",
            bg: "from-teal-950 via-slate-900 to-emerald-950",
            image: "https://images.unsplash.com/photo-1660844817855-3ecc7ef21f12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c21hcnR3YXRjaHxlbnwwfHwwfHx8MA%3D%3D"
        }
    ];

    const categories = ["Alle", ...new Set(products.map(p => p.category).filter(Boolean))];
    const filteredProducts = selectedCategory === "Alle" 
        ? products 
        : products.filter(p => p.category === selectedCategory);

    const groupedProducts = products.reduce((groups, product) => {
        const cat = product.category || "Sonstiges";
        if (!groups[cat]) {
            groups[cat] = [];
        }
        groups[cat].push(product);
        return groups;
    }, {});

    const selectCategoryFilter = (cat) => {
        setSelectedCategory(cat);
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            
            {/* Elegant Minimalist Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 bg-white text-black text-xs font-medium px-4 py-3 rounded-lg shadow-2xl border border-slate-200 z-50 animate-bounce">
                    {toastMessage}
                </div>
            )}

            {/* Error Message for Reflected XSS */}
            {products.length === 0 && query && (
                <div className="mb-12 p-4 bg-red-950/20 border border-red-900/50 text-red-400 rounded-lg text-sm">
                    {/* VULNERABLE: Reflected XSS via dangerouslySetInnerHTML */}
                    <div dangerouslySetInnerHTML={{ __html: `Keine Ergebnisse für: ${query}` }} />
                </div>
            )}

            {/* CASE 1: Query is active OR a specific Category Pill is selected (Grid View with Bento Asymmetry) */}
            {query || selectedCategory !== "Alle" ? (
                <div>
                    <div className="mb-10 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                {selectedCategory !== "Alle" ? `${selectedCategory}-Kollektion` : "Suchergebnisse"}
                            </h1>
                            <p className="text-slate-500 text-xs">
                                {selectedCategory !== "Alle" 
                                    ? `Zeigt alle Produkte der Kategorie "${selectedCategory}"` 
                                    : `Zeigt Resultate für "${query}"`}
                            </p>
                        </div>
                        {selectedCategory !== "Alle" && (
                            <button
                                onClick={() => setSelectedCategory("Alle")}
                                className="bg-slate-900 border border-slate-800 hover:text-white transition text-slate-400 text-xs font-semibold px-4 py-2 rounded-lg"
                            >
                                Zurück zur Übersicht
                            </button>
                        )}
                    </div>

                    {/* Category Filter Pills (Amazon style) */}
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition whitespace-nowrap cursor-pointer ${
                                    selectedCategory === cat 
                                        ? "bg-white text-black border-white" 
                                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Bento / Asymmetric Grid Layout for Search results: First card is large/wide on desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((p, idx) => {
                            const isFeatured = idx === 0;
                            return (
                                <div 
                                    key={p.id} 
                                    className={`${isFeatured ? "sm:col-span-2 lg:col-span-2 xl:col-span-2" : ""}`}
                                >
                                    <ProductCard p={p} onAdd={addToCart} isFeatured={isFeatured} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* CASE 2: No Query & No Category selected (Amazon Landing Experience - Carousel, Lightning Deals & Scrolling Bento Rows) */
                <div className="space-y-20">
                    
                    {/* Amazon-style Hero Carousel Banner with Image Showcase */}
                    <div className="relative h-[340px] w-full rounded-2xl overflow-hidden shadow-xl border border-slate-900">
                        {carouselSlides.map((slide, idx) => (
                            <div 
                                key={idx}
                                className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-opacity duration-1000 ease-in-out flex items-center justify-between px-12 md:px-20 ${
                                    idx === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                                }`}
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent"></div>
                                
                                {/* Left Column: Text Showcase */}
                                <div className="max-w-md relative z-10">
                                    <span className="bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block">
                                        {slide.badge}
                                    </span>
                                    <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">{slide.title}</h2>
                                    <p className="text-slate-400 text-xs leading-relaxed mb-6">{slide.desc}</p>
                                    <Link 
                                        to={`/product/${slide.productId}`}
                                        className="bg-white text-black hover:bg-slate-200 transition text-[11px] font-bold px-6 py-2.5 rounded-lg shadow-md inline-block"
                                    >
                                        Jetzt entdecken
                                    </Link>
                                </div>

                                {/* Right Column: Image Showcase */}
                                <div className="hidden md:flex relative items-center justify-center w-72 h-72 z-10 mr-4">
                                    <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
                                    <img 
                                        src={slide.image} 
                                        alt={slide.title} 
                                        className="max-w-full max-h-full object-cover rounded-xl shadow-2xl border border-white/10 transform rotate-2 hover:rotate-0 hover:scale-105 transition duration-500 ease-out"
                                        style={{ height: '220px', width: '220px', objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-25">
                            {carouselSlides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveSlide(idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        idx === activeSlide ? "bg-white w-6" : "bg-slate-700"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Lightning Deals Section (Blitzangebote mit Ticking Timer) */}
                    <div className="bg-slate-900 border border-slate-850/85 rounded-2xl p-6 shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-red-500 font-extrabold text-sm tracking-wide">⚡ BLITZANGEBOTE</span>
                                <span className="text-[9px] bg-red-950 text-red-400 border border-red-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    BEGRENZTE STÜCKZAHL
                                </span>
                            </div>
                            <div className="text-xs text-slate-405 flex items-center gap-2">
                                <span>Endet in:</span>
                                <span className="bg-slate-950 border border-slate-800 text-white font-mono font-bold px-3 py-1 rounded-lg text-sm tracking-wider">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        {/* Horizontal Scrolling Deals */}
                        <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                            {products.slice(0, 6).map(p => (
                                <div 
                                    key={p.id}
                                    className="bg-slate-950 border border-slate-900/60 rounded-xl p-4 flex-none w-52 hover:border-slate-800 transition flex flex-col justify-between"
                                >
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 mb-3 relative">
                                        <ImageWithFallback src={p.image_url || p.imageUrl} alt={p.name} category={p.category} />
                                        <div className="absolute top-1.5 left-1.5 bg-red-600 text-white font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                                            -15%
                                        </div>
                                    </div>
                                    <h4 className="font-semibold text-white text-xs truncate mb-1">
                                        <Link to={`/product/${p.id}`} className="hover:text-blue-400 transition">{p.name}</Link>
                                    </h4>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-red-400 font-bold text-xs">{(p.price * 0.85).toFixed(2)} €</span>
                                        <span className="text-slate-650 line-through text-[10px]">{p.price.toFixed(2)} €</span>
                                    </div>
                                    <button 
                                        onClick={() => addToCart(p)}
                                        className="w-full bg-white text-black hover:bg-slate-200 transition text-[10px] font-bold py-1.5 rounded cursor-pointer"
                                    >
                                        In den Warenkorb
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grouped Products (Amazon Style Categories - Scroll Rows) */}
                    <div className="space-y-20">
                        {Object.keys(groupedProducts).map(category => (
                            <div key={category} className="border-b border-slate-900/60 pb-8">
                                <div className="flex justify-between items-end mb-6">
                                    <h2 className="text-lg font-bold text-white tracking-wide">
                                        Beliebt in <span className="text-blue-500">{category}</span>
                                    </h2>
                                    {/* INTERACTIVE LINK: Sets Category Pill Filter on click! */}
                                    <button 
                                        onClick={() => selectCategoryFilter(category)}
                                        className="text-xs text-slate-500 font-semibold cursor-pointer hover:text-white transition bg-transparent border-none outline-none"
                                    >
                                        Alle ansehen →
                                    </button>
                                </div>

                                {/* Category Swiper row (Asymmetric bento style: First card is layout-horizontal for playfulness!) */}
                                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
                                    {groupedProducts[category].map((p, idx) => {
                                        const isFeaturedInRow = idx === 0;
                                        return (
                                            <div key={p.id} className={`flex-none ${isFeaturedInRow ? "w-80" : "w-64"}`}>
                                                <ProductCard p={p} onAdd={addToCart} isFeatured={isFeaturedInRow} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ImageWithFallback({ src, alt, category }) {
    const [imgError, setImgError] = useState(false);

    const emojiMap = {
        "Audio": "🎧",
        "Computer": "💻",
        "Wearables": "⌚",
        "Smart Home": "🏠",
        "Kameras": "📷",
        "Zubehör": "🔌"
    };

    if (imgError || !src) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 flex flex-col items-center justify-center text-center p-4">
                <span className="text-4xl mb-2 filter drop-shadow">{emojiMap[category] || "🔌"}</span>
                <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">VoltVibe Edition</span>
            </div>
        );
    }

    return (
        <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover hover:scale-103 transition duration-500 ease-out"
            onError={() => setImgError(true)}
        />
    );
}

function ProductCard({ p, onAdd, isFeatured }) {
    return (
        <div className={`bg-slate-900 border rounded-xl overflow-hidden flex flex-col justify-between hover:shadow-2xl transition duration-300 h-full ${
            isFeatured 
                ? "border-blue-500/30 shadow-lg shadow-blue-500/5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/60" 
                : "border-slate-800/80 hover:border-slate-750"
        }`}>
            <div>
                {/* Clickable Card Image -> Navigates to Details */}
                <Link to={`/product/${p.id}`} className={`bg-slate-950 w-full overflow-hidden block ${isFeatured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                    <ImageWithFallback src={p.image_url || p.imageUrl} alt={p.name} category={p.category} />
                </Link>
                
                {/* Details Section */}
                <div className="p-5">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {p.category}
                        </span>
                        {isFeatured && (
                            <span className="bg-blue-500/20 text-blue-400 font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-500/20">
                                HOT DEAL
                            </span>
                        )}
                    </div>
                    {/* Clickable Product Title */}
                    <h3 className={`font-semibold text-white mb-1.5 hover:text-blue-400 transition leading-snug line-clamp-1 ${isFeatured ? "text-base" : "text-sm"}`}>
                        <Link to={`/product/${p.id}`}>{p.name}</Link>
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed h-8">
                        {p.description}
                    </p>
                    <div className="text-white font-extrabold text-sm mb-1">
                        {p.price.toFixed(2)} €
                    </div>
                    <span className="text-[10px] text-slate-600 font-semibold block mb-1">
                        Kostenlose Lieferung
                    </span>
                </div>
            </div>
            
            {/* Elegant, Full-Width Bottom Action Button */}
            <div className="px-5 pb-5">
                <button 
                    onClick={() => onAdd(p)}
                    className={`w-full transition text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                        isFeatured 
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10" 
                            : "bg-white text-black hover:bg-slate-200"
                    }`}
                >
                    In den Warenkorb
                </button>
            </div>
        </div>
    );
}
