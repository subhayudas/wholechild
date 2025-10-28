import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Star, 
  Clock, 
  Heart,
  Brain,
  Users,
  Palette,
  Music,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Child } from '../store/childStore';

interface LearningInsightsProps {
  child: Child | null;
  analyticsData: any;
}

const LearningInsights: React.FC<LearningInsightsProps> = ({ child, analyticsData }) => {
  if (!child || !analyticsData) return null;

  // Generate AI-powered insights based on the data
  const generateInsights = () => {
    const insights = [];

    // Activity frequency insight
    if (analyticsData.totalActivities > 0) {
      const avgPerWeek = analyticsData.totalActivities / 4; // Assuming monthly data
      if (avgPerWeek >= 5) {
        insights.push({
          type: 'success',
          icon: TrendingUp,
          title: 'Excellent Learning Consistency',
          description: `${child.name} is maintaining great momentum with ${avgPerWeek.toFixed(1)} activities per week on average.`,
          recommendation: 'Continue this excellent pace! Consider introducing slightly more challenging activities.'
        });
      } else if (avgPerWeek >= 2) {
        insights.push({
          type: 'info',
          icon: Target,
          title: 'Steady Progress',
          description: `${child.name} is completing ${avgPerWeek.toFixed(1)} activities per week, showing consistent engagement.`,
          recommendation: 'Try to gradually increase activity frequency to 3-4 times per week for optimal learning.'
        });
      } else {
        insights.push({
          type: 'warning',
          icon: AlertCircle,
          title: 'Opportunity for More Engagement',
          description: `${child.name} has been completing fewer activities recently.`,
          recommendation: 'Consider shorter, more frequent sessions to build a consistent learning routine.'
        });
      }
    }

    // Learning style insight
    const learningStyle = child.preferences.learningStyle;
    insights.push({
      type: 'info',
      icon: Brain,
      title: `${learningStyle.charAt(0).toUpperCase() + learningStyle.slice(1)} Learning Style`,
      description: `${child.name} learns best through ${learningStyle} approaches.`,
      recommendation: learningStyle === 'visual' 
        ? 'Focus on activities with pictures, colors, and visual patterns.'
        : learningStyle === 'auditory'
          ? 'Incorporate songs, stories, and verbal instructions.'
          : learningStyle === 'kinesthetic'
            ? 'Emphasize hands-on activities and movement-based learning.'
            : 'Continue using a variety of learning approaches.'
    });

    // Developmental strength insight
    const developmentalAreas = analyticsData.developmentalProgress;
    const strongestArea = developmentalAreas.reduce((max: any, area: any) => 
      area.current > max.current ? area : max
    );
    
    insights.push({
      type: 'success',
      icon: strongestArea.icon,
      title: `${strongestArea.label} Development Strength`,
      description: `${child.name} shows exceptional progress in ${strongestArea.label.toLowerCase()} development (${strongestArea.current}%).`,
      recommendation: `Use ${strongestArea.label.toLowerCase()} activities as a foundation to support growth in other areas.`
    });

    // Session duration insight
    if (analyticsData.averageSessionTime > 0) {
      if (analyticsData.averageSessionTime >= 25) {
        insights.push({
          type: 'success',
          icon: Clock,
          title: 'Great Focus and Attention',
          description: `${child.name} maintains focus for an average of ${analyticsData.averageSessionTime} minutes per activity.`,
          recommendation: 'This shows excellent attention span! Continue with current activity lengths.'
        });
      } else if (analyticsData.averageSessionTime >= 15) {
        insights.push({
          type: 'info',
          icon: Clock,
          title: 'Good Attention Span',
          description: `${child.name} typically engages for ${analyticsData.averageSessionTime} minutes per activity.`,
          recommendation: 'Consider gradually extending activities by 2-3 minutes to build sustained attention.'
        });
      } else {
        insights.push({
          type: 'info',
          icon: Clock,
          title: 'Building Focus Skills',
          description: `${child.name} engages for about ${analyticsData.averageSessionTime} minutes per activity.`,
          recommendation: 'Short, engaging activities are perfect at this stage. Focus on quality over duration.'
        });
      }
    }

    // Streak insight
    if (analyticsData.currentStreak >= 7) {
      insights.push({
        type: 'success',
        icon: Star,
        title: 'Amazing Learning Streak!',
        description: `${child.name} has been learning consistently for ${analyticsData.currentStreak} days in a row!`,
        recommendation: 'Celebrate this achievement! Consistency is key to building strong learning habits.'
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  };

  const insights = generateInsights();

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Learning Insights</h3>
          <p className="text-sm text-gray-600">AI-powered analysis of {child.name}'s learning patterns</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={index}
              className={`border rounded-lg p-4 ${getInsightStyle(insight.type)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconStyle(insight.type)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-gray-700 text-sm mb-2">{insight.description}</p>
                  <div className="bg-white/60 rounded-lg p-3 border border-white/40">
                    <p className="text-sm text-gray-800">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Suggested Next Steps</h4>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
            Find Recommended Activities
          </button>
          <button className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
            Schedule Learning Time
          </button>
          <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors">
            Create Learning Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningInsights;