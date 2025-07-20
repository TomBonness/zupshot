import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn, signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import Header from '@/components/Header';

export default function SignInSignUp() {
  const [formData, setFormData] = useState({ email: '', password: '', verificationCode: '' });
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signIn({ username: formData.email, password: formData.password });
      toast.success('Successfully signed in!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign-in error:', err);
      const message = err.message || 'Sign-in failed. Check your credentials or try again.';
      setError(message);
      toast.error(message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signUp({
        username: formData.email,
        password: formData.password,
        attributes: { email: formData.email },
      });
      setIsVerifying(true);
      setActiveTab('signup');
      toast.success('Verification code sent to your email!');
    } catch (err) {
      console.error('Sign-up error:', err);
      const message = err.message || 'Sign-up failed. Please try again.';
      setError(message);
      toast.error(message);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    try {
      await confirmSignUp({ username: formData.email, confirmationCode: formData.verificationCode });
      toast.success('Email verified successfully!');
      navigate('/signin');
    } catch (err) {
      console.error('Verification error:', err);
      const message = err.message || 'Verification failed. Check your code or resend it.';
      setError(message);
      toast.error(message);
    }
  };

  const handleResendCode = async () => {
    try {
      await resendSignUpCode({ username: formData.email });
      toast.success('Verification code resent!');
    } catch (err) {
      console.error('Resend code error:', err);
      const message = err.message || 'Failed to resend code. Try again later.';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-light-gray min-h-screen">
      <Header />
      <Card className="max-w-md mx-auto mt-8 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-dark-gray">Sign In / Sign Up</CardTitle>
          <CardDescription className="text-dark-gray">Access your account or create a new one to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-dark-gray">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
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
                    className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray"
                >
                  Sign In
                </Button>
              </form>
              <p className="text-sm text-dark-gray mt-4 text-center">
                Don’t have an account? Switch to{' '}
                <button
                  onClick={() => setActiveTab('signup')}
                  className="text-olive-drab hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </TabsContent>
            <TabsContent value="signup">
              {!isVerifying ? (
                <form onSubmit={handleSignUp} className="grid gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-dark-gray font-medium">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your email"
                      className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-dark-gray font-medium">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Your password"
                      className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray transition-transform hover:scale-105 rounded-lg"
                  >
                    Sign Up
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleConfirmSignUp} className="grid gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="verificationCode" className="text-dark-gray font-medium">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      name="verificationCode"
                      value={formData.verificationCode}
                      onChange={handleInputChange}
                      placeholder="Enter verification code"
                      className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray transition-transform hover:scale-105 rounded-lg"
                  >
                    Verify Email
                  </Button>
                  <Button
                    variant="outline"
                    className="border-olive-drab text-olive-drab hover:bg-tan-yellow hover:text-dark-gray transition-transform hover:scale-105 rounded-lg"
                    onClick={handleResendCode}
                  >
                    Resend Code
                  </Button>
                </form>
              )}
              <p className="text-sm text-dark-gray mt-4 text-center">
                Already have an account? Switch to{' '}
                <button
                  onClick={() => setActiveTab('signin')}
                  className="text-olive-drab hover:underline"
                >
                  Sign In
                </button>
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}