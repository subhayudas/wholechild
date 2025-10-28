import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Save, 
  Hand, 
  Eye, 
  Activity, 
  Heart,
  CheckCircle,
  AlertCircle,
  Target,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OTAssessmentToolProps {
  onClose: () => void;
  onSave: () => void;
}

const OTAssessmentTool: React.FC<OTAssessmentToolProps> = ({ onClose, onSave }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [assessmentData, setAssessmentData] = useState({
    fineMotor: {},
    grossMotor: {},
    sensory: {},
    cognitive: {},
    dailyLiving: {}
  });

  const sections = [
    { title: 'Fine Motor', icon: Hand },
    { title: 'Gross Motor', icon: Activity },
    { title: 'Sensory Processing', icon: Heart },
    { title: 'Visual Motor', icon: Eye },
    { title: 'Daily Living', icon: Target }
  ];

  const fineMotorTasks = [
    { task: 'Pincer grasp (small objects)', description: 'Pick up small items using thumb and index finger' },
    { task: 'Tripod grasp (pencil)', description: 'Hold pencil with mature tripod grasp' },
    { task: 'Bilateral coordination', description: 'Use both hands together effectively' },
    { task: 'In-hand manipulation', description: 'Move objects within one hand' },
    { task: 'Cutting with scissors', description: 'Cut along lines with appropriate scissors grip' },
    { task: 'Drawing/writing', description: 'Control pencil for drawing and pre-writing shapes' }
  ];

  const grossMotorTasks = [
    { task: 'Balance (static)', description: 'Stand on one foot for 5+ seconds' },
    { task: 'Balance (dynamic)', description: 'Walk on balance beam or line' },
    { task: 'Coordination', description: 'Hop, skip, gallop with coordination' },
    { task: 'Ball skills', description: 'Catch, throw, kick ball appropriately' },
    { task: 'Climbing', description: 'Navigate playground equipment safely' },
    { task: 'Body awareness', description: 'Demonstrate awareness of body in space' }
  ];

  const sensoryAreas = [
    { area: 'Tactile', behaviors: ['Seeks touch', 'Avoids touch', 'Typical response'] },
    { area: 'Vestibular', behaviors: ['Seeks movement', 'Avoids movement', 'Typical response'] },
    { area: 'Proprioceptive', behaviors: ['Seeks input', 'Under-responsive', 'Typical response'] },
    { area: 'Auditory', behaviors: ['Over-responsive', 'Under-responsive', 'Typical response'] },
    { area: 'Visual', behaviors: ['Over-responsive', 'Under-responsive', 'Typical response'] },
    { area: 'Oral', behaviors: ['Seeks input', 'Avoids input', 'Typical response'] }
  ];

  const visualMotorTasks = [
    { task: 'Visual tracking', description: 'Follow moving objects with eyes' },
    { task: 'Visual scanning', description: 'Search for objects in visual field' },
    { task: 'Hand-eye coordination', description: 'Coordinate hand movements with visual input' },
    { task: 'Visual perception', description: 'Recognize shapes, letters, spatial relationships' },
    { task: 'Visual memory', description: 'Remember visual information' },
    { task: 'Figure-ground', description: 'Find objects in busy backgrounds' }
  ];

  const dailyLivingTasks = [
    { task: 'Dressing', description: 'Put on and remove clothing independently' },
    { task: 'Feeding', description: 'Use utensils appropriately for age' },
    { task: 'Grooming', description: 'Brush teeth, wash hands, comb hair' },
    { task: 'Toileting', description: 'Manage clothing and hygiene independently' },
    { task: 'Organization', description: 'Keep belongings organized' },
    { task: 'Following routines', description: 'Complete multi-step daily routines' }
  ];

  const handleTaskAssessment = (section: string, task: string, score: number) => {
    setAssessmentData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [task]: score
      }
    }));
  };

  const handleSensoryAssessment = (area: string, behavior: string) => {
    setAssessmentData(prev => ({
      ...prev,
      sensory: {
        ...prev.sensory,
        [area]: behavior
      }
    }));
  };

  const renderFineMotorSection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Fine Motor Skills Assessment</h3>
        <p className="text-gray-600">Evaluate small muscle control and dexterity</p>
      </div>

      <div className="space-y-4">
        {fineMotorTasks.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{item.task}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleTaskAssessment('fineMotor', item.task, score)}
                  className={`w-10 h-10 rounded-full border-2 font-semibold transition-colors ${
                    assessmentData.fineMotor[item.task] === score
                      ? score <= 2 
                        ? 'bg-red-500 border-red-500 text-white'
                        : score === 3
                          ? 'bg-yellow-500 border-yellow-500 text-white'
                          : 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Needs Help</span>
              <span>Independent</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGrossMotorSection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Gross Motor Skills Assessment</h3>
        <p className="text-gray-600">Evaluate large muscle control and coordination</p>
      </div>

      <div className="space-y-4">
        {grossMotorTasks.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{item.task}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleTaskAssessment('grossMotor', item.task, score)}
                  className={`w-10 h-10 rounded-full border-2 font-semibold transition-colors ${
                    assessmentData.grossMotor[item.task] === score
                      ? score <= 2 
                        ? 'bg-red-500 border-red-500 text-white'
                        : score === 3
                          ? 'bg-yellow-500 border-yellow-500 text-white'
                          : 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Emerging</span>
              <span>Mastered</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSensorySection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Sensory Processing Assessment</h3>
        <p className="text-gray-600">Evaluate responses to sensory input</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sensoryAreas.map((area) => (
          <div key={area.area} className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-4">{area.area}</h4>
            <div className="space-y-2">
              {area.behaviors.map((behavior) => (
                <label key={behavior} className="flex items-center">
                  <input
                    type="radio"
                    name={area.area}
                    value={behavior}
                    onChange={() => handleSensoryAssessment(area.area, behavior)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{behavior}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVisualMotorSection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Visual Motor Skills Assessment</h3>
        <p className="text-gray-600">Evaluate visual processing and motor coordination</p>
      </div>

      <div className="space-y-4">
        {visualMotorTasks.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{item.task}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleTaskAssessment('cognitive', item.task, score)}
                  className={`w-10 h-10 rounded-full border-2 font-semibold transition-colors ${
                    assessmentData.cognitive[item.task] === score
                      ? score <= 2 
                        ? 'bg-red-500 border-red-500 text-white'
                        : score === 3
                          ? 'bg-yellow-500 border-yellow-500 text-white'
                          : 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Difficulty</span>
              <span>Age Appropriate</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDailyLivingSection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Daily Living Skills Assessment</h3>
        <p className="text-gray-600">Evaluate independence in daily activities</p>
      </div>

      <div className="space-y-4">
        {dailyLivingTasks.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{item.task}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleTaskAssessment('dailyLiving', item.task, score)}
                  className={`w-10 h-10 rounded-full border-2 font-semibold transition-colors ${
                    assessmentData.dailyLiving[item.task] === score
                      ? score <= 2 
                        ? 'bg-red-500 border-red-500 text-white'
                        : score === 3
                          ? 'bg-yellow-500 border-yellow-500 text-white'
                          : 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Needs Assistance</span>
              <span>Independent</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return renderFineMotorSection();
      case 1: return renderGrossMotorSection();
      case 2: return renderSensorySection();
      case 3: return renderVisualMotorSection();
      case 4: return renderDailyLivingSection();
      default: return null;
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-900">OT Assessment</h2>
            <p className="text-gray-600">Comprehensive occupational therapy evaluation</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Section Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-1">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentSection(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentSection === index
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderCurrentSection()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            Section {currentSection + 1} of {sections.length}
          </span>
          
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentSection === sections.length - 1 ? (
              <motion.button
                onClick={onSave}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                Save Assessment
              </motion.button>
            ) : (
              <button
                onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OTAssessmentTool;