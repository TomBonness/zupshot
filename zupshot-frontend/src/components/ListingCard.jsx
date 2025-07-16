export default function ListingCard({ id, name, location, price, imageUrl }) {
  return (
    <div className="border border-light-gray rounded-lg p-4 bg-white shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-md">
      <img
        src={imageUrl || 'https://via.placeholder.com/128'}
        alt={name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h3 className="text-lg font-semibold text-dark-gray">{name}</h3>
      <p className="text-sm text-dark-gray">{location}</p>
      <p className="text-sm text-dark-gray font-bold">{price}</p>
    </div>
  );
}