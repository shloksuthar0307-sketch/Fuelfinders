import { User, Settings, Shield, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Profile = () => {
  return (
    <div className="flex-1 p-4 sm:p-8 bg-brand-bg fade-in overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-purple-100 p-2 rounded-lg">
            <User className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-navy tracking-tight">Your Profile</h1>
            <p className="text-brand-secondary font-medium">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            <Button variant="secondary" className="w-full justify-start">
              <User className="h-4 w-4 mr-2" /> Personal Info
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" /> Preferences
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-2" /> Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" /> Security
            </Button>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">Full Name</label>
                  <Input type="text" defaultValue="Guest User" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">Email Address</label>
                  <Input type="email" defaultValue="user@example.com" />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
