import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { uploadData, getUrl } from 'aws-amplify/storage';
import ListingCard from '../components/ListingCard';
import Button from '../components/Button';

export default function DashboardWithS3() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    location: 'New York, NY',
    price: 'Free',
    description: 'Passionate beginner photographer...',
    imageUrl: 'https://via.placeholder.com/128',
  });
  const [formData, setFormData] = useState({ ...profile });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Please sign in to access the dashboard');
        navigate('/signin');
      }
    };
    fetchUser();
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
      return;
    }

    try {
      const key = `private/${user?.userId || 'temp'}/${file.name}`; // Updated path
      await uploadData({
        path: key,
        data: file,
        options: { contentType: file.type },
      }).result;
      const { url } = await getUrl({ path: key });
      setFormData({ ...formData, imageUrl: url.toString() });
    } catch (err) {
      console.error('S3 upload error:', err);
      setError('Failed to upload image: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProfile({ ...formData });
    alert('Profile updated!');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your profile?')) {
      setProfile(null);
      alert('Profile deleted!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-dark-gray mb-6">Your Dashboard</h1>
      {user ? (
        <p className="text-sm text-dark-gray mb-4">Welcome, {user.username}!</p>
      ) : (
        <p className="text-sm text-soft-red mb-4">Please sign in to view your dashboard.</p>
      )}
      {error && <p className="text-sm text-soft-red mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile ? (
          <div>
            <h2 className="text-xl font-semibold text-dark-gray mb-4">Profile Preview</h2>
            <Link to={`/profile/${user?.userId || '1'}`}>
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