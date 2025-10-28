import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2, 
  Calendar, 
  User, 
  FileText, 
  BarChart3,
  Target,
  Star,
  Clock,
  TrendingUp,
  CheckCircle,
  Printer,
  Mail
} from 'lucide-react';
import { Child } from '../store/childStore';
import toast from 'react-hot-toast';

interface ProgressReportProps {
  child: Child | null;
  analyticsData: any;
  onClose: () => void;
}

const ProgressReport: React.FC<ProgressReportProps> = ({ child, analyticsData, onClose }) => {
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'therapy' | 'custom'>('summary');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeInsights, setIncludeInsights] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'summary',
      title: 'Learning Summary',
      description: 'Overview of activities, progress, and achievements',
      icon: BarChart3
    },
    {
      id: 'detailed',
      title: 'Detailed Analysis',
      description: 'Comprehensive developmental assessment and recommendations',
      icon: FileText
    },
    {
      id: 'therapy',
      title: 'Therapy Progress',
      description: 'Speech and occupational therapy progress report',
      icon: Target
    },
    {
      id: 'custom',
      title: 'Custom Report',
      description: 'Choose specific sections and metrics to include',
      icon: Star
    }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    toast.success('Report generated successfully!');
    
    // In a real app, this would trigger a download
    const reportData = {
      child: child?.name,
      type: reportType,
      dateRange,
      generatedAt: new Date().toISOString(),
      data: analyticsData
    };
    
    console.log('Generated report:', reportData);
  };

  const handleShare = () => {
    toast.success('Report sharing link copied to clipboard!');
  };

  const handleEmail = () => {
    toast.success('Report sent via email!');
  };

  if (!child) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generate Progress Report</h2>
            <p className="text-gray-600">Create a comprehensive report for {child.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Report Type Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.id}
                    onClick={() => setReportType(type.id as any)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                      reportType === type.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-6 h-6 ${reportType === type.id ? 'text-blue-600' : 'text-gray-600'}`} />
                      <span className="font-semibold text-gray-900">{type.title}</span>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Period</h3>
            <div className="flex gap-3">
              {[
                { id: 'week', label: 'Last Week' },
                { id: 'month', label: 'Last Month' },
                { id: 'quarter', label: 'Last 3 Months' }
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setDateRange(period.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dateRange === period.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Report Options */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Include in Report</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includePhotos}
                  onChange={(e) => setIncludePhotos(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">Photos and media from learning stories</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeInsights}
                  onChange={(e) => setIncludeInsights(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">AI-generated insights and recommendations</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">Activity completion charts</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">Developmental progress tracking</span>
              </label>
            </div>
          </div>

          {/* Report Preview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-bold text-gray-900">{child.name}'s Learning Progress Report</h4>
                  <p className="text-sm text-gray-600">
                    {reportTypes.find(t => t.id === reportType)?.title} • {dateRange === 'week' ? 'Last Week' : dateRange === 'month' ? 'Last Month' : 'Last 3 Months'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{analyticsData?.totalActivities || 0}</div>
                  <div className="text-xs text-gray-600">Activities</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{analyticsData?.totalLearningTime || 0}</div>
                  <div className="text-xs text-gray-600">Minutes</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">{analyticsData?.storiesCreated || 0}</div>
                  <div className="text-xs text-gray-600">Stories</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600">{analyticsData?.currentStreak || 0}</div>
                  <div className="text-xs text-gray-600">Day Streak</div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                This report will include detailed analysis, charts, recommendations, and more...
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Report will be generated as PDF
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            
            <button
              onClick={handleEmail}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            
            <motion.button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProgressReport;