import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
import { createProfile, updateProfile, deleteProfile } from '../graphql/mutations';
import { listProfiles } from '../graphql/queries';
import ListingCard from '../components/ListingCard';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const client = generateClient();

export default function DashboardWithS3() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    description: '',
    imageUrl: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log('Current User:', currentUser);
        const session = await fetchAuthSession();
        console.log('Session:', session);
        setUser(currentUser);
        const response = await client.graphql({
          query: listProfiles,
          variables: { filter: { owner: { eq: currentUser.userId } } },
          authMode: 'apiKey',
        });
        console.log('GraphQL Response:', response);
        const { data, errors } = response;
        if (errors) {
          console.log('GraphQL errors:', errors);
          setError('Failed to fetch profile data');
          return;
        }
        const userProfile = data.listProfiles.items[0];
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            name: userProfile.name,
            location: userProfile.location,
            price: userProfile.price,
            description: userProfile.description,
            imageUrl: userProfile.imageUrl || '',
          });
        }
      } catch (err) {
        console.error('Error fetching user or profile:', err);
        navigate('/signin');
      }
    };
    fetchUserAndProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG or PNG image');
      toast.error('Please upload a JPEG or PNG image');
      return;
    }

    try {
      const key = `private/${user?.userId || 'temp'}/${file.name}`;
      await uploadData({
        path: key,
        data: file,
        options: { contentType: file.type, accessLevel: 'private' },
      }).result;
      const { url } = await getUrl({ path: key, options: { accessLevel: 'private' } });
      setFormData({ ...formData, imageUrl: url.toString() });
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error('S3 upload error:', err);
      setError('Failed to upload image: ' + err.message);
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (profile) {
        await client.graphql({
          query: updateProfile,
          variables: {
            input: {
              id: profile.id,
              name: formData.name,
              location: formData.location,
              price: formData.price,
              description: formData.description,
              imageUrl: formData.imageUrl,
            },
          },
          authMode: 'userPool',
        });
        toast.success('Profile updated successfully!');
      } else {
        const response = await client.graphql({
          query: createProfile,
          variables: {
            input: {
              name: formData.name,
              location: formData.location,
              price: formData.price,
              description: formData.description,
              imageUrl: formData.imageUrl,
              owner: user.userId,
            },
          },
          authMode: 'userPool',
        });
        console.log('Created Profile ID:', response.data.createProfile.id);
        setProfile({ ...formData, id: response.data.createProfile.id });
        toast.success('Profile created successfully!');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile: ' + err.message);
      toast.error('Failed to save profile');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your profile?')) {
      try {
        if (profile) {
          await client.graphql({
            query: deleteProfile,
            variables: { input: { id: profile.id } },
            authMode: 'userPool',
          });
        }
        setProfile(null);
        setFormData({ name: '', location: '', price: '', description: '', imageUrl: '' });
        toast.success('Profile deleted successfully!');
      } catch (err) {
        console.error('Error deleting profile:', err);
        setError('Failed to delete profile: ' + err.message);
        toast.error('Failed to delete profile');
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-dark-gray mb-6">Your Dashboard</h1>
      <p className="text-sm text-dark-gray mb-4">Welcome, {user.username}!</p>
      {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile ? (
          <div>
            <h2 className="text-xl font-semibold text-dark-gray mb-4">Profile Preview</h2>
            <Link to={`/profile/${profile.id}`}> {/* Use profile.id */}
              <ListingCard
                name={profile.name}
                location={profile.location}
                price={profile.price}
                imageUrl={profile.imageUrl}
              />
            </Link>
          </div>
        ) : (
          <p className="text-sm text-dark-gray">No profile created yet.</p>
        )}
        <div>
          <h2 className="text-xl font-semibold text-dark-gray mb-4">
            {profile ? 'Edit Profile' : 'Create Profile'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
              className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-drab"
              required
            />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Location"
              className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-drab"
              required
            />
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Price (e.g., Free, $50)"
              className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-drab"
              required
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your photography services..."
              className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-drab"
              rows="4"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-3 border border-light-gray rounded-lg"
            />
            <div className="flex gap-4">
              <Button type="submit">{profile ? 'Update Profile' : 'Create Profile'}</Button>
              {profile && (
                <Button
                  type="button"
                  className="bg-soft-red hover:bg-red-700"
                  onClick={handleDelete}
                >
                  Delete Profile
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}