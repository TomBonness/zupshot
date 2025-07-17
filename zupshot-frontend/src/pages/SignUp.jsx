import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import Header from '@/components/Header';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signUp({
        username: formData.username,
        password: formData.password,
        attributes: { email: formData.email },
      });
      toast.success('Sign up successful! Please check your email for verification.');
      navigate('/signin');
    } catch (err) {
      console.error('Error signing up:', err);
      setError('Failed to sign up: ' + err.message);
      toast.error('Failed to sign up');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Header />
      <Card className="max-w-md mx-auto mt-8 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-dark-gray">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-dark-gray">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="border-light-gray focus:ring-olive-drab"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-dark-gray">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="border-light-gray focus:ring-olive-drab"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-dark-gray">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="border-light-gray focus:ring-olive-drab"
                required
              />
            </div>
            <Button
              type="submit"
              className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray"
            >
              Sign Up
            </Button>
          </form>
          <p className="text-sm text-dark-gray mt-4 text-center">
            Already have an account?{' '}
            <Link to="/signin" className="text-olive-drab hover:underline">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}