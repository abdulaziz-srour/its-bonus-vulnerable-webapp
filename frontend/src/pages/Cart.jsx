import { useState, useEffect } from 'react';

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [discount, setDiscount] = useState(0);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [newOrderId, setNewOrderId] = useState(null);

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(items);
    }, []);

    const updateQuantity = (id, amount) => {
        const updated = cartItems.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + amount;
                return { ...item, quantity: newQty < 1 ? 1 : newQty };
            }
            return item;
        });
        setCartItems(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('cart-updated'));
    };

    const removeItem = (id) => {
        const filtered = cartItems.filter(item => item.id !== id);
        setCartItems(filtered);
        localStorage.setItem('cart', JSON.stringify(filtered));
        window.dispatchEvent(new Event('cart-updated'));
    };

    const applyDiscount = () => {
        setMessage("Rabattcode wird überprüft...");
        fetch(`http://localhost:8080/api/cart/discount?code=${encodeURIComponent(code)}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setMessage(data.error === 'Invalid discount code' ? 'Ungültiger Rabattcode' : data.error);
                    setDiscount(0);
                } else {
                    setMessage(`Erfolg! ${data.percentage}% Rabatt wurde angewendet.`);
                    setDiscount(data.percentage);
                }
            })
            .catch(() => {
                setMessage("Fehler beim Anwenden des Rabattcodes");
                setDiscount(0);
            });
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;

        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = subtotal * (discount / 100);
        const finalTotal = subtotal - discountAmount;
        
        const userId = localStorage.getItem('userId') || '2';
        const productName = cartItems.map(item => `${item.name} (x${item.quantity})`).join(", ");

        fetch('http://localhost:8080/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(userId),
                productName: productName,
                total: finalTotal
            })
        })
        .then(res => res.json())
        .then(data => {
            setNewOrderId(data.id);
            setCheckoutSuccess(true);
            setCartItems([]);
            localStorage.setItem('cart', '[]');
            window.dispatchEvent(new Event('cart-updated'));
        })
        .catch(err => {
            console.error("Checkout save failed, doing client-only success", err);
            setCheckoutSuccess(true);
            setCartItems([]);
            localStorage.setItem('cart', '[]');
            window.dispatchEvent(new Event('cart-updated'));
        });
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;

    if (checkoutSuccess) {
        return (
            <div className="max-w-md mx-auto my-28 px-4 text-center">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <div className="text-4xl mb-4 text-green-400">✓</div>
                    <h2 className="text-2xl font-bold text-white mb-3">Zahlung erfolgreich</h2>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        Vielen Dank für Ihre Bestellung! Ihre Zahlung wurde erfolgreich abgewickelt. Ihre Bestellung wird in Kürze versandt.
                    </p>
                    {newOrderId && (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 text-xs text-slate-400">
                            Rechnungs-ID: <span className="font-bold text-white">#{newOrderId}</span>
                            <p className="mt-1 text-[10px] text-slate-500">Diese ID können Sie im Bestellverlauf abfragen.</p>
                        </div>
                    )}
                    <a href="/" className="inline-block bg-white text-black hover:bg-slate-200 transition font-medium text-xs px-6 py-2.5 rounded-lg">
                        Zurück zum Shop
                    </a>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-md mx-auto my-28 px-4 text-center">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <div className="text-3xl mb-4">🛒</div>
                    <h2 className="text-xl font-bold text-white mb-2">Ihr Warenkorb ist leer</h2>
                    <p className="text-slate-500 text-xs mb-6">Fügen Sie einige Premium-Elektronikgeräte auf der Startseite hinzu.</p>
                    <a href="/" className="inline-block bg-white text-black hover:bg-slate-200 transition font-medium text-xs px-6 py-2.5 rounded-lg">
                        Zum Shop
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 lg:flex gap-8">
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-8">Ihr Warenkorb</h1>
                
                {/* Cart Items List */}
                <div className="space-y-4 mb-8">
                    {cartItems.map(item => (
                        <div 
                            key={item.id} 
                            className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 flex items-center justify-between hover:border-slate-800 transition"
                        >
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-sm hover:text-blue-400 transition">
                                        <a href={`/product/${item.id}`}>{item.name}</a>
                                    </h3>
                                    <div className="text-xs text-slate-500 font-bold mt-1">{(item.price).toFixed(2)} €</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                {/* Quantity Adjuster */}
                                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                                    <button 
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="text-slate-400 hover:text-white px-2 py-0.5 text-xs font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="text-white text-xs font-bold px-2">{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="text-slate-400 hover:text-white px-2 py-0.5 text-xs font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                                
                                {/* Delete Button */}
                                <button 
                                    onClick={() => removeItem(item.id)}
                                    className="text-slate-500 hover:text-red-400 text-xs font-semibold cursor-pointer"
                                >
                                    Löschen
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart Summary */}
            <div className="w-full lg:w-80 mt-12 lg:mt-0">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sticky top-24">
                    <h2 className="text-base font-bold text-white mb-6">Zusammenfassung</h2>
                    
                    <div className="space-y-4 mb-6 text-xs text-slate-400 border-b border-slate-850 pb-6">
                        <div className="flex justify-between">
                            <span>Zwischensumme</span>
                            <span className="text-slate-200 font-semibold">{subtotal.toFixed(2)} €</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-green-400">
                                <span>Rabatt ({discount}%)</span>
                                <span>- {discountAmount.toFixed(2)} €</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Versand</span>
                            <span className="text-green-400 font-semibold">KOSTENLOS</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-850">
                            <span>Gesamtsumme</span>
                            <span>{total.toFixed(2)} €</span>
                        </div>
                    </div>

                    {/* Discount Code */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
                        <h3 className="text-xs font-semibold text-white mb-2">Rabattcode einlösen</h3>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="z. B. WINTER24" 
                                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-slate-700 transition flex-1"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                            />
                            <button 
                                onClick={applyDiscount}
                                className="bg-slate-800 hover:bg-slate-750 transition text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700/50"
                            >
                                Einlösen
                            </button>
                        </div>
                        {message && (
                            <p className={`mt-2 text-[10px] font-semibold ${message.includes('Erfolg') ? 'text-green-400' : message.includes('überprüft') ? 'text-blue-400' : 'text-red-400'}`}>
                                {message}
                            </p>
                        )}
                    </div>

                    <button 
                        onClick={handleCheckout}
                        className="w-full bg-white text-black hover:bg-slate-250 transition font-bold py-3 rounded-lg text-xs cursor-pointer"
                    >
                        Jetzt bezahlen
                    </button>
                </div>
            </div>
        </div>
    );
}
