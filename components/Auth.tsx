import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

interface AuthProps {
  onLogin: (username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isLoginView) {
      // Handle Login
      const result = loginUser(username, password);
      if (result.success) {
        onLogin(username);
      } else {
        setError(result.message);
      }
    } else {
      // Handle Register
      if (password !== confirmPassword) {
        setError('Mật khẩu không khớp.');
        return;
      }
      const result = registerUser(username, password);
      if (result.success) {
        // Automatically log in the user upon successful registration
        onLogin(username);
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/50 border border-gray-700 rounded-2xl p-8 shadow-2xl shadow-pink-500/10">
        <h1 className="text-4xl font-extrabold text-center mb-2">
          My <span className="text-pink-400">Muse</span> AI
        </h1>
        <p className="text-center text-gray-400 mb-8">{isLoginView ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-400 block mb-2">Tên người dùng</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-400 block mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none"
              required
            />
          </div>
          {!isLoginView && (
            <div>
              <label className="text-sm font-bold text-gray-400 block mb-2">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none"
                required
              />
            </div>
          )}

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          {success && <p className="text-sm text-green-400 text-center">{success}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105 shadow-lg"
          >
            {isLoginView ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isLoginView ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{' '}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(null); setSuccess(null); }} className="font-semibold text-pink-400 hover:underline">
            {isLoginView ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;