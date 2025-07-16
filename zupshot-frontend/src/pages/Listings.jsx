import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listProfiles } from '../graphql/queries';
import ListingCard from '../components/ListingCard';

const client = generateClient();

export default function Listings() {
  const [profiles, setProfiles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data } = await client.graphql({ query: listProfiles, authMode: 'apiKey' });
        setProfiles(data.listProfiles.items);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load profiles');
      }
    };
    fetchProfiles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-dark-gray mb-6">Photographer Listings</h1>
      {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <ListingCard
              key={profile.id}
              name={profile.name}
              location={profile.location}
              price={profile.price}
              imageUrl={profile.imageUrl}
              id={profile.id}
            />
          ))
        ) : (
          <p className="text-dark-gray">No photographers found.</p>
        )}
      </div>
    </div>
  );
}