import { useState } from 'react';

export default function Orders() {
    const [orderId, setOrderId] = useState("");
    const [orderData, setOrderData] = useState(null);
    const [error, setError] = useState("");
    const token = localStorage.getItem('token');

    const fetchOrder = () => {
        setError("");
        setOrderData(null);
        fetch(`http://localhost:8080/api/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error("Bestellung nicht gefunden oder Zugriff verweigert.");
            return res.json();
        })
        .then(data => setOrderData(data))
        .catch(err => setError(err.message));
    };

    if (!token) {
        return (
            <div className="max-w-md mx-auto my-20 px-4 text-center">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Zugriff verweigert</h2>
                    <p className="text-slate-400 mb-6">Bitte loggen Sie sich ein, um Ihre Bestellungen und Dokumente einzusehen.</p>
                    <a href="/login" className="inline-block bg-blue-600 hover:bg-blue-500 transition text-white font-bold px-6 py-2.5 rounded-xl">
                        Zum Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold text-white mb-3">Bestellverlauf</h1>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed">
                Suchen Sie hier nach Rechnungen und Bestelldetails Ihrer Tech-Einkäufe.
            </p>

            {/* IDOR Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl mb-12">
                <h2 className="text-base font-bold text-white mb-4">Rechnungssuche</h2>
                <div className="flex gap-3">
                    <input 
                        type="number" 
                        placeholder="Bestell-ID eingeben (z. B. 1 oder 2)" 
                        className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-700 transition flex-1"
                        value={orderId}
                        onChange={e => setOrderId(e.target.value)}
                    />
                    <button 
                        onClick={fetchOrder}
                        className="bg-white text-black hover:bg-slate-200 transition font-medium px-5 py-2.5 rounded-lg text-sm"
                    >
                        Suchen
                    </button>
                </div>
                
                {error && (
                    <div className="mt-6 bg-red-950/40 border border-red-900 text-red-400 p-4 rounded-lg text-xs font-medium">
                        {error}
                    </div>
                )}
                
                {orderData && (
                    <div className="mt-8 bg-slate-950 border border-slate-800/80 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-blue-500/10 text-blue-400 border-l border-b border-slate-800 text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                            RECHNUNG BEREIT
                        </div>
                        <h3 className="text-sm font-bold text-white mb-4">Bestelldetails #{orderData.id}</h3>
                        
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                            <div>
                                <span className="text-slate-500 block mb-1">Gekaufter Artikel</span>
                                <span className="text-slate-200 font-semibold">{orderData.productName}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block mb-1">Rechnungssumme</span>
                                <span className="text-slate-200 font-extrabold">{orderData.total?.toFixed(2)} €</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block mb-1">Zugeordnete Kunden-ID</span>
                                <span className="text-slate-400">User_{orderData.userId}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block mb-1">Bestellstatus</span>
                                <span className="text-green-400 font-semibold flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Versandt
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Downloads Section */}
            <h2 className="text-lg font-bold text-white mb-4">Benutzerdokumente & Downloads</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    Laden Sie Systemarchitekturen, Handbücher und Konfigurationen herunter.
                </p>
                
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div>
                            <div className="font-bold text-white text-xs">manual.pdf</div>
                            <div className="text-[10px] text-slate-500 font-medium">VoltVibe Kurzanleitung & Technische Spezifikationen</div>
                        </div>
                    </div>
                    <a 
                        href="http://localhost:8080/api/download?file=manual.pdf" 
                        className="bg-slate-800 hover:bg-slate-750 transition text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700/50"
                    >
                        Herunterladen
                    </a>
                </div>
            </div>
        </div>
    );
}
