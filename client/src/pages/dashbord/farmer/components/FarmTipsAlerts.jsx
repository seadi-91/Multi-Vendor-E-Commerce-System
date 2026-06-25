import React from 'react';
import { AlertTriangle, CloudRain, Droplets, Sun, Info } from 'lucide-react';

const FarmTipsAlerts = () => {
  const alerts = [
    {
      id: 1,
      type: 'warning',
      icon: AlertTriangle,
      title: 'Pest Alert',
      message: 'Aphids detected in tomato section. Apply organic pesticide within 48 hours.',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    {
      id: 2,
      type: 'info',
      icon: CloudRain,
      title: 'Weather Advisory',
      message: 'Rain expected tomorrow. Delay irrigation to prevent waterlogging.',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 3,
      type: 'tip',
      icon: Droplets,
      title: 'Irrigation Tip',
      message: 'Optimal watering time: 6:00 AM - 8:00 AM for maximum absorption.',
      color: 'text-mint-600 bg-mint-50 border-mint-200',
    },
    {
      id: 4,
      type: 'info',
      icon: Sun,
      title: 'Harvest Reminder',
      message: 'Lettuce batch ready for harvest in 2 days. Schedule buyers.',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-forest-900">Farm Tips & Alerts</h3>
          <p className="text-sm text-forest-600">Stay informed about your farm</p>
        </div>
        <button className="text-sm font-medium text-forest-600 hover:text-forest-900">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-xl border ${alert.color}`}
          >
            <div className={`p-2 rounded-lg ${alert.color.split(' ')[1]}`}>
              <alert.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-forest-900">{alert.title}</p>
              <p className="text-sm text-forest-600 mt-1">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmTipsAlerts;
