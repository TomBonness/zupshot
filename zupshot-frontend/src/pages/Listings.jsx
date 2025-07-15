import ListingCard from '../components/ListingCard';

export default function Listings() {
  // Mock data for testing (will replace with API data later)
  const mockListings = [
    {
      name: 'John Doe',
      location: 'New York, NY',
      price: 'Free',
      imageUrl: 'https://thumbs.dreamstime.com/b/portrait-young-girl-summer-sunny-lifestyle-trendy-portrait-young-stylish-hipster-woman-walking-street-wearing-cute-185133774.jpg',
    },
    {
      name: 'Jane Smith',
      location: 'Los Angeles, CA',
      price: '$50',
      imageUrl: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?cs=srgb&dl=pexels-olly-762020.jpg&fm=jpg',
    },
    {
      name: 'Alex Brown',
      location: 'Chicago, IL',
      price: 'Free',
      imageUrl: 'https://www.anthropics.com/portraitpro/img/page-images/homepage/v22/what-can-it-do-2A.jpg',
    },
    {
      name: 'Emma Wilson',
      location: 'Miami, FL',
      price: '$75',
      imageUrl: 'https://cdn.mos.cms.futurecdn.net/5rw4iYEgEBxupC6WRffpTF.png',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-dark-gray mb-6">
        Browse Photographers
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockListings.map((listing, index) => (
          <ListingCard
            key={index}
            name={listing.name}
            location={listing.location}
            price={listing.price}
            imageUrl={listing.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}