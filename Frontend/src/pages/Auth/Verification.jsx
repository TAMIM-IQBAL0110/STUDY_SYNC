import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiKey } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../../utilities/axiosInstance.js';
import { API_PATH } from '../../utilities/apiPath.js';

const VerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get email and token from URL params or location state
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlToken = searchParams.get('token');
    const stateEmail = location.state?.email;
    const finalEmail = urlEmail || stateEmail || '';
    const finalToken = urlToken || '';
    setEmail(finalEmail);
    setToken(finalToken);
  }, [searchParams, location.state]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!code) {
      setError('Please enter the verification code.');
      setLoading(false);
      return;
    }

    if (!email) {
      setError('Email is missing. Please start the registration process again.');
      setLoading(false);
      return;
    }

    try {
      const url = token ? `${API_PATH.AUTH.VERIFY}?token=${token}` : API_PATH.AUTH.VERIFY;
      const response = await axiosInstance.post(url, { code, email });

      if (response.data.success) {
        toast.success(response.data.message);
        localStorage.setItem('token', response.data.token);
        navigate('/');
      } else {
        toast.error(response.data.message || 'Verification failed.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      toast.error(err.response?.data?.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: 'oklch(0.96 0.03 245)',
        backgroundImage: 'linear-gradient(135deg, oklch(0.92 0.03 245) 0%, oklch(1 0.03 245) 100%)'
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'oklch(0.15 0.06 245)' }}>Verify Email</h1>
          <p style={{ color: 'oklch(0.4 0.06 245)' }}>
            Enter the 6-digit verification code sent to your email.
          </p>
        </div>

        <div className="rounded-xl p-8 shadow-2xl" style={{ backgroundColor: 'oklch(1 0.03 245)' }}>
          <form onSubmit={handleVerify} className="space-y-5" autoComplete="off">

            {/* Email (readonly) */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'oklch(0.15 0.06 245)' }}>Email</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border" style={{ borderColor: 'oklch(0.85 0.03 245)' }}>
                <FiMail size={20} style={{ color: 'oklch(0.4 0.06 245)' }} />
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: 'oklch(0.15 0.06 245)' }}
                />
              </div>
            </div>

            {/* Verification Code */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'oklch(0.15 0.06 245)' }}>Verification Code</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border" style={{ borderColor: 'oklch(0.85 0.03 245)' }}>
                <FiKey size={20} style={{ color: 'oklch(0.4 0.06 245)' }} />
                <input
                  type="text"
                  placeholder="Enter code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 bg-transparent outline-none placeholder-gray-400"
                  style={{ color: 'oklch(0.15 0.06 245)' }}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg shadow-sm" style={{ backgroundColor: 'oklch(0.96 0.03 245)', borderLeft: '4px solid oklch(0.5 0.06 30)', color: 'oklch(0.5 0.06 30)' }}>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{ backgroundColor: 'oklch(0.4 0.1 245)' }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
