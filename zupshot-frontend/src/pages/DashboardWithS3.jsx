import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
import { createProfile, updateProfile, deleteProfile } from '@/graphql/mutations';
import { listProfiles } from '@/graphql/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/Header';

const client = generateClient();

export default function DashboardWithS3() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    email: '',
    description: '',
    imageUrls: [],
    portfolioImages: [],
    availability: '',
    pricingDetails: '',
    instagram: '',
    website: '',
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
            email: userProfile.email || '',
            description: userProfile.description,
            imageUrls: userProfile.imageUrls || [],
            portfolioImages: userProfile.portfolioImages || [],
            availability: userProfile.availability || '',
            pricingDetails: userProfile.pricingDetails || '',
            instagram: userProfile.instagram || '',
            website: userProfile.website || '',
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

  const uploadImages = async (acceptedFiles, field) => {
    try {
      const newUrls = [];
      for (const file of acceptedFiles) {
        const key = `private/${user?.userId || 'temp'}/${field}/${file.name}`;
        await uploadData({
          path: key,
          data: file,
          options: { contentType: file.type, accessLevel: 'private' },
        }).result;
        const { url } = await getUrl({ path: key, options: { accessLevel: 'private' } });
        newUrls.push(url.toString());
      }
      setFormData({ ...formData, [field]: [...formData[field], ...newUrls] });
      toast.success(`${newUrls.length} ${field} uploaded successfully!`);
    } catch (err) {
      console.error('S3 upload error:', err);
      setError(`Failed to upload ${field}: ` + err.message);
      toast.error(`Failed to upload ${field}`);
    }
  };

  const { getRootProps: getMainProps, getInputProps: getMainInputProps } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [] },
    multiple: true,
    maxFiles: 5,
    onDrop: (acceptedFiles) => uploadImages(acceptedFiles, 'imageUrls'),
  });

  const { getRootProps: getPortfolioProps, getInputProps: getPortfolioInputProps } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [] },
    multiple: true,
    onDrop: (acceptedFiles) => uploadImages(acceptedFiles, 'portfolioImages'),
  });

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
              email: formData.email,
              description: formData.description,
              imageUrls: formData.imageUrls,
              portfolioImages: formData.portfolioImages,
              availability: formData.availability,
              pricingDetails: formData.pricingDetails,
              instagram: formData.instagram,
              website: formData.website,
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
              email: formData.email,
              description: formData.description,
              imageUrls: formData.imageUrls,
              portfolioImages: formData.portfolioImages,
              availability: formData.availability,
              pricingDetails: formData.pricingDetails,
              instagram: formData.instagram,
              website: formData.website,
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
        setFormData({ 
          name: '', 
          location: '', 
          price: '', 
          email: '',
          description: '', 
          imageUrls: [], 
          portfolioImages: [], 
          availability: '', 
          pricingDetails: '', 
          instagram: '', 
          website: '' 
        });
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
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <Header />
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-dark-gray">Your Profile Preview</CardTitle>
            <p className="text-sm text-dark-gray">See how your profile will look to others.</p>
          </CardHeader>
          <CardContent>
            {profile ? (
              <Link to={`/profile/${profile.id}`}>
                <img
                  src={formData.imageUrls?.[0] || 'https://via.placeholder.com/128'}
                  alt={formData.name || 'Profile Image'}
                  className="w-full h-[300px] md:h-[400px] object-cover rounded-lg shadow-md mb-4"
                  loading="lazy"
                />
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={formData.imageUrls?.[0] || 'https://via.placeholder.com/128'} alt={formData.name} />
                    <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold text-dark-gray">{formData.name || 'Your Name'}</h1>
                    <p className="text-lg text-dark-gray">{formData.location || 'Your Location'}</p>
                    <p className="text-lg font-semibold text-soft-red">{formData.price || 'Free'}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <p className="text-dark-gray text-center">Fill out the form to see your profile preview here.</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-dark-gray">
              {profile ? 'Edit Your Profile' : 'Create Your Profile'}
            </CardTitle>
            <p className="text-sm text-dark-gray">Build your photographer profile to connect with clients.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-dark-gray font-medium">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-dark-gray font-medium">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                  className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price" className="text-dark-gray font-medium">Price</Label>
                <Input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Price (e.g., Free, $50)"
                  className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-dark-gray font-medium">About Me</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your photography services..."
                  className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                  rows="4"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="availability" className="text-dark-gray font-medium">Availability</Label>
                <Textarea
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  placeholder="Availability (e.g., Weekends only, evenings after 5pm)"
                  className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                  rows="4"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pricingDetails" className="text-dark-gray font-medium">Pricing Details</Label>
                <Textarea
                  id="pricingDetails"
                  name="pricingDetails"
                  value={formData.pricingDetails}
                  onChange={handleInputChange}
                  placeholder="Pricing Details (e.g., Basic shoot: $50, Edits included: +$20)"
                  className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                  rows="4"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-dark-gray font-medium">Cover Photo</Label>
                <p className="text-sm text-dark-gray">Upload up to 5 images; the first will display as the hero image at the top of your profile page.</p>
                <div {...getMainProps()} className="border border-dashed border-light-gray p-4 rounded-lg text-center cursor-pointer hover:bg-tan-yellow/20 transition-colors">
                  <input {...getMainInputProps()} />
                  <p className="text-sm text-dark-gray">Drag & drop or click to upload main images (JPEG/PNG)</p>
                </div>
                {formData.imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {formData.imageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Main Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg shadow-sm"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label className="text-dark-gray font-medium">Portfolio Images (Gallery)</Label>
                <p className="text-sm text-dark-gray">Upload as many images as you want for the portfolio gallery section of your profile page.</p>
                <div {...getPortfolioProps()} className="border border-dashed border-light-gray p-4 rounded-lg text-center cursor-pointer hover:bg-tan-yellow/20 transition-colors">
                  <input {...getPortfolioInputProps()} />
                  <p className="text-sm text-dark-gray">Drag & drop or click to upload portfolio images (JPEG/PNG)</p>
                </div>
                {formData.portfolioImages.length > 0 && (
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 mt-4">
                    {formData.portfolioImages.map((url, index) => (
                      <div key={index} className={`break-inside-avoid ${index % 2 === 0 ? 'mt-0' : 'mt-8'}`}>
                        <img
                          src={url}
                          alt={`Portfolio Preview ${index + 1}`}
                          className="w-full h-auto object-cover rounded-lg shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-dark-gray font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your email"
                  className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instagram" className="text-dark-gray font-medium">Instagram Handle</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="Instagram Handle (e.g., @photographer)"
                  className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website" className="text-dark-gray font-medium">Website (optional)</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Website"
                  className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                />
              </div>
              <div className="flex gap-4 justify-center">
                <Button 
                  type="submit" 
                  className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray transition-transform hover:scale-105 rounded-lg"
                >
                  {profile ? 'Update Profile' : 'Create Profile'}
                </Button>
                {profile && (
                  <Button
                    variant="destructive"
                    className="hover:bg-soft-red hover:text-white transition-transform hover:scale-105 rounded-lg"
                    onClick={handleDelete}
                  >
                    Delete Profile
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}