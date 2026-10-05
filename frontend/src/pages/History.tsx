import { Clock, Navigation } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

const History = () => {
  return (
    <div className="flex-1 p-4 sm:p-8 bg-brand-bg fade-in overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Clock className="h-6 w-6 text-brand-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-navy tracking-tight">Route History</h1>
            <p className="text-brand-secondary font-medium">Your recent trips and searches</p>
          </div>
        </div>

        <Card className="shadow-lg border-dashed">
          <CardHeader className="text-center pb-2 pt-12">
            <Navigation className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <CardTitle className="text-xl">No recent routes</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-2">
              Your searched routes and navigation history will appear here so you can easily plan similar trips.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-12" />
        </Card>
      </div>
    </div>
  );
};

export default History;
