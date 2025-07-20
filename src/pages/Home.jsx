import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { listProfiles } from '@/graphql/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

const client = generateClient();

export default function Home() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, hasProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await client.graphql({
          query: listProfiles,
          variables: { limit: 4 },
          authMode: 'apiKey',
        });
        if (response.errors) {
          throw new Error('Failed to fetch featured photographers due to server issues.');
        }
        setProfiles(response.data.listProfiles.items || []);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError(err.message);
        toast.error(err.message || 'Failed to load featured photographers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Header />
        <section className="flex flex-col items-center justify-center text-center bg-white rounded-lg p-8 mt-8 shadow-md hover:shadow-lg transition-shadow animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-dark-gray mb-4">
            Find Beginner Photographers Near You
          </h1>
          <p className="text-xl text-dark-gray mb-6 max-w-2xl">
            Build a portfolio or get photos done without breaking the bank. Connect with aspiring photographers for affordable, fun shoots.
          </p>
          <div className="flex gap-4">
            <Button
              className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray px-6 py-3 rounded-lg transition-transform hover:scale-105"
              asChild
            >
              <Link to="/listings">Browse Listings</Link>
            </Button>
            <Button
              variant="outline"
              className="border-olive-drab text-olive-drab hover:bg-tan-yellow hover:text-dark-gray px-6 py-3 rounded-lg transition-transform hover:scale-105"
              asChild
            >
              <Link to={user && hasProfile ? '/dashboard' : '/signin'} onClick={() => navigate(user && hasProfile ? '/dashboard' : '/signin')}>
                Post Your Profile
              </Link>
            </Button>
          </div>
        </section>
        <section className="mt-12">
          <h2 className="text-3xl font-bold text-dark-gray mb-6 text-center">Featured Photographers</h2>
          {error && <p className="text-sm text-soft-red mb-4 text-center">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill().map((_, index) => (
                <Skeleton key={index} className="w-full h-64 rounded-lg bg-white animate-pulse" />
              ))
            ) : profiles.length > 0 ? (
              profiles.map((listing) => (
                <Card key={listing.id} className="bg-white hover:shadow-md transition-shadow rounded-lg">
                  <CardContent className="p-4">
                    <Link to={`/profile/${listing.id}`}>
                      <img
                        src={listing.imageUrls?.[0] || 'https://via.placeholder.com/128'}
                        alt={listing.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        loading="lazy"
                      />
                      <h3 className="text-xl font-semibold text-dark-gray">{listing.name}</h3>
                      <p className="text-sm text-dark-gray">{listing.location}</p>
                      <p className="text-sm font-medium text-soft-red">{listing.price || 'Free'}</p>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-dark-gray text-center col-span-full">No photographers found.</p>
            )}
          </div>
        </section>
        <section className="mt-12">
          <h2 className="text-3xl font-bold text-dark-gray mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-olive-drab shadow-md hover:shadow-lg transition-shadow rounded-lg">
              <CardContent className="p-4 text-center">
                <h3 className="text-xl font-semibold text-tan-yellow">1. Browse</h3>
                <p className="text-white">Discover local beginner photographers.</p>
              </CardContent>
            </Card>
            <Card className="bg-olive-drab shadow-md hover:shadow-lg transition-shadow rounded-lg">
              <CardContent className="p-4 text-center">
                <h3 className="text-xl font-semibold text-tan-yellow">2. View Profiles</h3>
                <p className="text-white">Explore portfolios and pricing details.</p>
              </CardContent>
            </Card>
            <Card className="bg-olive-drab shadow-md hover:shadow-lg transition-shadow rounded-lg">
              <CardContent className="p-4 text-center">
                <h3 className="text-xl font-semibold text-tan-yellow">3. Contact</h3>
                <p className="text-white">Reach out to book a shoot.</p>
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="mt-12">
          <h2 className="text-3xl font-bold text-dark-gray mb-6 text-center">What Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg border-tan-yellow">
              <CardContent className="p-4">
                <p className="italic text-dark-gray">"Zupshot made it easy to find affordable photos!"</p>
                <p className="text-right text-dark-gray mt-2">- Jane D.</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg border-tan-yellow">
              <CardContent className="p-4">
                <p className="italic text-dark-gray">"A great way to build my photography portfolio!"</p>
                <p className="text-right text-dark-gray mt-2">- Alex P.</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg border-tan-yellow">
              <CardContent className="p-4">
                <p className="italic text-dark-gray">"Fun and professional photographers!"</p>
                <p className="text-right text-dark-gray mt-2">- Sarah M.</p>
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="flex flex-col items-center bg-olive-drab text-white p-8 rounded-lg mt-8 shadow-md hover:shadow-lg transition-shadow">
          <svg
            className="w-24 h-24 mb-4 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 9a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
          <h2 className="text-3xl font-bold mb-4 text-tan-yellow text-center">Join Our New Photography Community!</h2>
          <p className="text-lg mb-6 text-center max-w-md">Zupshot is a fresh startup connecting aspiring photographers with clients. Post your profile to showcase your skills and join our growing community!</p>
          <Button 
            className="bg-tan-yellow text-dark-gray hover:bg-soft-red hover:text-white px-6 py-3 animate-pulse rounded-lg"
            onClick={() => navigate(user && hasProfile ? '/dashboard' : '/signin')}
          >
            Post Your Profile
          </Button>
        </section>
        <footer className="mt-12 py-6 bg-dark-gray text-center text-light-gray">
          <div className="flex justify-center gap-4 mb-4">
            <Link to="/about" className="hover:text-olive-drab">About</Link>
            <Link to="/terms" className="hover:text-olive-drab">Terms</Link>
            <Link to="/privacy" className="hover:text-olive-drab">Privacy</Link>
          </div>
          <p>© 2025 Zupshot</p>
        </footer>
      </div>
    </div>
  );
}