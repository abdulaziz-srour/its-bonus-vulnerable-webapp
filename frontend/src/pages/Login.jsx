import { useState } from 'react';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('username', data.user.username);
                window.location.href = '/profile';
            }
        });
    };

    return (
        <div className="max-w-sm mx-auto my-28 px-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Anmelden</h1>
                <p className="text-slate-500 text-xs text-center mb-8">Geben Sie Ihre Zugangsdaten ein, um fortzufahren.</p>
                
                {error && (
                    <div className="bg-red-950/40 border border-red-900 text-red-400 p-3 rounded-lg mb-6 text-xs text-center font-medium">
                        {error === 'Invalid credentials' ? 'Ungültige Anmeldedaten' : error}
                    </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-2">Benutzername</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-700 transition"
                            placeholder="Ihr Benutzername"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-2">Passwort</label>
                        <input 
                            type="password" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-slate-700 transition"
                            placeholder="Ihr Passwort"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="w-full bg-white text-black hover:bg-slate-200 transition font-medium py-2.5 rounded-lg text-sm mt-2">
                        Einloggen
                    </button>
                </form>
            </div>
        </div>
    );
}
