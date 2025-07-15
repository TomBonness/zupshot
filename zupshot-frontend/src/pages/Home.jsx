import { Link } from 'react-router-dom';
import Button from '../components/Button';
export default function Home() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-dark-gray">Find Beginner Photographers Near You</h1>
      <p className="text-lg text-dark-gray my-4">
        Build a portfolio or get photos done without breaking the bank.
      </p>
      <div className="flex gap-4">
        <Link to="/listings">
          <Button>Browse Listings</Button>
        </Link>
        <Link to="/signup">
          <Button>Sign Up</Button>
        </Link>
        <Link to="/signin">
          <Button>Sign In</Button>
        </Link>
      </div>
    </div>
  );
}