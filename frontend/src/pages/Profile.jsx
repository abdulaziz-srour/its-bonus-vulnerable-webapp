import { useState, useEffect } from 'react';

export default function Profile() {
    const [address, setAddress] = useState("");
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (userId) {
            setUser({
                username: localStorage.getItem('username'),
                role: localStorage.getItem('token')?.includes('ADMIN') ? 'ADMIN' : 'USER'
            });
        }
    }, [userId]);

    const updateProfile = (e) => {
        e.preventDefault();
        fetch(`http://localhost:8080/api/users/${userId}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address })
        })
        .then(res => res.json())
        .then(data => {
            setMessage("Profil erfolgreich aktualisiert!");
            if (data.role) {
                setUser(prev => ({ ...prev, role: data.role }));
                if (data.role === 'ADMIN') {
                    localStorage.setItem('token', `fake-jwt-token-${userId}-ADMIN`);
                }
            }
        });
    };

    if (!userId) {
        return (
            <div className="max-w-md mx-auto my-20 px-4 text-center">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Zugriff verweigert</h2>
                    <p className="text-slate-400 mb-6">Bitte loggen Sie sich ein, um Ihr Premium-Profil zu verwalten.</p>
                    <a href="/login" className="inline-block bg-blue-600 hover:bg-blue-500 transition text-white font-bold px-6 py-2.5 rounded-xl">
                        Zum Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-white mb-6">Mein Profil</h1>
            
            {/* User Badges */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8 relative overflow-hidden flex justify-between items-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent"></div>
                <div className="relative z-10">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Angemeldeter Account</div>
                    <div className="text-2xl font-extrabold text-white">@{user?.username}</div>
                </div>
                <div className="relative z-10 flex flex-col items-end">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Zugriffsstufe</div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${user?.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/35' : 'bg-blue-500/20 text-blue-300 border border-blue-500/35'}`}>
                        {user?.role}
                    </span>
                </div>
            </div>

            {/* Profile Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4">Lieferadresse aktualisieren</h2>
                {message && (
                    <div className="bg-green-950/50 border border-green-800 text-green-400 p-3 rounded-xl mb-6 text-sm text-center font-medium shadow-inner">
                        {message}
                    </div>
                )}
                
                <form onSubmit={updateProfile} className="space-y-6">
                    <div>
                        <label className="block text-slate-300 text-sm font-bold mb-2">Lieferadresse</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition shadow-inner placeholder-slate-650"
                            placeholder="z. B. Silicon Valley Allee 404"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-500 transition text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20">
                        Adresse speichern
                    </button>
                </form>
            </div>
        </div>
    );
}
