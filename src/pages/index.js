import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 text-center">
      {/* Welcome Message */}
      <h1 className="text-5xl font-extrabold text-blue-900 mb-4 drop-shadow-lg animate-fade-in">
        Welcome to GRC³{" "}
      </h1>
      <p className="text-lg text-gray-700 mb-8 max-w-lg mx-auto animate-slide-up">
        Your trusted platform for Security and Compliance.
      </p>

      {/* Login and Signup Card */}
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm mx-auto mt-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Get Started</h2>
        <p className="text-gray-600 mb-8">
          Login to your account or sign up for a new account
        </p>

        <div className="flex flex-col space-y-4">
          <Link href="/login" passHref>
            <button className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition duration-300">
              Login
            </button>
          </Link>
          {/* <Link href="/signup" passHref>
            <button className="w-full px-6 py-3 bg-white text-blue-700 font-semibold rounded-md shadow-md border border-blue-200 hover:bg-blue-50 transition duration-300">
              Sign Up
            </button>
          </Link> */}
          
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 1.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 1.5s ease-out;
        }
      `}</style>
    </div>
  );
}
