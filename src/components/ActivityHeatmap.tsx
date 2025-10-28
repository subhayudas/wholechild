import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Activity, Clock } from 'lucide-react';

interface ActivityHeatmapProps {
  activities: any[];
  timeframe: string;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ activities, timeframe }) => {
  const generateHeatmapData = () => {
    const now = new Date();
    const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    const heatmapData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.completedAt);
        return activityDate.toDateString() === date.toDateString();
      });
      
      heatmapData.push({
        date,
        count: dayActivities.length,
        duration: dayActivities.reduce((sum, a) => sum + a.duration, 0)
      });
    }

    return heatmapData;
  };

  const heatmapData = generateHeatmapData();
  const maxCount = Math.max(...heatmapData.map(d => d.count), 1);

  const getIntensityColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity === 0) return 'bg-gray-100';
    if (intensity <= 0.25) return 'bg-blue-200';
    if (intensity <= 0.5) return 'bg-blue-400';
    if (intensity <= 0.75) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  const getWeekData = () => {
    const weeks = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      weeks.push(heatmapData.slice(i, i + 7));
    }
    return weeks;
  };

  const weekData = getWeekData();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Activity Heatmap</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Less</span>
            <div className="flex gap-1">
              {['bg-gray-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600', 'bg-blue-800'].map((color, index) => (
                <div key={index} className={`w-3 h-3 rounded-sm ${color}`} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {weekData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1">
            {week.map((day, dayIndex) => (
              <motion.div
                key={dayIndex}
                className={`w-4 h-4 rounded-sm ${getIntensityColor(day.count)} cursor-pointer`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: (weekIndex * 7 + dayIndex) * 0.02 }}
                title={`${day.date.toLocaleDateString()}: ${day.count} activities, ${day.duration} minutes`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Day labels */}
      <div className="flex gap-1 mt-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="w-4 text-xs text-gray-500 text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {heatmapData.filter(d => d.count > 0).length}
            </div>
            <div className="text-sm text-gray-600">Active Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.max(...heatmapData.map(d => d.count))}
            </div>
            <div className="text-sm text-gray-600">Best Day</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(heatmapData.reduce((sum, d) => sum + d.count, 0) / heatmapData.length * 10) / 10}
            </div>
            <div className="text-sm text-gray-600">Daily Average</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;