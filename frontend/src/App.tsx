import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import StationDetails from './pages/StationDetails';
import Favorites from './pages/Favorites';
import History from './pages/History';
import CitiesHub from './pages/CitiesHub';
import CityStations from './pages/CityStations';
import Calculator from './pages/Calculator';
import { InstallPWA } from './components/InstallPWA';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InstallPWA />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="station/:id" element={<StationDetails />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="history" element={<History />} />
            <Route path="cities" element={<CitiesHub />} />
            <Route path="city/:cityName" element={<CityStations />} />
            <Route path="calculator" element={<Calculator />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
