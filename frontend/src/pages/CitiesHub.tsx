import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, Search } from 'lucide-react';

const CITIES_DATA = [
  {
    state: "Delhi NCR",
    cities: [
      { name: "Delhi", stations: "520+" },
      { name: "Noida", stations: "95+" },
      { name: "Greater Noida", stations: "45+" },
      { name: "Gurugram", stations: "110+" },
      { name: "Faridabad", stations: "65+" },
      { name: "Ghaziabad", stations: "85+" },
    ]
  },
  {
    state: "Maharashtra",
    cities: [
      { name: "Mumbai", stations: "410+" },
      { name: "Pune", stations: "280+" },
      { name: "Thane", stations: "130+" },
      { name: "Navi Mumbai", stations: "90+" },
      { name: "Nashik", stations: "60+" },
      { name: "Nagpur", stations: "45+" },
      { name: "Aurangabad", stations: "35+" },
      { name: "Kolhapur", stations: "25+" },
    ]
  },
  {
    state: "Gujarat",
    cities: [
      { name: "Ahmedabad", stations: "400+" },
      { name: "Surat", stations: "300+" },
      { name: "Vadodara", stations: "120+" },
      { name: "Rajkot", stations: "75+" },
      { name: "Bhavnagar", stations: "30+" },
      { name: "Jamnagar", stations: "28+" },
    ]
  },
  {
    state: "Uttar Pradesh",
    cities: [
      { name: "Lucknow", stations: "140+" },
      { name: "Kanpur", stations: "85+" },
      { name: "Agra", stations: "65+" },
      { name: "Varanasi", stations: "40+" },
      { name: "Prayagraj", stations: "35+" },
      { name: "Meerut", stations: "50+" },
      { name: "Bareilly", stations: "25+" },
    ]
  },
  {
    state: "Karnataka",
    cities: [
      { name: "Bengaluru", stations: "190+" },
      { name: "Mysore", stations: "25+" },
    ]
  },
  {
    state: "Telangana",
    cities: [
      { name: "Hyderabad", stations: "170+" },
    ]
  },
  {
    state: "Tamil Nadu",
    cities: [
      { name: "Chennai", stations: "80+" },
    ]
  },
  {
    state: "Kerala",
    cities: [
      { name: "Kochi", stations: "35+" },
    ]
  },
  {
    state: "Rajasthan",
    cities: [
      { name: "Jaipur", stations: "120+" },
    ]
  },
  {
    state: "Punjab / Haryana",
    cities: [
      { name: "Chandigarh", stations: "55+" },
    ]
  },
  {
    state: "West Bengal",
    cities: [
      { name: "Kolkata", stations: "110+" },
    ]
  },
  {
    state: "Madhya Pradesh",
    cities: [
      { name: "Indore", stations: "70+" },
      { name: "Bhopal", stations: "55+" },
    ]
  },
  {
    state: "Bihar",
    cities: [
      { name: "Patna", stations: "45+" },
    ]
  },
  {
    state: "Uttarakhand",
    cities: [
      { name: "Dehradun", stations: "35+" },
      { name: "Haridwar", stations: "20+" },
    ]
  }
];

const CitiesHub = () => {
  return (
    <div className="flex flex-col bg-brand-bg min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Major City Fuel Hubs</h1>
            <p className="text-slate-500 text-lg">Browse stations with addresses, operating hours, and operator info by city</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <input 
                type="text" 
                placeholder="Search city..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all shadow-sm"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            </div>
            <Link 
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* States & Cities List */}
      <div className="max-w-6xl mx-auto w-full px-4 py-12">
        <div className="space-y-12">
          {[...CITIES_DATA]
            .sort((a, b) => a.state.localeCompare(b.state))
            .map((region) => (
            <div key={region.state} className="flex flex-col border-b border-gray-100 pb-12 last:border-0">
              {/* State Header */}
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-bold text-slate-900">{region.state}</h2>
              </div>
              
              {/* Cities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...region.cities]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((city) => (
                  <Link 
                    key={city.name} 
                    to={`/city/${encodeURIComponent(city.name)}`}
                    className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors mb-1">{city.name}</h3>
                      <p className="text-xs text-slate-400">{city.stations} Stations</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitiesHub;
