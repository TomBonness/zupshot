import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { getProfile, listFeedbacks } from '../graphql/queries';
import { createFeedback } from '../graphql/mutations';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import ContentLoader from 'react-content-loader';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const client = generateClient();

const SkeletonProfile = () => (
  <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
    <ContentLoader
      speed={2}
      width={700}
      height={400}
      viewBox="0 0 700 400"
      backgroundColor="#F5F5F5"
      foregroundColor="#E5E5E5"
    >
      <rect x="0" y="0" rx="4" ry="4" width="300" height="24" />
      <rect x="0" y="48" rx="8" ry="8" width="320" height="192" />
      <rect x="340" y="48" rx="4" ry="4" width="200" height="16" />
      <rect x="340" y="76" rx="4" ry="4" width="150" height="16" />
      <rect x="340" y="104" rx="4" ry="4" width="300" height="60" />
      <rect x="0" y="280" rx="4" ry="4" width="300" height="24" />
      <rect x="0" y="320" rx="4" ry="4" width="700" height="80" />
    </ContentLoader>
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
  const navigate = useNavigate();

  useEffect(() => {
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
  }, [id]);

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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <p className="text-sm text-soft-red">{error || 'Profile not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-dark-gray mb-6">{profile.name}</h1>
      {error && <p className="text-sm text-soft-red mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Carousel
          showArrows
          showThumbs={false}
          infiniteLoop
          className="w-full"
        >
          {profile.imageUrls && profile.imageUrls.length > 0 ? (
            profile.imageUrls.map((url, index) => (
              <div key={index}>
                <img
                  src={url || 'https://via.placeholder.com/128'}
                  alt={`${profile.name} ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            ))
          ) : (
            <img
              src="https://via.placeholder.com/128"
              alt="Placeholder"
              className="w-full h-64 object-cover rounded-lg"
            />
          )}
        </Carousel>
        <div>
          <p className="text-dark-gray"><strong>Location:</strong> {profile.location}</p>
          <p className="text-dark-gray"><strong>Price:</strong> {profile.price}</p>
          <p className="text-dark-gray mt-4">{profile.description}</p>
        </div>
      </div>
      <div className="mt-8">
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