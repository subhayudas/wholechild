import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Clock, Calendar } from 'lucide-react';

interface ProgressChartProps {
  data: {
    activities: any[];
    timeframe: string;
  };
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  // Generate chart data based on activities
  const generateChartData = () => {
    const { activities, timeframe } = data;
    const now = new Date();
    let days = 30;
    
    switch (timeframe) {
      case 'week': days = 7; break;
      case 'month': days = 30; break;
      case 'quarter': days = 90; break;
      case 'year': days = 365; break;
    }

    const chartData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.completedAt);
        return activityDate.toDateString() === date.toDateString();
      });
      
      chartData.push({
        date: date.toLocaleDateString(),
        activities: dayActivities.length,
        duration: dayActivities.reduce((sum, a) => sum + a.duration, 0)
      });
    }

    return chartData;
  };

  const chartData = generateChartData();
  const maxActivities = Math.max(...chartData.map(d => d.activities), 1);
  const maxDuration = Math.max(...chartData.map(d => d.duration), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Learning Activity Trends</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-600">Activities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-600">Duration (min)</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 800 200">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value) => (
            <g key={value}>
              <line
                x1="60"
                y1={180 - (value / 100) * 160}
                x2="780"
                y2={180 - (value / 100) * 160}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x="50"
                y={185 - (value / 100) * 160}
                fontSize="12"
                fill="#6b7280"
                textAnchor="end"
              >
                {value}%
              </text>
            </g>
          ))}
          
          {/* Activity bars */}
          {chartData.map((point, index) => {
            const x = 70 + (index * (700 / chartData.length));
            const activityHeight = (point.activities / maxActivities) * 160;
            const durationHeight = (point.duration / maxDuration) * 160;
            
            return (
              <g key={index}>
                {/* Activity bar */}
                <motion.rect
                  x={x - 8}
                  y={180 - activityHeight}
                  width="8"
                  height={activityHeight}
                  fill="#3b82f6"
                  initial={{ height: 0, y: 180 }}
                  animate={{ height: activityHeight, y: 180 - activityHeight }}
                  transition={{ duration: 1, delay: index * 0.05 }}
                />
                
                {/* Duration bar */}
                <motion.rect
                  x={x + 2}
                  y={180 - durationHeight}
                  width="8"
                  height={durationHeight}
                  fill="#10b981"
                  initial={{ height: 0, y: 180 }}
                  animate={{ height: durationHeight, y: 180 - durationHeight }}
                  transition={{ duration: 1, delay: index * 0.05 + 0.2 }}
                />
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Date labels */}
      <div className="flex justify-between mt-4 px-16 text-xs text-gray-500">
        {chartData.filter((_, index) => index % Math.ceil(chartData.length / 6) === 0).map((point, index) => (
          <span key={index}>{point.date}</span>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {chartData.reduce((sum, d) => sum + d.activities, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Activities</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {chartData.reduce((sum, d) => sum + d.duration, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(chartData.reduce((sum, d) => sum + d.duration, 0) / Math.max(chartData.reduce((sum, d) => sum + d.activities, 0), 1))}
          </div>
          <div className="text-sm text-gray-600">Avg Duration</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;