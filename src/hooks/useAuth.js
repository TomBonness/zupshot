import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { listProfiles } from '@/graphql/queries';

const client = generateClient();

export function useAuth() {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          const response = await client.graphql({
            query: listProfiles,
            variables: { filter: { owner: { eq: currentUser.userId } } },
            authMode: 'apiKey',
          });
          setHasProfile(response.data.listProfiles.items.length > 0);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthData();
  }, []);

  return { user, hasProfile, loading, error };
}