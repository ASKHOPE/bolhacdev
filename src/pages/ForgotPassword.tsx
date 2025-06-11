import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Or useAuth0 directly if preferred

export default function ForgotPassword() {
  const { resetPassword, isLoading } = useAuth(); // Assuming resetPassword from context handles it or guides

  // In a real scenario, you might not call resetPassword() directly here
  // but rather guide the user to Auth0's Universal Login if that's your flow.
  // The resetPassword function in AuthContext was updated to:
  // alert('Please use the password reset option on the login page.');
  // So, this page can simply reinforce that.

  const handleForgotPasswordInfo = () => {
    // This function could be used if `resetPassword` in context initiated something.
    // For now, it's more informational.
    resetPassword(); // This will trigger the alert from AuthContext.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
        </div>

        <div className="mt-8 space-y-6 bg-white p-8 shadow-lg rounded-lg">
          <p className="text-gray-700">
            To reset your password, please visit the login page and click on the "Forgot your password?" link.
            You will be guided through the password reset process by Auth0.
          </p>
          <p className="text-gray-700 mt-4">
            Alternatively, you can click the button below to see the instructions provided by our authentication system.
          </p>

          <button
            onClick={handleForgotPasswordInfo}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 mt-6"
          >
            {isLoading ? 'Loading...' : 'Show Password Reset Instructions'}
          </button>
        </div>

        <div className="mt-4 text-sm">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
