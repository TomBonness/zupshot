import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { listProfiles } from '@/graphql/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import toast from 'react-hot-toast';
import Header from '@/components/Header';

const client = generateClient();

export default function Listings() {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const { data } = await client.graphql({ query: listProfiles, authMode: 'apiKey' });
        setProfiles(data.listProfiles.items);
        setFilteredProfiles(data.listProfiles.items);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load profiles');
        toast.error('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    const filtered = profiles.filter((profile) => {
      const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           profile.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = priceFilter ? (priceFilter === 'free' ? profile.price === 'Free' : profile.price !== 'Free') : true;
      return matchesSearch && matchesPrice;
    });
    setFilteredProfiles(filtered);
  }, [searchTerm, priceFilter, profiles]);

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Header />
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm mt-6">
          <Input
            placeholder="Search by name or location"
            className="border-olive-drab focus:ring-tan-yellow"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select onValueChange={setPriceFilter}>
                  <SelectTrigger className="border-olive-drab">
                    <SelectValue placeholder="Filter by Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter listings by price range</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray">Apply</Button>
        </div>
        <h2 className="text-3xl font-bold text-dark-gray mb-6 text-center mt-6">Photographer Listings</h2>
        {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-lg bg-white animate-pulse" />)
          ) : filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile) => (
              <TooltipProvider key={profile.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={`/profile/${profile.id}`}>
                      <Card className="hover:shadow-md transition-shadow hover:border-tan-yellow bg-white">
                        <CardContent className="p-4">
                          <img 
                            src={profile.imageUrls?.[0] || 'https://via.placeholder.com/128'} 
                            alt={profile.name} 
                            className="w-full h-32 object-cover rounded-full mx-auto mb-4 hover:scale-105 transition-transform" 
                            loading="lazy" 
                          />
                          <h2 className="text-xl font-semibold text-dark-gray">{profile.name}</h2>
                          <p className="text-sm text-light-gray">{profile.location}</p>
                          <p className="text-sm font-medium text-soft-red">{profile.price || 'Free'}</p>
                          <Button 
                            className="mt-4 w-full bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray"
                            asChild
                          >
                            <Link to={`/profile/${profile.id}`}>View Profile</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View {profile.name}'s profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))
          ) : (
            <p className="text-dark-gray text-center col-span-full">No matching photographers found.</p>
          )}
        </div>
        <div className="flex flex-col items-center bg-olive-drab text-white p-8 rounded-lg mt-8 col-span-full">
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
            className="bg-tan-yellow text-dark-gray hover:bg-soft-red hover:text-white px-6 py-3 animate-pulse"
            onClick={() => navigate('/signup')}
          >
            Post Your Profile
          </Button>
        </div>
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