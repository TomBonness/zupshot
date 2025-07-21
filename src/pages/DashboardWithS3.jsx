import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { uploadData, remove } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
import { createProfile, updateProfile, deleteProfile } from '@/graphql/mutations';
import { listProfiles } from '@/graphql/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';

const client = generateClient();
const ItemTypes = {
  IMAGE: 'image',
  PORTFOLIO_IMAGE: 'portfolio_image',
};

const DraggableImage = ({ url, index, moveImage, removeImage, alt, itemType, onClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: itemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: itemType,
    hover: (item) => {
      if (item.index !== index) {
        moveImage(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <motion.div
      ref={(node) => drag(drop(node))}
      className={`relative w-full h-24 object-cover rounded-lg shadow-sm ${isDragging ? 'opacity-50' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <img src={url} alt={alt} className="w-full h-full object-cover rounded-lg" />
      <Button
        variant="destructive"
        size="sm"
        className="absolute top-1 right-1 bg-soft-red text-white hover:bg-dark-gray"
        onClick={(e) => {
          e.stopPropagation(); // Prevent dialog opening on delete
          removeImage(index);
        }}
      >
        X
      </Button>
    </motion.div>
  );
};

export default function DashboardWithS3() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    description: '',
    imageUrls: [],
    portfolioImages: [],
    availability: '',
    pricingDetails: '',
    instagram: '',
    website: '',
    email: '',
  });
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fallback bucket and region
  const S3_BUCKET = import.meta.env.VITE_S3_BUCKET || 'zupshotbucketae993-dev';
  const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        const session = await fetchAuthSession();
        setUser(currentUser);
        const response = await client.graphql({
          query: listProfiles,
          variables: { filter: { owner: { eq: currentUser.userId } } },
          authMode: 'apiKey',
        });
        const { data, errors } = response;
        if (errors) {
          throw new Error('Failed to fetch profile data due to server issues.');
        }
        const userProfile = data.listProfiles.items[0];
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            name: userProfile.name,
            location: userProfile.location,
            price: userProfile.price,
            description: userProfile.description,
            imageUrls: userProfile.imageUrls || [],
            portfolioImages: userProfile.portfolioImages || [],
            availability: userProfile.availability || '',
            pricingDetails: userProfile.pricingDetails || '',
            instagram: userProfile.instagram || '',
            website: userProfile.website || '',
            email: userProfile.email || '',
          });
        }
      } catch (err) {
        console.error('Error fetching user or profile:', err);
        setError(err.message);
        navigate('/signin');
      }
    };
    fetchUserAndProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // TODO: convert images uploaded to a fixed size like 5MB max
  const uploadImages = async (acceptedFiles, field) => {
    try {
      const newUrls = [];
      for (const file of acceptedFiles) {
        const key = `public/${user?.userId}/${field}/${encodeURIComponent(file.name)}`;
        await uploadData({
          path: key,
          data: file,
          options: { contentType: file.type, accessLevel: 'public' },
        }).result;
        // Construct public S3 URL
        const url = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
        newUrls.push(url);
      }
      setFormData({ ...formData, [field]: [...formData[field], ...newUrls] });
      toast.success(`${newUrls.length} ${field} uploaded successfully!`);
    } catch (err) {
      console.error('S3 upload error:', err);
      setError(`Failed to upload ${field}: ${err.message}`);
      toast.error(`Failed to upload ${field}. Please try again.`);
    }
  };

  const moveImage = (field, fromIndex, toIndex) => {
    const updatedImages = [...formData[field]];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    setFormData({ ...formData, [field]: updatedImages });
  };

  const removeImage = async (field, index) => {
    try {
      const updatedImages = [...formData[field]];
      const url = updatedImages[index];
      const key = `public/${user?.userId}/${field}/${decodeURIComponent(url.split('/').pop().split('?')[0])}`;
      await remove({ path: key, options: { accessLevel: 'public' } });
      updatedImages.splice(index, 1);
      setFormData({ ...formData, [field]: updatedImages });
      toast.success('Image deleted successfully!');
    } catch (err) {
      console.error(`Error deleting S3 object:`, err);
      setError(`Failed to delete image: ${err.message}`);
      toast.error(`Failed to delete image. Please try again.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
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
              imageUrls: formData.imageUrls,
              portfolioImages: formData.portfolioImages,
              availability: formData.availability,
              pricingDetails: formData.pricingDetails,
              instagram: formData.instagram,
              website: formData.website,
              email: formData.email,
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
              imageUrls: formData.imageUrls,
              portfolioImages: formData.portfolioImages,
              availability: formData.availability,
              pricingDetails: formData.pricingDetails,
              instagram: formData.instagram,
              website: formData.website,
              email: formData.email,
              owner: user.userId,
            },
          },
          authMode: 'userPool',
        });
        setProfile({ ...formData, id: response.data.createProfile.id });
        toast.success('Profile created successfully!');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile: ' + err.message);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your profile?')) {
      try {
        if (profile) {
          // Delete images from S3
          for (const url of [...profile.imageUrls, ...profile.portfolioImages]) {
            const field = url.includes('imageUrls') ? 'imageUrls' : 'portfolioImages';
            const key = `public/${user?.userId}/${field}/${decodeURIComponent(url.split('/').pop().split('?')[0])}`;
            try {
              await remove({ path: key, options: { accessLevel: 'public' } });
            } catch (err) {
              console.error(`Error deleting S3 object ${key}:`, err);
            }
          }
          // Delete profile from DynamoDB
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
          description: '', 
          imageUrls: [], 
          portfolioImages: [], 
          availability: '', 
          pricingDetails: '', 
          instagram: '', 
          website: '', 
          email: '',
        });
        toast.success('Profile and associated images deleted successfully!');
      } catch (err) {
        console.error('Error deleting profile:', err);
        setError('Failed to delete profile: ' + err.message);
        toast.error('Failed to delete profile. Please try again.');
      }
    }
  };

  const { getRootProps: getMainProps, getInputProps: getMainInputProps } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [] },
    multiple: false,
    maxFiles: 1,
    onDrop: (acceptedFiles) => uploadImages(acceptedFiles, 'imageUrls'),
  });

  const { getRootProps: getPortfolioProps, getInputProps: getPortfolioInputProps } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [] },
    multiple: true,
    onDrop: (acceptedFiles) => uploadImages(acceptedFiles, 'portfolioImages'),
  });

  if (!user) {
    return null;
  }
  // TODO: Add some type of loading indicator while the photos are uploading
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-light-gray">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          <Header />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-dark-gray">
                  {profile ? 'Edit Your Profile' : 'Create Your Profile'}
                </CardTitle>
                <p className="text-sm text-dark-gray">Build your photographer profile to connect with clients.</p>
              </CardHeader>
              <CardContent>
                {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
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
                      className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg whitespace-pre-wrap"
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
                      className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg whitespace-pre-wrap"
                      rows="4"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-dark-gray font-medium">Profile Image</Label>
                    <p className="text-sm text-dark-gray">Upload one profile image to display at the top of your profile page.</p>
                    <div {...getMainProps()} className="border border-dashed border-light-gray p-4 rounded-lg text-center cursor-pointer hover:bg-tan-yellow/20 transition-colors">
                      <input {...getMainInputProps()} />
                      <p className="text-sm text-dark-gray">Drag & drop or click to upload profile image (JPEG/PNG)</p>
                    </div>
                    <AnimatePresence>
                      {formData.imageUrls.length > 0 && (
                        <motion.div
                          className="grid grid-cols-1 gap-2 mt-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {formData.imageUrls.map((url, index) => (
                            <div
                              key={index}
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedImage(url);
                                setDialogOpen(true);
                              }}
                            >
                              <DraggableImage
                                url={url}
                                index={index}
                                moveImage={(from, to) => moveImage('imageUrls', from, to)}
                                removeImage={() => removeImage('imageUrls', index)}
                                alt={`Profile Image ${index + 1}`}
                                itemType={ItemTypes.IMAGE}
                                onClick={() => {
                                  setSelectedImage(url);
                                  setDialogOpen(true);
                                }}
                              />
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-dark-gray font-medium">Portfolio Images (Gallery)</Label>
                    <p className="text-sm text-dark-gray">Upload as many images as you want for the portfolio gallery section of your profile page.</p>
                    <div {...getPortfolioProps()} className="border border-dashed border-light-gray p-4 rounded-lg text-center cursor-pointer hover:bg-tan-yellow/20 transition-colors">
                      <input {...getPortfolioInputProps()} />
                      <p className="text-sm text-dark-gray">Drag & drop or click to upload portfolio images (JPEG/PNG)</p>
                    </div>
                    <AnimatePresence>
                      {formData.portfolioImages.length > 0 && (
                        <motion.div
                          className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 mt-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {formData.portfolioImages.map((url, index) => (
                            <div
                              key={index}
                              className={`break-inside-avoid ${index % 2 === 0 ? 'mt-0' : 'mt-8'} cursor-pointer`}
                              onClick={() => {
                                setSelectedImage(url);
                                setDialogOpen(true);
                              }}
                            >
                              <DraggableImage
                                url={url}
                                index={index}
                                moveImage={(from, to) => moveImage('portfolioImages', from, to)}
                                removeImage={() => removeImage('portfolioImages', index)}
                                alt={`Portfolio Preview ${index + 1}`}
                                itemType={ItemTypes.PORTFOLIO_IMAGE}
                                onClick={() => {
                                  setSelectedImage(url);
                                  setDialogOpen(true);
                                }}
                              />
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-dark-gray font-medium">Contact Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your contact email"
                      className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                    />
                  </div>
                  <div className="flex gap-4 justify-center">
                    <motion.div
                      animate={isSubmitting ? { scale: [1, 1.1, 1] } : { scale: 1}}
                      transition={{ duration: 0.5, repeat: isSubmitting ? Infinity : 0 }}
                    >
                      <Button 
                        type="submit" 
                        className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray transition-transform hover:scale-105 rounded-lg"
                        disabled={isSubmitting}
                      >
                        {profile ? 'Update Profile' : 'Create Profile'}
                      </Button>
                    </motion.div>
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
          </motion.div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Image Preview</DialogTitle>
              </DialogHeader>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Selected Image"
                  className="w-full max-w-full max-h-[80vh] object-contain"
                />
              )}
            </DialogContent>
          </Dialog>
          {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
        </div>
      </div>
    </DndProvider>
  );
}