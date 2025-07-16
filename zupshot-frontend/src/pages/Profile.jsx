import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { getProfile } from '../graphql/queries';

const client = generateClient();

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await client.graphql({ query: getProfile, variables: { id }, authMode: 'apiKey' });
        setProfile(data.getProfile);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      }
    };
    fetchProfile();
  }, [id]);

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <p className="text-sm text-soft-red">{error || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-dark-gray mb-6">{profile.name}</h1>
      {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <img src={profile.imageUrl || 'https://via.placeholder.com/128'} alt={profile.name} className="w-full h-64 object-cover rounded-lg" />
        <div>
          <p className="text-dark-gray"><strong>Location:</strong> {profile.location}</p>
          <p className="text-dark-gray"><strong>Price:</strong> {profile.price}</p>
          <p className="text-dark-gray mt-4">{profile.description}</p>
        </div>
      </div>
    </div>
  );
}