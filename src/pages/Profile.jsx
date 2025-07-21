import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { getProfile, listFeedbacks } from '@/graphql/queries';
import { createFeedback } from '@/graphql/mutations';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

// TODO: Add a button to share profile and maybe integrate it with like instagram in some way?
// TODO: Add username or subject line for the feedback section
// TODO: Give user the ability to delete comments they dont like? maybe?

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState('');
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
        const response = await client.graphql({ 
          query: getProfile, 
          variables: { id }, 
          authMode: 'apiKey' 
        });
        if (response.errors) {
          throw new Error('Failed to load profile due to server issues.');
        }
        if (!response.data.getProfile) {
          throw new Error('Profile not found.');
        }
        setProfile(response.data.getProfile);
        const feedbackResponse = await client.graphql({ 
          query: listFeedbacks, 
          variables: { filter: { profileId: { eq: id } } }, 
          authMode: 'apiKey' 
        });
        if (feedbackResponse.errors) {
          throw new Error('Failed to load feedback due to server issues.');
        }
        setFeedbacks(feedbackResponse.data.listFeedbacks.items || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        toast.error(err.message || 'Failed to load profile or feedback. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndData();
  }, [id, navigate]);

  // TODO: Replace number input with star rating because this is horrible
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to submit feedback');
      navigate('/signin');
      return;
    }
    const ratingValue = parseInt(rating);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      setError('Rating must be between 1 and 5');
      toast.error('Rating must be between 1 and 5');
      return;
    }
    try {
      await client.graphql({
        query: createFeedback,
        variables: {
          input: { rating: ratingValue, comment, profileId: id, owner: user.userId },
        },
        authMode: 'userPool',
      });
      setRating('');
      setComment('');
      const { data } = await client.graphql({ 
        query: listFeedbacks, 
        variables: { filter: { profileId: { eq: id } } }, 
        authMode: 'apiKey' 
      });
      setFeedbacks(data.listFeedbacks.items || []);
      toast.success('Feedback submitted successfully!');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback: ' + err.message);
      toast.error('Failed to submit feedback. Please try again.');
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
          <CardContent className="prose text-dark-gray whitespace-pre-wrap">
            {profile.availability || 'Not specified'}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <h2 className="text-xl font-semibold text-dark-gray">Pricing Details</h2>
          </CardHeader>
          <CardContent className="prose text-dark-gray whitespace-pre-wrap">
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
          {profile.email ? (
            <Button
              className="bg-olive-drab hover:bg-tan-yellow text-white hover:text-dark-gray"
              asChild
            >
              <a
                href={`mailto:${profile.email}?subject=Interested in a photoshoot via Zupshot`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact Me
              </a>
            </Button>
          ) : (
            <Button
              className="bg-olive-drab hover:bg-tan-yellow text-white hover:text-dark-gray"
              disabled
            >
              Contact Me
            </Button>
          )}
        </div>
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-dark-gray">Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <form onSubmit={handleFeedbackSubmit} className="grid grid-cols-1 gap-4 mb-6">
                <div className="grid gap-2">
                  <Label htmlFor="rating" className="text-dark-gray font-medium">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="Rating (1-5)"
                    className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comment" className="text-dark-gray font-medium">Your Feedback</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Your feedback..."
                    className="border-light-gray focus:ring-olive-drab hover:border-tan-yellow transition-colors rounded-lg"
                    rows="4"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray transition-transform hover:scale-105 rounded-lg"
                >
                  Submit Feedback
                </Button>
              </form>
            ) : (
              <p className="text-sm text-soft-red mb-4">Please sign in to submit feedback.</p>
            )}
            {feedbacks.length > 0 ? (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <Card key={feedback.id} className="bg-white shadow-sm">
                    <CardContent className="pt-4">
                      <p className="text-dark-gray font-medium"><strong>Rating:</strong> {feedback.rating}/5</p>
                      <p className="text-dark-gray">{feedback.comment || 'No comment provided'}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-dark-gray">No feedback yet.</p>
            )}
          </CardContent>
        </Card>
        {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
      </div>
    </div>
  );
}