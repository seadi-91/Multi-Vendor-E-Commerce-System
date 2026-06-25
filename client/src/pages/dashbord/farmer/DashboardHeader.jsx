import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Calendar, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DashboardHeader = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };
    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center gap-6 border-b border-forest-100 bg-white px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-6">
        {/* Greeting */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-forest-900">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Mubarek'}! 👋
          </h1>
          <p className="text-sm text-forest-600">
            Here's what's happening on your farm today.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-400" />
          <Input
            type="search"
            placeholder="Search products, orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-forest-50 border-forest-200 focus:border-forest-500 focus:ring-forest-500"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        {/* Weather Widget */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
          <Sun className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium text-amber-700">28°C Sunny, Gondar</span>
        </div>

        {/* Date Widget */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-forest-50 border border-forest-200">
          <Calendar className="h-5 w-5 text-forest-600" />
          <span className="text-sm font-medium text-forest-700">{currentDate}</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-forest-700" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500" />
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="h-9 w-9 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-semibold">
                {user?.name?.charAt(0) || 'M'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-forest-900">{user?.name || 'Mubarek Edris'}</p>
                <p className="text-xs text-forest-600">{user?.farmName || 'Farm Owner'}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/farmer/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/farmer/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/farmer/help')}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
