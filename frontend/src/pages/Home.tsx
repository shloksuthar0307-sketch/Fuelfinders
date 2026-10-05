import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SearchSidebar } from '../components/SearchSidebar';
import { Clock, Map as MapIcon, Calculator, ChevronRight, Fuel, ShieldCheck, Laptop, Zap } from 'lucide-react';

const CITIES = [
  { name: 'Delhi NCR', count: '520+' },
  { name: 'Mumbai', count: '410+' },
  { name: 'Pune', count: '200+' },
  { name: 'Ahmedabad', count: '510+' },
  { name: 'Bengaluru', count: '190+' },
  { name: 'Hyderabad', count: '170+' },
  { name: 'Surat', count: '180+' },
  { name: 'Lucknow', count: '140+' },
];

const Home = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedFuels, setSelectedFuels] = useState<string[]>(['cng']);
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          setOrigin('Current Location'); 
          setIsLocating(false);
        },
        (error) => {
          console.error("Error obtaining location", error);
          alert("Could not get your location. Please ensure you have given permission.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination && selectedFuels.length > 0) {
      const originParam = (origin === 'Current Location' && userLocation) 
        ? `${userLocation[0]},${userLocation[1]}` 
        : origin;
        
      navigate(`/search?origin=${encodeURIComponent(originParam)}&dest=${encodeURIComponent(destination)}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full bg-brand-bg font-sans overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#DBEAFE] px-4 py-16 md:py-24 overflow-hidden border-b border-blue-100">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-[30rem] h-[30rem] bg-blue-200/40 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-24 w-[40rem] h-[40rem] bg-emerald-100/40 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-blue-200/50 text-sm font-semibold text-brand-blue mb-6 shadow-sm">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Over 7,000+ Verified Stations Across India</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            India's Most Intelligent <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
              Fuel & Queue Finder
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-2">
            Real-time community queue reports, fuel pressure tracking, and smart zero-detour routing for drivers across the country.
          </p>
        </div>

        <div className="relative z-20 w-full max-w-3xl mx-auto">
          <SearchSidebar 
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
            selectedFuels={selectedFuels}
            setSelectedFuels={setSelectedFuels}
            onSearch={handleSearch}
            onSwap={handleSwap}
            onGetCurrentLocation={handleGetCurrentLocation}
            isLocating={isLocating}
            className="w-full"
            cardClassName="flex flex-col overflow-visible shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-2xl border-white/80 bg-white/95 backdrop-blur-xl"
          />
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Drivers Choose Us</h2>
            <p className="text-slate-500">Everything you need for a stress-free refueling experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Live Queue Updates</h3>
              <p className="text-slate-600 leading-relaxed">
                Check crowd-sourced waiting times and dispensing status before you even start driving to the pump.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-100 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapIcon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Zero-Detour Routing</h3>
              <p className="text-slate-600 leading-relaxed">
                Planning a road trip? We find stations perfectly aligned with your highway route so you never stray far.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-amber-900/5 hover:border-amber-100 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calculator className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fuel Savings Calculator</h3>
              <p className="text-slate-600 leading-relaxed">
                Calculate exactly how much you save monthly or yearly by switching between CNG, EV, or traditional fuels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CITIES SECTION */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Major Fuel Hubs</h2>
              <p className="text-slate-500">Browse stations by operating hours and operator info.</p>
            </div>
            <Link to="/cities" className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center group">
              View All Cities 
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...CITIES].sort((a, b) => a.name.localeCompare(b.name)).map((city) => (
              <Link 
                key={city.name} 
                to={`/search?origin=${encodeURIComponent(city.name)}`}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between h-28 block"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{city.name}</h3>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                </div>
                <div className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 w-max px-2 py-1 rounded-md">
                  <Fuel className="h-3 w-3 mr-1" />
                  {city.count} Stations
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SAVINGS BANNER CTA */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-700 shadow-2xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[30rem] h-[30rem] bg-white/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[20rem] h-[20rem] bg-emerald-400/30 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 text-center md:text-left text-slate-900 md:max-w-lg">
              <span className="inline-block px-3 py-1 bg-black/10 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase mb-4 text-slate-800">
                Free Online Tool
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight text-slate-900">
                How much can you save with green fuel?
              </h2>
              <p className="text-slate-800 font-medium text-lg">
                Calculate your exact fuel cost savings per kilometer compared to Petrol & Diesel using our live local rate data.
              </p>
            </div>
            
            <div className="relative z-10 w-full md:w-auto shrink-0 flex justify-center mt-6 md:mt-0">
              <Link to="/calculator" className="bg-white text-teal-700 hover:bg-emerald-50 px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_40px_rgba(0,0,0,0.1)] hover:shadow-[0_0_60px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center whitespace-nowrap">
                Open Savings Calculator
                <ChevronRight className="ml-2 h-5 w-5 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. APP PROMO */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-slate-900 to-red-950 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-red-900/10 border border-slate-800">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shrink-0 shadow-lg shadow-red-600/20">
              <Laptop className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Get the Web App</h3>
              <p className="text-slate-300 max-w-sm">
                Access GPS live navigation, turn-by-turn routing, and instant community queue alerts on the go.
              </p>
            </div>
          </div>
          <button className="whitespace-nowrap bg-white text-red-700 hover:bg-red-50 px-6 py-3 rounded-xl font-bold transition-colors inline-flex items-center shadow-md">
            Open Web App
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-16 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <ShieldCheck className="h-6 w-6 text-blue-500" />
              FuelFinder
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed mb-6">
              India's first AI-powered station locator and community intelligence platform, helping drivers save time and fuel.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Explore Stations</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Find Nearby Stations</a></li>
              <li><Link to="/cities" className="hover:text-white transition-colors">All City Hubs</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Highway Corridors</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Driver Tools</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Savings Calculator</a></li>
              <li><a href="#" className="hover:text-white transition-colors">News & Blogs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Submit Feedback</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 FuelFinder Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
