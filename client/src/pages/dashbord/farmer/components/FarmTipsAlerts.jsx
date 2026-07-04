import React from 'react';
import { AlertTriangle, CloudRain, Droplets, Sun, Info, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { useEffect } from 'react';

const FarmTipsAlerts = () => {
  const alerts = [
    {
      id: 1,
      type: 'warning',
      severity: 'high',
      category: 'Pest Control',
      icon: AlertTriangle,
      title: 'Pest Alert',
      message: 'Aphids detected in tomato section. Apply organic pesticide within 48 hours.',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      timestamp: '2 hours ago',
      action: 'View Treatment Options',
    },
    {
      id: 2,
      type: 'info',
      severity: 'medium',
      category: 'Weather',
      icon: CloudRain,
      title: 'Weather Advisory',
      message: 'Rain expected tomorrow. Delay irrigation to prevent waterlogging.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      timestamp: '5 hours ago',
      action: 'View Forecast',
    },
    {
      id: 3,
      type: 'tip',
      severity: 'low',
      category: 'Irrigation',
      icon: Droplets,
      title: 'Irrigation Tip',
      message: 'Optimal watering time: 6:00 AM - 8:00 AM for maximum absorption.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      timestamp: '1 day ago',
      action: 'Schedule Irrigation',
    },
    {
      id: 4,
      type: 'info',
      severity: 'medium',
      category: 'Harvest',
      icon: Sun,
      title: 'Harvest Reminder',
      message: 'Lettuce batch ready for harvest in 2 days. Schedule buyers.',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      timestamp: '1 day ago',
      action: 'Schedule Harvest',
    },
  ];

  const getSeverityBadge = (severity) => {
    const styles = {
      high: 'bg-red-100 text-red-700 hover:bg-red-200',
      medium: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
      low: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    };
    return styles[severity] || styles.low;
  };

  useEffect(() => {
    console.log('FarmTipsAlerts rendered');
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col" style={{ minHeight: '300px' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Farm Tips & Alerts</h3>
          <p className="text-xs text-muted-foreground">Stay informed about your farm</p>
        </div>
        <button className="text-xs font-medium text-slate-600 hover:text-slate-900 rounded px-1">
          View All
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-2 p-2 rounded-lg border ${alert.color}`}
          >
            <div className={`p-1.5 rounded-md ${alert.color.split(' ')[1]} shrink-0`}>
              {(() => {
                const Icon = alert.icon;
                return <Icon className="h-4 w-4" />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-slate-900">{alert.title}</p>
                <Badge className={`text-[9px] px-1.5 py-0 ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5">{alert.message}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {alert.timestamp}
                </span>
                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {alert.category}
                </span>
              </div>
            </div>
          </div>
        ))}
          {alerts.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">No alerts to display</p>
          )}
      </div>
    </div>
  );
};

export default FarmTipsAlerts;
