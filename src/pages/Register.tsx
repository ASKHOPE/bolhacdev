import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react'; // Keep icons for potential messages

export default function Register() {
  const { signUp, user, isLoading, error: authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // To check for error messages from Auth0 redirect
  const [message, setMessage] = React.useState(''); // For general messages (e.g. if Auth0 returns specific non-error info)

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Auth0 might pass error messages in query params, e.g., ?error=access_denied&error_description=...
    // This can happen if there's an issue during the signup flow on the Auth0 side.
    const auth0ErrorParam = searchParams.get('error');
    const auth0ErrorDescription = searchParams.get('error_description');
    if (auth0ErrorParam) {
      // Displaying Auth0 specific errors. The global `authError` from `useAuth` might also capture some errors.
      // For now, let's log it. You could set a local error state to display it.
      console.error("Auth0 redirect error during signup:", auth0ErrorDescription || auth0ErrorParam);
      // setMessage(`Error during registration: ${auth0ErrorDescription || auth0ErrorParam}`);
    }
  }, [searchParams]);


  const handleRegister = async () => {
    try {
      // The 'signUp' from AuthContext now uses loginWithRedirect with screen_hint: 'signup'
      await signUp();
    } catch (err) {
      // This catch block might not be reached if errors are handled by redirect params
      // or by the global error state in AuthContext.
      console.error("Error initiating signUp:", err);
      // Optionally set a local error state: setErrorState("Failed to initiate registration. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
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
                  {authError.message || 'An error occurred during registration.'}
                </h3>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="rounded-md bg-green-50 p-4 my-4"> {/* Or appropriate color */}
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
            onClick={handleRegister}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Redirecting to registration...' : 'Create Account with Auth0'}
          </button>
          <p className="mt-4 text-xs text-gray-600">
            By clicking "Create Account with Auth0", you will be redirected to Auth0 to complete your registration.
          </p>
        </div>
      </div>
    </div>
  );
}

// Removed named export "Register" as it's default export now.