import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listProfiles } from '@/graphql/queries';

const client = generateClient();

export default function Header() {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        const response = await client.graphql({
          query: listProfiles,
          variables: { filter: { owner: { eq: currentUser.userId } } },
          authMode: 'apiKey',
        });
        const profiles = response.data.listProfiles.items;
        setHasProfile(profiles.length > 0);
      } catch (err) {
        console.error('No user logged in or error fetching profile:', err);
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-light-gray">
      <Link to="/" className="text-2xl font-bold text-olive-drab hover:text-tan-yellow transition-colors">
        Zupshot
      </Link>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="border-olive-drab text-olive-drab hover:bg-tan-yellow"
          asChild
        >
          <Link to="/listings">Browse Listings</Link>
        </Button>
        <Button
          className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray"
          onClick={() => navigate(user ? '/dashboard' : '/signup')}
        >
          {hasProfile ? 'Edit Your Profile' : 'Post Your Profile'}
        </Button>
        {!user && (
          <>
            <Button
              variant="outline"
              className="border-olive-drab text-olive-drab hover:bg-tan-yellow sm:block hidden"
              asChild
            >
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button
              className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray"
              asChild
            >
              <Link to="/signup">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}