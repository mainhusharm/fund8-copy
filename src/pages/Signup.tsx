import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signUp } from '../lib/auth';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { returnTo, accountSize, challengeType, originalPrice } = location.state || {};
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signUp(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    );

    if (result.success) {
      if (returnTo && accountSize && challengeType) {
        navigate(returnTo, {
          state: { accountSize, challengeType, originalPrice }
        });
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-deep-space flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-cyber-purple rounded-lg flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            F
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-400">
            {accountSize ? `Complete signup to proceed with your $${accountSize.toLocaleString()} ${challengeType} challenge` : 'Start your trading journey today'}
          </p>
        </div>

        {accountSize && challengeType && (
          <div className="bg-electric-blue/10 border border-electric-blue/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Selected Challenge</p>
                <p className="font-bold text-lg">${accountSize.toLocaleString()} {challengeType.charAt(0).toUpperCase() + challengeType.slice(1)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Price</p>
                <p className="font-bold text-lg text-neon-green">${originalPrice}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-electric-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-electric-blue"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-electric-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-electric-blue"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-electric-blue"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-electric-blue to-cyber-purple rounded-lg font-semibold hover:shadow-lg hover:shadow-electric-blue/50 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="text-electric-blue hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
