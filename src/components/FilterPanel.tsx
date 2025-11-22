import React from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { categories, developmentalAreas } from '../config/activityConfig';

interface FilterPanelProps {
  filters: {
    methodologies: string[];
    ageRange: [number, number];
    duration: [number, number];
    difficulty: number[];
    categories: string[];
    developmentalAreas: string[];
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, onClose }) => {
  // Categories and developmental areas imported from centralized config

  const resetFilters = () => {
    onFiltersChange({
      methodologies: [],
      ageRange: [3, 6],
      duration: [0, 120],
      difficulty: [],
      categories: [],
      developmentalAreas: []
    });
  };

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (key: string, value: string) => {
    const currentArray = filters[key as keyof typeof filters] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-fit sticky top-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Reset filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="2"
              max="8"
              value={filters.ageRange[0]}
              onChange={(e) => updateFilter('ageRange', [parseInt(e.target.value), filters.ageRange[1]])}
              className="w-full"
            />
            <input
              type="range"
              min="2"
              max="8"
              value={filters.ageRange[1]}
              onChange={(e) => updateFilter('ageRange', [filters.ageRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Duration: {filters.duration[0]} - {filters.duration[1]} minutes
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={filters.duration[0]}
              onChange={(e) => updateFilter('duration', [parseInt(e.target.value), filters.duration[1]])}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={filters.duration[1]}
              onChange={(e) => updateFilter('duration', [filters.duration[0], parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty</label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((level) => {
              const labels = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
              const colors = ['green', 'blue', 'yellow', 'orange', 'red'];
              const isSelected = filters.difficulty.includes(level);
              
              return (
                <button
                  key={level}
                  onClick={() => {
                    const newDifficulty = isSelected
                      ? filters.difficulty.filter(d => d !== level)
                      : [...filters.difficulty, level];
                    updateFilter('difficulty', newDifficulty);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                    isSelected
                      ? `bg-${colors[level - 1]}-100 text-${colors[level - 1]}-700 border-2 border-${colors[level - 1]}-300`
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  {labels[level - 1]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Categories</label>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => toggleArrayFilter('categories', category)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Developmental Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Developmental Areas</label>
          <div className="space-y-2">
            {developmentalAreas.map((area) => (
              <label key={area} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.developmentalAreas.includes(area)}
                  onChange={() => toggleArrayFilter('developmentalAreas', area)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{area}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterPanel;