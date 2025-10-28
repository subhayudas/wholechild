import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DevelopmentalRadarChartProps {
  data: Array<{
    id: string;
    label: string;
    current: number;
    trend: number;
    color: string;
  }>;
}

const DevelopmentalRadarChart: React.FC<DevelopmentalRadarChartProps> = ({ data }) => {
  const centerX = 150;
  const centerY = 150;
  const maxRadius = 120;
  
  // Calculate points for the radar chart
  const calculatePoint = (value: number, angle: number, radius: number = maxRadius) => {
    const radian = (angle - 90) * (Math.PI / 180);
    const actualRadius = (value / 100) * radius;
    return {
      x: centerX + actualRadius * Math.cos(radian),
      y: centerY + actualRadius * Math.sin(radian)
    };
  };

  const angleStep = 360 / data.length;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Developmental Profile</h3>
        <div className="text-sm text-gray-600">Current Progress</div>
      </div>
      
      <div className="flex items-center justify-center">
        <svg width="300" height="300" className="overflow-visible">
          {/* Background circles */}
          {[20, 40, 60, 80, 100].map((value) => (
            <circle
              key={value}
              cx={centerX}
              cy={centerY}
              r={(value / 100) * maxRadius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Axis lines */}
          {data.map((_, index) => {
            const angle = index * angleStep;
            const endPoint = calculatePoint(100, angle);
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Data polygon */}
          <motion.polygon
            points={data.map((item, index) => {
              const angle = index * angleStep;
              const point = calculatePoint(item.current, angle);
              return `${point.x},${point.y}`;
            }).join(' ')}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3b82f6"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const angle = index * angleStep;
            const point = calculatePoint(item.current, angle);
            return (
              <motion.circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#3b82f6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              />
            );
          })}
          
          {/* Labels */}
          {data.map((item, index) => {
            const angle = index * angleStep;
            const labelPoint = calculatePoint(100, angle, maxRadius + 30);
            return (
              <text
                key={index}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="#374151"
                fontWeight="500"
              >
                {item.label}
              </text>
            );
          })}
          
          {/* Percentage labels */}
          {[20, 40, 60, 80, 100].map((value) => (
            <text
              key={value}
              x={centerX + 5}
              y={centerY - (value / 100) * maxRadius}
              fontSize="10"
              fill="#9ca3af"
            >
              {value}%
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 bg-${item.color}-500 rounded-full`} />
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">{item.current}%</span>
              <div className={`flex items-center gap-1 text-xs ${
                item.trend > 0 ? 'text-green-600' : 
                item.trend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {item.trend > 0 ? <TrendingUp className="w-3 h-3" /> :
                 item.trend < 0 ? <TrendingDown className="w-3 h-3" /> :
                 <Minus className="w-3 h-3" />}
                {Math.abs(item.trend).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DevelopmentalRadarChart;