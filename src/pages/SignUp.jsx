import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import Header from '@/components/Header';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    verificationCode: '',
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signUp({
        username: formData.email, // Using email as username for Cognito
        password: formData.password,
        attributes: {
          email: formData.email,
          preferred_username: formData.username,
        },
      });
      setIsVerifying(true);
      toast.success('Verification code sent to your email!');
    } catch (err) {
      console.error('Error signing up:', err);
      setError('Failed to sign up: ' + err.message);
      toast.error('Failed to sign up');
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    try {
      await confirmSignUp({
        username: formData.email,
        confirmationCode: formData.verificationCode,
      });
      toast.success('Email verified successfully!');
      navigate('/signin');
    } catch (err) {
      console.error('Error confirming sign up:', err);
      setError('Failed to verify email: ' + err.message);
      toast.error('Failed to verify email');
    }
  };

  const handleResendCode = async () => {
    try {
      await resendSignUpCode({ username: formData.email });
      toast.success('Verification code resent!');
    } catch (err) {
      console.error('Error resending code:', err);
      setError('Failed to resend code: ' + err.message);
      toast.error('Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Header />
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-dark-gray">
              {isVerifying ? 'Verify Your Email' : 'Sign Up'}
            </CardTitle>
            <p className="text-sm text-dark-gray">
              {isVerifying ? 'Enter the verification code sent to your email.' : 'Create your Zupshot account.'}
            </p>
          </CardHeader>
          <CardContent>
            {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
            {!isVerifying ? (
              <form onSubmit={handleSignUp} className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-dark-gray font-medium">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Your username"
                    className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                    required
                  />
                </div>
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
              <form onSubmit={handleConfirmSignUp} className="grid grid-cols-1 gap-4">
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
                  className="bg-olive-drab text-white hover:bg-tan-yellowSPACEBAR hover:text-dark-gray transition-transform hover:scale-105 rounded-lg"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}