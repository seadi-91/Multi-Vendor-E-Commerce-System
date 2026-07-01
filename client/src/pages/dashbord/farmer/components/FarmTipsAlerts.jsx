import React, { useState, memo } from 'react';
import { AlertTriangle, CloudRain, Droplets, Sun, Info, ChevronRight, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FarmTipsAlerts = memo(() => {
  const [expandedAlert, setExpandedAlert] = useState(null);

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

  const handleAction = (e, alert) => {
    e.stopPropagation();
    console.log('Action clicked for:', alert.title);
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      high: 'bg-red-100 text-red-700 hover:bg-red-200',
      medium: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
      low: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    };
    return styles[severity] || styles.low;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Farm Tips & Alerts</h3>
          <p className="text-xs text-muted-foreground">Stay informed about your farm</p>
        </div>
        <button className="text-xs font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded px-1">
          View All
        </button>
      </div>

      <div className="flex-1 space-y-2">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-900">No alerts</p>
            <p className="text-[10px] text-slate-500">All caught up!</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-2 p-2 rounded-lg border ${alert.color} hover:shadow-sm transition-all duration-200 cursor-pointer`}
              onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
            >
              <div className={`p-1.5 rounded-md ${alert.color.split(' ')[1]} shrink-0`}>
                <alert.icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
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

                {expandedAlert === alert.id && (
                  <div className="mt-3 pt-3 border-t border-slate-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] gap-1"
                      onClick={(e) => handleAction(e, alert)}
                    >
                      {alert.action}
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default FarmTipsAlerts;
