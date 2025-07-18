import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { getProfile, listFeedbacks } from '@/graphql/queries';
import { createFeedback } from '@/graphql/mutations';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import Header from '@/components/Header';

const client = generateClient();

const SkeletonProfile = () => (
  <div className="min-h-screen bg-light-gray">
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <Skeleton className="h-12 w-64 bg-white" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="w-full h-[300px] md:h-[500px] rounded-lg bg-white" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 bg-white" />
          <Skeleton className="h-6 w-32 bg-white" />
          <Skeleton className="h-6 w-40 bg-white" />
        </div>
      </div>
      <Skeleton className="w-full h-[200px] rounded-lg bg-white" />
      <Skeleton className="h-8 w-48 bg-white" />
      <Skeleton className="w-full h-24 bg-white" />
    </div>
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
        console.log('No user logged in:', err);
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

  if (loading) {
    return <SkeletonProfile />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-light-gray">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Header />
          <p className="text-sm text-soft-red">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <Header />
        <img
          src={profile.imageUrls?.[0] || 'https://via.placeholder.com/128'}
          alt={`${profile.name} Profile`}
          className="w-full h-[300px] md:h-[500px] object-cover rounded-lg shadow-md"
          loading="lazy"
        />
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-col md:flex-row items-center gap-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profile.imageUrls?.[0] || 'https://via.placeholder.com/128'} alt={profile.name} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-dark-gray">{profile.name}</h1>
              <p className="text-lg text-dark-gray">{profile.location}</p>
              <p className="text-xl font-semibold text-soft-red">{profile.price || 'Free'}</p>
            </div>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <h2 className="text-xl font-semibold text-dark-gray">About Me</h2>
          </CardHeader>
          <CardContent className="prose text-dark-gray">
            {profile.description || 'Not specified'}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <h2 className="text-xl font-semibold text-dark-gray">Availability</h2>
          </CardHeader>
          <CardContent className="prose text-dark-gray">
            {profile.availability || 'Not specified'}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <h2 className="text-xl font-semibold text-dark-gray">Pricing Details</h2>
          </CardHeader>
          <CardContent className="prose text-dark-gray">
            {profile.pricingDetails || 'Not specified'}
          </CardContent>
        </Card>
        <div>
          <h2 className="text-xl font-semibold text-dark-gray mb-4">Portfolio Gallery</h2>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {profile.portfolioImages && profile.portfolioImages.length > 0 ? (
              profile.portfolioImages.map((url, index) => (
                <div
                  key={index}
                  className={`break-inside-avoid ${index % 2 === 0 ? 'mt-0' : 'mt-8'} cursor-pointer`}
                  onClick={() => {
                    setSelectedImage(url);
                    setDialogOpen(true);
                  }}
                >
                  <img
                    src={url || 'https://via.placeholder.com/128'}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-auto object-cover rounded-lg shadow-sm"
                    loading="lazy"
                  />
                </div>
              ))
            ) : (
              <p className="text-dark-gray">No portfolio images available.</p>
            )}
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
              <DialogHeader className="p-4">
                <DialogTitle>Portfolio Image</DialogTitle>
              </DialogHeader>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Selected Portfolio"
                  className="w-full max-w-[90vw] max-h-[80vh] object-contain"
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
                    className="border-olive-drab text-olive-drab hover:bg-tan-yellow hover:text-dark-gray"
                    asChild
                  >
                    <a
                      href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Instagram
                    </a>
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
                    className="border-olive-drab text-olive-drab hover:bg-tan-yellow hover:text-dark-gray"
                    asChild
                  >
                    <a
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Website
                    </a>
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
            asChild
          >
            <a
              href={`mailto:${profile.email || 'contact@zupshot.com'}?subject=Interested in a photoshoot via Zupshot`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact Me
            </a>
          </Button>
        </div>
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
    </div>
  );
}