import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react'; // Keep icons for potential messages

export default function Login() {
  const { signIn, user, isLoading, error: authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = React.useState(''); // For messages like email confirmation

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Check for query params like 'confirmed' or 'error' from redirects
    if (searchParams.get('confirmed') === 'true') {
      setMessage('Email confirmed successfully! You can now log in.');
    }
    // Auth0 might pass error messages in query params, e.g., ?error=access_denied&error_description=...
    const auth0ErrorParam = searchParams.get('error');
    const auth0ErrorDescription = searchParams.get('error_description');
    if (auth0ErrorParam) {
      setMessage(''); // Clear previous messages
      // Consider setting a local error state here if you want to display these errors prominently
      // For now, relying on the global `authError` from `useAuth()` if it captures these.
      console.error("Auth0 redirect error:", auth0ErrorDescription || auth0ErrorParam);
    }
  }, [searchParams]);

  const handleLogin = async () => {
    try {
      await signIn(); // This will redirect to Auth0 Universal Login
    } catch (err) {
      // This catch block might not be reached if errors are handled by redirect params
      // or by the global error state in AuthContext.
      console.error("Error initiating signIn:", err);
      // Optionally set a local error state: setErrorState("Failed to initiate login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Display Auth0 errors from context or other messages */}
        {authError && (
          <div className="rounded-md bg-red-50 p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {authError.message || 'An error occurred during login.'}
                </h3>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="rounded-md bg-green-50 p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  {message}
                </h3>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Redirecting to login...' : 'Sign In'}
          </button>
        </div>

        <div className="text-sm mt-4">
            <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
            >
                Forgot your password?
            </Link>
        </div>

      </div>
    </div>
  );
}

// Removed named export "Login" as it's default export now.