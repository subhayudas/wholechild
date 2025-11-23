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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const generatePDF = (shouldSave: boolean = true) => {
    if (!child || !analyticsData) return null;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Header
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`${child.name}'s Progress Report`, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const reportTitle = reportTypes.find(t => t.id === reportType)?.title || 'Progress Report';
    const periodLabel = dateRange === 'week' ? 'Last Week' : dateRange === 'month' ? 'Last Month' : 'Last 3 Months';
    doc.text(`${reportTitle} • ${periodLabel}`, pageWidth / 2, 30, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    // Report Information
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 14, yPosition);
    yPosition += 10;

    // Key Metrics Section
    checkPageBreak(50);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Metrics', 14, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Metrics table
    const metricsData = [
      ['Activities Completed', (analyticsData.totalActivities || 0).toString()],
      ['Total Learning Time (minutes)', (analyticsData.totalLearningTime || 0).toString()],
      ['Learning Stories Created', (analyticsData.storiesCreated || 0).toString()],
      ['Current Streak (days)', (analyticsData.currentStreak || 0).toString()],
      ['Average Session Time (minutes)', (analyticsData.averageSessionTime || 0).toString()]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: metricsData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Developmental Progress Section
    checkPageBreak(80);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Developmental Progress', 14, yPosition);
    yPosition += 10;

    if (analyticsData.developmentalProgress && analyticsData.developmentalProgress.length > 0) {
      const devData = analyticsData.developmentalProgress.map((area: any) => [
        area.label || area.id,
        `${area.current || 0}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Developmental Area', 'Progress']],
        body: devData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Activity Distribution Section
    if (analyticsData.activityCategories && Object.keys(analyticsData.activityCategories).length > 0) {
      checkPageBreak(60);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Activity Distribution', 14, yPosition);
      yPosition += 10;

      const totalActivities = Object.values(analyticsData.activityCategories).reduce((sum: number, count: any) => sum + count, 0);
      const activityData = Object.entries(analyticsData.activityCategories).map(([category, count]: [string, any]) => [
        category,
        count.toString(),
        `${((count / totalActivities) * 100).toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Category', 'Count', 'Percentage']],
        body: activityData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Recent Activities Section
    if (analyticsData.recentActivities && analyticsData.recentActivities.length > 0) {
      checkPageBreak(80);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Recent Activities', 14, yPosition);
      yPosition += 10;

      const recentActivitiesData = analyticsData.recentActivities.slice(0, 10).map((activity: any) => [
        new Date(activity.completedAt).toLocaleDateString(),
        `${activity.duration || 0} min`,
        activity.activityId || 'N/A'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Duration', 'Activity ID']],
        body: recentActivitiesData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Insights Section
    if (includeInsights) {
      checkPageBreak(40);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Insights & Recommendations', 14, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const insights = [
        `• ${child.name} has completed ${analyticsData.totalActivities || 0} activities during this period.`,
        `• Total learning time: ${analyticsData.totalLearningTime || 0} minutes.`,
        `• Current learning streak: ${analyticsData.currentStreak || 0} days.`,
        `• Continue engaging in diverse activities to support holistic development.`,
        `• Regular learning activities help maintain progress across all developmental areas.`
      ];

      insights.forEach((insight) => {
        checkPageBreak(10);
        doc.text(insight, 14, yPosition, { maxWidth: pageWidth - 28 });
        yPosition += 7;
      });
    }

    // Footer on each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount} • WholeChild Platform`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    if (shouldSave) {
      // Generate filename
      const filename = `${child.name.replace(/\s+/g, '_')}_Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      // Save the PDF
      doc.save(filename);
    }
    
    return doc;
  };

  const handleGenerateReport = async () => {
    if (!child || !analyticsData) {
      toast.error('Unable to generate report. Missing data.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      generatePDF();
      
      setIsGenerating(false);
      toast.success('Report generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      setIsGenerating(false);
      toast.error('Failed to generate report. Please try again.');
    }
  };

  const handleShare = async () => {
    if (!child || !analyticsData) {
      toast.error('Unable to share report. Missing data.');
      return;
    }

    try {
      // Generate PDF in memory (don't save)
      const doc = generatePDF(false);
      if (!doc) {
        toast.error('Failed to generate PDF for sharing.');
        return;
      }
      
      // Convert PDF to blob
      const pdfBlob = doc.output('blob');
      const filename = `${child.name.replace(/\s+/g, '_')}_Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Try to use Web Share API if available
      if (navigator.share) {
        try {
          const file = new File([pdfBlob], filename, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${child.name}'s Progress Report`,
              text: `Check out ${child.name}'s learning progress report!`,
              files: [file]
            });
            toast.success('Report shared successfully!');
            return;
          }
        } catch (shareError) {
          // If sharing fails, fall through to download
          console.log('Web Share API not available or failed, falling back to download');
        }
      }
      
      // Fallback: Download the PDF and copy summary to clipboard
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Also copy summary to clipboard
      const reportData = {
        child: child.name,
        type: reportType,
        dateRange,
        generatedAt: new Date().toISOString(),
        summary: `Activities: ${analyticsData.totalActivities || 0}, Learning Time: ${analyticsData.totalLearningTime || 0} min`
      };
      
      const shareText = `${child.name}'s Progress Report\n\n${reportData.summary}\n\nGenerated: ${new Date().toLocaleDateString()}`;
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        toast.success('Report downloaded and summary copied to clipboard!');
      } else {
        toast.success('Report downloaded! You can now share the file.');
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      toast.error('Failed to share report. Please download it instead.');
    }
  };

  const handleEmail = async () => {
    if (!child || !analyticsData) {
      toast.error('Unable to email report. Missing data.');
      return;
    }

    try {
      // Generate PDF in memory
      const doc = generatePDF(false);
      if (!doc) {
        toast.error('Failed to generate PDF for email.');
        return;
      }
      
      const pdfBlob = doc.output('blob');
      const filename = `${child.name.replace(/\s+/g, '_')}_Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Create mailto link with subject and body
      const subject = encodeURIComponent(`${child.name}'s Progress Report`);
      const body = encodeURIComponent(
        `Please find attached ${child.name}'s progress report.\n\n` +
        `Report Type: ${reportTypes.find(t => t.id === reportType)?.title}\n` +
        `Period: ${dateRange === 'week' ? 'Last Week' : dateRange === 'month' ? 'Last Month' : 'Last 3 Months'}\n\n` +
        `Key Metrics:\n` +
        `- Activities Completed: ${analyticsData.totalActivities || 0}\n` +
        `- Total Learning Time: ${analyticsData.totalLearningTime || 0} minutes\n` +
        `- Learning Stories: ${analyticsData.storiesCreated || 0}\n` +
        `- Current Streak: ${analyticsData.currentStreak || 0} days\n\n` +
        `Note: Please download the PDF report from the application to attach it to your email.`
      );
      
      // First download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Then open email client
      const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;
      
      toast.success('PDF downloaded and email client opened. Please attach the downloaded PDF.');
    } catch (error) {
      console.error('Error opening email:', error);
      toast.error('Failed to open email client. Please download the report and send it manually.');
    }
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