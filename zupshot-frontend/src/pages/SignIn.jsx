import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate
import { signIn } from 'aws-amplify/auth';
import Button from '../components/Button';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Add navigate hook

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signIn({ username: email, password });
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-dark-gray mb-6">Sign In</h1>
      {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
      <form onSubmit={handleSignIn} className="grid grid-cols-1 gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-drab"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-drab"
          required
        />
        <Button type="submit">Sign In</Button>
      </form>
      <p className="text-sm text-dark-gray mt-4">
        Don’t have an account?{' '}
        <Link to="/signup" className="text-olive-drab hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}