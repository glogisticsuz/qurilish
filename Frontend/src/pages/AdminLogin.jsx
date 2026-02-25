import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/UIComponents';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { adminApi } = await import('../api/api');
            const res = await adminApi.login(username, password);

            if (res.data && res.data.access_token) {
                localStorage.setItem('admin_token', res.data.access_token);
                navigate('/admin/dashboard');
            } else {
                setError('Login yoki parol noto\'g\'ri');
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Login yoki parol noto\'g\'ri');
            } else {
                setError('Xatolik yuz berdi');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-purple-600 font-bold text-3xl">🔐</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
                    <p className="text-purple-100">HamkorQurilish Platform</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Login
                            </label>
                            <Input
                                type="text"
                                name="username_admin_hamkorqurilish"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Megastroy+998916006046"
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Parol
                            </label>
                            <Input
                                type="password"
                                name="password_admin_hamkorqurilish"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Yuklanmoqda...' : 'Kirish'}
                        </Button>
                    </form>
                </div>

                <p className="text-center mt-6 text-purple-100 text-xs">
                    © 2026 HamkorQurilish Admin Panel
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
