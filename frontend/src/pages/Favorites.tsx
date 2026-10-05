import { Star, Fuel } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

const Favorites = () => {
  // In a real application, fetch from the backend API. 
  // For now, returning a beautiful empty state or mock state.
  return (
    <div className="flex-1 p-4 sm:p-8 bg-brand-bg fade-in overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-navy tracking-tight">Saved Stations</h1>
            <p className="text-brand-secondary font-medium">Your favorite fuel stops</p>
          </div>
        </div>

        <Card className="shadow-lg border-dashed">
          <CardHeader className="text-center pb-2 pt-12">
            <Fuel className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <CardTitle className="text-xl">No saved stations yet</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-2">
              When you find a station you like, tap the heart icon to save it here for quick access later.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-12" />
        </Card>
      </div>
    </div>
  );
};

export default Favorites;
