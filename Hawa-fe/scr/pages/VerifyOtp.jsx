import { useState, useEffect } from 'react';
import { Mail, ArrowRight, Loader } from 'lucide-react';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 1. Get email directly from Storage (since we can't use useLocation)
  const email = localStorage.getItem('pending_verification_email');

  useEffect(() => {
    if (!email) {
      // If no email found, go back to register manually
      window.location.hash = '#register';
    }
  }, [email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 2. Call your Backend API
      const response = await fetch('http://localhost:8000/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          otp: otp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Verification failed');
      }

      setSuccess('Verification Successful! Redirecting...');
      localStorage.removeItem('pending_verification_email');
      
      // 3. Manual Redirect to Login after 1.5 seconds
      setTimeout(() => {
        window.location.hash = '#login';
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        
        {/* Header Icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Verify your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We sent a 6-digit code to <span className="font-semibold text-blue-600">{email}</span>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="space-y-2">
            <label htmlFor="otp" className="sr-only">Verification Code</label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength="6"
              className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-lg text-center tracking-[0.5em] font-bold"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm p-3 rounded-lg text-center">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white 
              ${isLoading || otp.length !== 6 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
              transition-all duration-200 shadow-md hover:shadow-lg`}
          >
            {isLoading ? (
              <Loader className="animate-spin h-5 w-5" />
            ) : (
              <span className="flex items-center">
                Verify Account <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
