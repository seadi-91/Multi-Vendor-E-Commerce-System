import React, { useState, useEffect } from 'react';
import { AlertTriangle, CloudRain, Droplets, Sun, Info, Clock, Tag, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '../../../../api';

const FarmTipsAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/farmer/alerts');
        setAlerts(res.data || []);
      } catch (err) {
        console.error('Failed to fetch farm alerts:', err);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const getSeverityBadge = (severity) => {
    const styles = {
      high: 'bg-red-100 text-red-700 hover:bg-red-200',
      medium: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
      low: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    };
    return styles[severity] || styles.low;
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'weather': return CloudRain;
      case 'irrigation': return Droplets;
      case 'harvest': return Sun;
      default: return Info;
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'weather': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'irrigation': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'harvest': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col" style={{ minHeight: '300px' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Farm Tips & Alerts</h3>
            <p className="text-xs text-muted-foreground">Stay informed about your farm</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

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
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center flex-1 py-6 text-center">
            <p className="text-xs text-slate-400">No alerts to display</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = getIconForType(alert.type);
            const color = getColorForType(alert.type);
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-2 p-2 rounded-lg border ${color}`}
              >
                <div className={`p-1.5 rounded-md ${color.split(' ')[1]} shrink-0`}>
                  <Icon className="h-4 w-4" />
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
            );
          })
        )}
      </div>
    </div>
  );
};

export default FarmTipsAlerts;
