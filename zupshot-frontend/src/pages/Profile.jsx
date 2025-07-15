import { Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Button from '../components/Button';

export default function Profile() {
  // Mock data for testing (replace with API data later)
  const mockProfile = {
    name: 'John Doe',
    location: 'New York, NY',
    price: 'Free',
    description:
      'Passionate beginner photographer specializing in candid portraits and urban landscapes. Available for casual shoots to build my portfolio!',
    images: [
      'https://www.anthropics.com/portraitpro/img/page-images/homepage/v22/what-can-it-do-2A.jpg',
      'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?cs=srgb&dl=pexels-olly-762020.jpg&fm=jpg',
      'https://cdn.mos.cms.futurecdn.net/5rw4iYEgEBxupC6WRffpTF.png',
    ],
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Hero Image Carousel */}
      <Carousel
        showThumbs={false}
        showStatus={false}
        infiniteLoop
        autoPlay
        interval={5000}
        className="mb-6"
      >
        {mockProfile.images.map((image, index) => (
          <div key={index}>
            <img
              src={image}
              alt={`Portfolio ${index + 1}`}
              className="w-full h-[300px] sm:h-[400px] object-cover rounded-lg"
              loading="lazy"
            />
          </div>
        ))}
      </Carousel>

      {/* Profile Details */}
      <div className="grid grid-cols-1 gap-4">
        <h1 className="text-3xl font-bold text-dark-gray">{mockProfile.name}</h1>
        <p className="text-sm text-dark-gray">{mockProfile.location}</p>
        <p className="text-sm font-medium text-soft-red">
          {mockProfile.price || 'Free'}
        </p>
        <p className="text-base text-dark-gray">{mockProfile.description}</p>
        <Link to="mailto:example@email.com">
          <Button>Contact</Button>
        </Link>
      </div>
    </div>
  );
}