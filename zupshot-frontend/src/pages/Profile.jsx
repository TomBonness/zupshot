import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { getProfile, listFeedbacks } from '@/graphql/queries';
import { createFeedback, deleteProfile } from '@/graphql/mutations';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import Header from '@/components/Header';

const client = generateClient();

const SkeletonProfile = () => (
  <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
    <Skeleton className="h-12 w-64 bg-light-gray" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="w-full h-[300px] md:h-[500px] rounded-lg bg-light-gray" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-light-gray" />
        <Skeleton className="h-6 w-32 bg-light-gray" />
        <Skeleton className="h-6 w-40 bg-light-gray" />
      </div>
    </div>
    <Skeleton className="w-full h-[200px] rounded-lg bg-light-gray" />
    <Skeleton className="h-8 w-48 bg-light-gray" />
    <Skeleton className="w-full h-24 bg-light-gray" />
  </div>
);

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError('Invalid profile ID');
      setLoading(false);
      return;
    }
    const fetchUserAndData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('No user logged in:', err);
      }
      try {
        setLoading(true);
        console.log('Fetching profile with ID:', id);
        const response = await client.graphql({ 
          query: getProfile, 
          variables: { id }, 
          authMode: 'apiKey' 
        });
        console.log('getProfile Response:', response);
        if (response.errors) {
          console.log('getProfile errors:', response.errors);
          setError('Failed to load profile');
          setLoading(false);
          return;
        }
        if (!response.data.getProfile) {
          console.log('Profile not found for ID:', id);
          setError('Profile not found');
          setLoading(false);
          return;
        }
        setProfile(response.data.getProfile);
        const feedbackResponse = await client.graphql({ 
          query: listFeedbacks, 
          variables: { filter: { profileId: { eq: id } } }, 
          authMode: 'apiKey' 
        });
        console.log('listFeedbacks Response:', feedbackResponse);
        if (feedbackResponse.errors) {
          console.log('listFeedbacks errors:', feedbackResponse.errors);
          setError('Failed to load feedback');
          setLoading(false);
          return;
        }
        setFeedbacks(feedbackResponse.data.listFeedbacks.items);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load profile or feedback');
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndData();
  }, [id, navigate]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to submit feedback');
      navigate('/signin');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5');
      toast.error('Rating must be between 1 and 5');
      return;
    }
    try {
      await client.graphql({
        query: createFeedback,
        variables: {
          input: { rating, comment, profileId: id, owner: user.userId },
        },
        authMode: 'userPool',
      });
      setRating(0);
      setComment('');
      const { data } = await client.graphql({ 
        query: listFeedbacks, 
        variables: { filter: { profileId: { eq: id } } }, 
        authMode: 'apiKey' 
      });
      setFeedbacks(data.listFeedbacks.items);
      toast.success('Feedback submitted successfully!');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback: ' + err.message);
      toast.error('Failed to submit feedback');
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
        navigate('/dashboard');
        toast.success('Profile deleted successfully!');
      } catch (err) {
        console.error('Error deleting profile:', err);
        setError('Failed to delete profile: ' + err.message);
        toast.error('Failed to delete profile');
      }
    }
  };

  if (loading) {
    return <SkeletonProfile />;
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Header />
        <p className="text-sm text-soft-red">{error || 'Profile not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <Header />
      <Carousel className="w-full">
        <CarouselContent>
          {profile.imageUrls && profile.imageUrls.length > 0 ? (
            profile.imageUrls.map((url, index) => (
              <CarouselItem key={index}>
                <img
                  src={url || 'https://via.placeholder.com/128'}
                  alt={`${profile.name} ${index + 1}`}
                  className="w-full h-[300px] md:h-[500px] object-cover rounded-lg shadow-md"
                  loading="lazy"
                />
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <img
                src="https://via.placeholder.com/128"
                alt="Placeholder"
                className="w-full h-[300px] md:h-[500px] object-cover rounded-lg shadow-md"
                loading="lazy"
              />
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <Card className="mt-6 bg-white shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-center gap-4">
          <Avatar className="w-32 h-32">
            <AvatarImage src={profile.imageUrls?.[0] || 'https://via.placeholder.com/128'} alt={profile.name} />
            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-dark-gray">{profile.name}</h1>
            <p className="text-lg text-light-gray">{profile.location}</p>
            <p className="text-xl font-semibold text-soft-red">{profile.price || 'Free'}</p>
          </div>
        </CardHeader>
      </Card>
      <Accordion type="single" collapsible className="mt-6">
        <AccordionItem value="about">
          <AccordionTrigger className="text-xl font-semibold text-dark-gray">About Me</AccordionTrigger>
          <AccordionContent className="prose text-dark-gray">{profile.description || 'Not specified'}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="availability">
          <AccordionTrigger className="text-xl font-semibold text-dark-gray">Availability</AccordionTrigger>
          <AccordionContent className="prose text-dark-gray">{profile.availability || 'Not specified'}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="pricing">
          <AccordionTrigger className="text-xl font-semibold text-dark-gray">Pricing Details</AccordionTrigger>
          <AccordionContent className="prose text-dark-gray">{profile.pricingDetails || 'Not specified'}</AccordionContent>
        </AccordionItem>
      </Accordion>
      <div>
        <h2 className="text-xl font-semibold text-dark-gray mb-4">Portfolio Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {profile.portfolioImages && profile.portfolioImages.length > 0 ? (
            profile.portfolioImages.map((url, index) => (
              <img
                key={index}
                src={url || 'https://via.placeholder.com/128'}
                alt={`Portfolio ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer"
                onClick={() => {
                  setSelectedImage(url);
                  setDialogOpen(true);
                }}
                loading="lazy"
              />
            ))
          ) : (
            <p className="text-dark-gray">No portfolio images available.</p>
          )}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Portfolio Image</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Selected Portfolio"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex gap-4">
        {profile.instagram && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="border-olive-drab text-olive-drab hover:bg-tan-yellow"
                  as="a"
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View on Instagram</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {profile.website && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="border-olive-drab text-olive-drab hover:bg-tan-yellow"
                  as="a"
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visit website</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Button
          className="bg-olive-drab hover:bg-tan-yellow text-white hover:text-dark-gray"
          as="a"
          href={`mailto:${user?.username}?subject=Interested in a photoshoot via Zupshot`}
        >
          Contact Me
        </Button>
      </div>
      {user && user.userId === profile.owner && (
        <div className="flex gap-4">
          <Button onClick={() => navigate('/dashboard')}>
            Edit Profile
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete Profile
          </Button>
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold text-dark-gray mb-4">Feedback</h2>
        {user ? (
          <form onSubmit={handleFeedbackSubmit} className="grid grid-cols-1 gap-4 mb-6">
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              placeholder="Rating (1-5)"
              className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-drab"
              required
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Your feedback..."
              className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-drab"
              rows="4"
            />
            <Button type="submit" className="transition-transform duration-200 hover:scale-105">
              Submit Feedback
            </Button>
          </form>
        ) : (
          <p className="text-sm text-soft-red mb-4">Please sign in to submit feedback.</p>
        )}
        {feedbacks.length > 0 ? (
          feedbacks.map((feedback) => (
            <div key={feedback.id} className="border-t border-light-gray pt-4 mt-4">
              <p className="text-dark-gray"><strong>Rating:</strong> {feedback.rating}/5</p>
              <p className="text-dark-gray">{feedback.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-dark-gray">No feedback yet.</p>
        )}
      </div>
    </div>
  );
}