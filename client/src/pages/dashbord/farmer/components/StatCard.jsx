import React, { memo } from 'react';
import { TrendingUp, Star, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const StatCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  trendDirection = 'up',
  comparison,
  rating, 
  ratingCount,
  loading = false,
  error = false,
  empty = false,
  sparklineData = null
}) => {
  const colorClasses = {
    green: 'bg-emerald-100 text-emerald-600',
    mint: 'bg-emerald-100 text-emerald-600',
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-emerald-100 text-emerald-600',
  };

  const trendColorClasses = {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-slate-600 bg-slate-50',
  };

  const renderStars = () => {
    if (!rating) return null;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
        {hasHalfStar && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 opacity-50" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 text-gray-300" />
        ))}
        {ratingCount && <span className="text-[10px] text-gray-500 ml-1">({ratingCount})</span>}
      </div>
    );
  };

  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    
    const points = sparklineData.map((val, i) => {
      const x = (i / (sparklineData.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-8"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={trendDirection === 'up' ? '#10b981' : trendDirection === 'down' ? '#ef4444' : '#64748b'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-full flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
          </div>
          <div className="p-2 rounded-lg bg-slate-100 animate-pulse">
            <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-full flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-600 mb-1">{title}</p>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Error loading data</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-red-100">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-full flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-2xl font-semibold text-slate-300">-</p>
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.green}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 h-full flex flex-col cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            role="button"
            tabIndex={0}
            aria-label={`${title}: ${value}. ${trend ? `${trend} ${comparison || 'vs last period'}` : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
                <h3 className="text-base font-semibold text-slate-900 mb-1">{value}</h3>
                {trend && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${trendColorClasses[trendDirection]} transition-all duration-200 hover:scale-105`}
                        aria-label={`Trend: ${trend} ${comparison || 'Compared to last period'}`}
                      >
                        {trendDirection === 'up' ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : trendDirection === 'down' ? <TrendingDown className="h-3 w-3" aria-hidden="true" /> : null}
                        <span>{trend}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{comparison || 'Compared to last period'}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {rating && (
                  <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 stars from ${ratingCount} reviews`}>
                    {renderStars()}
                  </div>
                )}
              </div>
              <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.green} transition-all duration-300 hover:scale-110 hover:rotate-3 shrink-0`} aria-hidden="true">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            {sparklineData && (
              <div className="mt-3 pt-3 border-t border-slate-100" aria-hidden="true">
                {renderSparkline()}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{title}: {value}</p>
          {trend && <p className="text-xs text-muted-foreground">{trend} {comparison || 'vs last period'}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export default StatCard;
