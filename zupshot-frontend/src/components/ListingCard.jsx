export default function ListingCard({ name, location, price, imageUrl }) {
    return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition grid grid-cols-1 gap-2">
        <img
        src={imageUrl || 'https://via.placeholder.com/128'}
        alt={`${name}'s profile`}
        className="w-32 h-32 object-cover rounded-full mx-auto"
        />
        <h2 className="text-xl font-semibold text-dark-greay">{name}</h2>
        <p className="text-sm text-dark-gray">{location}</p>
        <p className="text-sm font-medium text-soft-red">{price || 'Free'}</p>
    </div>
    );
}