import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [imgError, setImgError] = useState(false);

    const fetchProduct = () => {
        fetch(`http://localhost:8080/api/products`)
            .then(res => res.json())
            .then(data => {
                const found = data.find(p => p.id === parseInt(id));
                setProduct(found);
            });
    };

    const fetchReviews = () => {
        fetch(`http://localhost:8080/api/products/${id}/reviews`)
            .then(res => res.json())
            .then(data => setReviews(data));
    };

    useEffect(() => {
        fetchProduct();
        fetchReviews();
        setImgError(false);
    }, [id]);

    const addToCart = () => {
        if (!product) return;
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

    const submitReview = (e) => {
        e.preventDefault();
        fetch(`http://localhost:8080/api/products/${id}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newReview, username: localStorage.getItem('username') || 'Anonym' })
        }).then(() => {
            setNewReview("");
            fetchReviews();
        });
    };

    if (!product) return <div className="p-8 text-center text-slate-500 text-sm">Spezifikationen werden geladen...</div>;

    const emojiMap = {
        "Audio": "🎧",
        "Computer": "💻",
        "Wearables": "⌚",
        "Smart Home": "🏠",
        "Kameras": "📷",
        "Zubehör": "🔌"
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            
            {toastMessage && (
                <div className="fixed bottom-5 right-5 bg-white text-black text-xs font-medium px-4 py-3 rounded-lg shadow-2xl border border-slate-200 z-50 animate-bounce">
                    {toastMessage}
                </div>
            )}

            <Link to="/" className="text-slate-500 hover:text-white transition text-xs font-semibold uppercase tracking-wider mb-8 inline-block">
                ← Zurück zum Shop
            </Link>

            {/* Product Card */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden md:flex mb-12">
                <div className="md:w-1/2 aspect-video md:aspect-square overflow-hidden bg-slate-950 flex items-center justify-center">
                    {!imgError ? (
                        <img 
                            src={product.image_url || product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 flex flex-col items-center justify-center text-center p-8">
                            <span className="text-6xl mb-4 filter drop-shadow">{emojiMap[product.category] || "🔌"}</span>
                            <span className="text-xs text-slate-550 font-bold uppercase tracking-wider">VoltVibe Edition</span>
                        </div>
                    )}
                </div>
                <div className="p-8 md:w-1/2 flex flex-col justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Premium-Technik</div>
                        <h1 className="text-2xl font-bold text-white mb-4">{product.name}</h1>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">{product.description}</p>
                    </div>
                    <div className="border-t border-slate-800/80 pt-6">
                        <div className="text-2xl font-bold text-white mb-6">{product.price.toFixed(2)} €</div>
                        <button 
                            onClick={addToCart}
                            className="w-full bg-white text-black hover:bg-slate-200 transition font-medium py-3 rounded-lg text-sm cursor-pointer"
                        >
                            In den Warenkorb
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-8">
                <h2 className="text-lg font-bold text-white mb-6">Kundenbewertungen & Feedback</h2>
                
                <form onSubmit={submitReview} className="mb-8">
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-white text-sm focus:outline-none focus:border-slate-700 transition placeholder-slate-600" 
                        rows="3" 
                        placeholder="Schreiben Sie eine konstruktive Bewertung..."
                        value={newReview}
                        onChange={e => setNewReview(e.target.value)}
                        required
                    ></textarea>
                    <button className="mt-3 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 transition text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg">
                        Bewertung abschicken
                    </button>
                </form>

                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <p className="text-slate-600 text-xs italic">Noch keine Bewertungen vorhanden. Hinterlassen Sie die erste!</p>
                    ) : (
                        reviews.map(r => (
                            <div key={r.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 shadow-inner">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-blue-400 text-xs">@{r.username}</span>
                                    <span className="text-slate-600 text-[10px] font-semibold">Verifizierter Kauf</span>
                                </div>
                                {/* VULNERABLE: Stored XSS via dangerouslySetInnerHTML */}
                                <div 
                                    className="text-slate-350 leading-relaxed text-xs"
                                    dangerouslySetInnerHTML={{ __html: r.text }} 
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
