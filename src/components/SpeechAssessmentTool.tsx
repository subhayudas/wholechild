import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Save, 
  Mic, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2,
  CheckCircle,
  AlertCircle,
  Star,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SpeechAssessmentToolProps {
  onClose: () => void;
  onSave: () => void;
}

const SpeechAssessmentTool: React.FC<SpeechAssessmentToolProps> = ({ onClose, onSave }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [assessmentData, setAssessmentData] = useState({
    articulation: {},
    language: {},
    fluency: {},
    voice: {}
  });

  const sections = [
    { title: 'Articulation', icon: Mic },
    { title: 'Language', icon: Volume2 },
    { title: 'Fluency', icon: Target },
    { title: 'Voice Quality', icon: Star }
  ];

  const articulationSounds = [
    { sound: '/p/', words: ['pop', 'apple', 'cup'], position: 'all' },
    { sound: '/b/', words: ['ball', 'baby', 'tub'], position: 'all' },
    { sound: '/t/', words: ['top', 'butter', 'cat'], position: 'all' },
    { sound: '/d/', words: ['dog', 'ladder', 'bed'], position: 'all' },
    { sound: '/k/', words: ['cat', 'cookie', 'book'], position: 'all' },
    { sound: '/g/', words: ['go', 'tiger', 'big'], position: 'all' },
    { sound: '/f/', words: ['fish', 'coffee', 'leaf'], position: 'all' },
    { sound: '/v/', words: ['van', 'seven', 'love'], position: 'all' },
    { sound: '/s/', words: ['sun', 'pencil', 'bus'], position: 'all' },
    { sound: '/z/', words: ['zoo', 'puzzle', 'buzz'], position: 'all' },
    { sound: '/r/', words: ['red', 'carrot', 'car'], position: 'all' },
    { sound: '/l/', words: ['lion', 'yellow', 'ball'], position: 'all' }
  ];

  const languageAreas = [
    { area: 'Vocabulary', tasks: ['Name pictures', 'Define words', 'Categories'] },
    { area: 'Grammar', tasks: ['Sentence completion', 'Plurals', 'Past tense'] },
    { area: 'Comprehension', tasks: ['Follow directions', 'Answer questions', 'Story understanding'] },
    { area: 'Expression', tasks: ['Describe pictures', 'Tell stories', 'Explain processes'] }
  ];

  const handleSoundAssessment = (sound: string, accuracy: 'correct' | 'distorted' | 'substituted' | 'omitted') => {
    setAssessmentData(prev => ({
      ...prev,
      articulation: {
        ...prev.articulation,
        [sound]: accuracy
      }
    }));
  };

  const startRecording = () => {
    setIsRecording(true);
    // In a real app, this would start audio recording
    setTimeout(() => {
      setIsRecording(false);
      toast.success('Recording saved');
    }, 3000);
  };

  const renderArticulationSection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Articulation Assessment</h3>
        <p className="text-gray-600">Assess production of individual sounds in words</p>
      </div>

      <div className="space-y-4">
        {articulationSounds.map((item) => (
          <div key={item.sound} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{item.sound} sound</h4>
                <p className="text-sm text-gray-600">Test words: {item.words.join(', ')}</p>
              </div>
              <button
                onClick={startRecording}
                className={`p-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-blue-500'} text-white`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {['correct', 'distorted', 'substituted', 'omitted'].map((accuracy) => (
                <button
                  key={accuracy}
                  onClick={() => handleSoundAssessment(item.sound, accuracy as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    assessmentData.articulation[item.sound] === accuracy
                      ? accuracy === 'correct' 
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-red-100 text-red-700 border-2 border-red-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {accuracy.charAt(0).toUpperCase() + accuracy.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLanguageSection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Language Assessment</h3>
        <p className="text-gray-600">Evaluate receptive and expressive language skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {languageAreas.map((area) => (
          <div key={area.area} className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">{area.area}</h4>
            <div className="space-y-3">
              {area.tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{task}</span>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                      <CheckCircle className="w-4 h-4 mx-auto" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                      <AlertCircle className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFluencySection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Fluency Assessment</h3>
        <p className="text-gray-600">Evaluate speech rhythm and flow</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Speech Sample Analysis</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disfluencies per 100 words
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter count"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Types of disfluencies observed
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Repetitions', 'Prolongations', 'Blocks', 'Interjections'].map((type) => (
                <label key={type} className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVoiceSection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Voice Quality Assessment</h3>
        <p className="text-gray-600">Evaluate vocal characteristics and quality</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { parameter: 'Pitch', options: ['Too high', 'Appropriate', 'Too low'] },
          { parameter: 'Loudness', options: ['Too quiet', 'Appropriate', 'Too loud'] },
          { parameter: 'Quality', options: ['Clear', 'Hoarse', 'Breathy', 'Harsh'] },
          { parameter: 'Resonance', options: ['Normal', 'Hyponasal', 'Hypernasal'] }
        ].map((item) => (
          <div key={item.parameter} className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">{item.parameter}</h4>
            <div className="space-y-2">
              {item.options.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={item.parameter}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return renderArticulationSection();
      case 1: return renderLanguageSection();
      case 2: return renderFluencySection();
      case 3: return renderVoiceSection();
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
            <h2 className="text-2xl font-bold text-gray-900">Speech Assessment</h2>
            <p className="text-gray-600">Comprehensive speech and language evaluation</p>
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
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Section {currentSection + 1} of {sections.length}
            </span>
            {isRecording && (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording...</span>
              </div>
            )}
          </div>
          
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
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                Save Assessment
              </motion.button>
            ) : (
              <button
                onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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

export default SpeechAssessmentTool;