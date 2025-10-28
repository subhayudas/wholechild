import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Calendar } from 'lucide-react';

interface TherapyProgressChartProps {
  data: {
    speech: number[];
    ot: number[];
    dates: string[];
  };
}

const TherapyProgressChart: React.FC<TherapyProgressChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.speech, ...data.ot);
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Progress Over Time</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-600">Speech</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-600">OT</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value) => (
            <g key={value}>
              <line
                x1="40"
                y1={180 - (value / 100) * 160}
                x2="380"
                y2={180 - (value / 100) * 160}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x="30"
                y={185 - (value / 100) * 160}
                fontSize="12"
                fill="#6b7280"
                textAnchor="end"
              >
                {value}%
              </text>
            </g>
          ))}
          
          {/* Speech line */}
          <motion.polyline
            points={data.speech.map((value, index) => 
              `${50 + (index * 300) / (data.speech.length - 1)},${180 - (value / 100) * 160}`
            ).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
          
          {/* OT line */}
          <motion.polyline
            points={data.ot.map((value, index) => 
              `${50 + (index * 300) / (data.ot.length - 1)},${180 - (value / 100) * 160}`
            ).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1 }}
          />
          
          {/* Data points */}
          {data.speech.map((value, index) => (
            <motion.circle
              key={`speech-${index}`}
              cx={50 + (index * 300) / (data.speech.length - 1)}
              cy={180 - (value / 100) * 160}
              r="4"
              fill="#3b82f6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            />
          ))}
          
          {data.ot.map((value, index) => (
            <motion.circle
              key={`ot-${index}`}
              cx={50 + (index * 300) / (data.ot.length - 1)}
              cy={180 - (value / 100) * 160}
              r="4"
              fill="#10b981"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
            />
          ))}
        </svg>
      </div>
      
      {/* Date labels */}
      <div className="flex justify-between mt-4 px-12">
        {data.dates.map((date, index) => (
          <span key={index} className="text-xs text-gray-500">
            {new Date(date).toLocaleDateString()}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TherapyProgressChart;