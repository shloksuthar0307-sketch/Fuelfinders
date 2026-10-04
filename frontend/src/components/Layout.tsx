import { Outlet, Link } from 'react-router-dom';
import { Fuel, Map, User, Menu } from 'lucide-react';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-blue-600">
            <Fuel className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight text-gray-900">FuelFinder</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 flex items-center space-x-1">
              <Map className="h-4 w-4" />
              <span>Map</span>
            </Link>
            <Link to="/favorites" className="text-gray-600 hover:text-blue-600">
              Favorites
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-blue-600 flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
