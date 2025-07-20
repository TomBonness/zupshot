import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
  const { user, hasProfile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  return (
    <header className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-light-gray">
      <Link to="/" className="text-2xl font-bold text-olive-drab hover:text-tan-yellow transition-colors">
        Zupshot
      </Link>
      <div className="flex items-center gap-2">
        <div className="sm:flex hidden items-center gap-2">
          <Button
            variant="outline"
            className="border-olive-drab text-olive-drab hover:bg-tan-yellow"
            asChild
          >
            <Link to="/listings">Listings</Link>
          </Button>
          {user ? (
            <Button
              className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray"
              onClick={() => navigate('/dashboard')}
            >
              {hasProfile ? 'Edit Your Profile' : 'Post Your Profile'}
            </Button>
          ) : (
            <Button
              className="bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray"
              asChild
            >
              <Link to="/signin">Sign In</Link>
            </Button>
          )}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="sm:hidden border-olive-drab text-olive-drab hover:bg-tan-yellow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px]">
            <SheetHeader>
              <h3 className="text-xl font-bold text-olive-drab">Menu</h3>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <Button
                variant="outline"
                className="w-full border-olive-drab text-olive-drab hover:bg-tan-yellow"
                asChild
              >
                <Link to="/listings">Listings</Link>
              </Button>
              {user ? (
                <Button
                  className="w-full bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray"
                  onClick={() => navigate('/dashboard')}
                >
                  {hasProfile ? 'Edit Your Profile' : 'Post Your Profile'}
                </Button>
              ) : (
                <Button
                  className="w-full bg-olive-drab text-white hover:bg-tan-yellow hover:text-dark-gray"
                  asChild
                >
                  <Link to="/signin">Sign In</Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}