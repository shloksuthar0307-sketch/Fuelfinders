import { Link, useLocation } from 'react-router-dom';
import { Fuel, Map, Star, Clock, Menu } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Button } from './ui/Button';

export const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Map', path: '/', icon: Map },
    { name: 'Favorites', path: '/favorites', icon: Star },
    { name: 'History', path: '/history', icon: Clock },
  ];

  return (
    <>
      <header className="glassmorphism sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-brand-blue p-1.5 rounded-lg group-hover:scale-105 transition-transform">
              <Fuel className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-brand-navy">
              FuelFinder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={clsx(
                    "flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-blue-50 text-brand-blue shadow-sm" 
                      : "text-brand-secondary hover:bg-gray-50 hover:text-brand-navy"
                  )}
                >
                  <item.icon className={clsx("h-4 w-4", isActive ? "text-brand-blue" : "text-brand-secondary")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost"
            size="icon"
            className="md:hidden text-brand-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glassmorphism absolute top-16 left-0 right-0 z-40 border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    isActive 
                      ? "bg-blue-50 text-brand-blue" 
                      : "text-brand-secondary hover:bg-gray-50 hover:text-brand-navy"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
