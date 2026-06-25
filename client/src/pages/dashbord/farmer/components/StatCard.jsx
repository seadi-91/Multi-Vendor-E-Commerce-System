import React from 'react';
import { TrendingUp, Star } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, rating, ratingCount }) => {
  const colorClasses = {
    green: 'bg-forest-100 text-forest-600',
    mint: 'bg-mint-100 text-mint-600',
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  const renderStars = () => {
    if (!rating) return null;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
        {hasHalfStar && <Star className="h-4 w-4 fill-amber-400 text-amber-400 opacity-50" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-gray-300" />
        ))}
        {ratingCount && <span className="text-xs text-gray-500 ml-1">({ratingCount})</span>}
      </div>
    );
  };

  return (
    <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-forest-600 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-forest-900 mb-2">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-medium text-mint-600 bg-mint-50 px-2 py-1 rounded-full w-fit">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </div>
          )}
          {rating && renderStars()}
        </div>
        <div className={`p-4 rounded-2xl ${colorClasses[color] || colorClasses.green}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
