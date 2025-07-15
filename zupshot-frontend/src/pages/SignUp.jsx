import { useState } from 'react';
import { Link } from 'react-router-dom';
import { signUp } from 'aws-amplify/auth';
import Button from '../components/Button';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email },
          autoSignIn: { enabled: true },
        },
      });
      alert('Sign-up successful! Check your email for a verification code.');
      // Redirect to /signin or verification page later
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-dark-gray mb-6">Sign Up</h1>
      {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
      <form onSubmit={handleSignUp} className="grid grid-cols-1 gap-4">
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
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-drab"
          required
        />
        <Button type="submit">Sign Up</Button>
      </form>
      <p className="text-sm text-dark-gray mt-4">
        Already have an account?{' '}
        <Link to="/signin" className="text-olive-drab hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}