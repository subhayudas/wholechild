import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  Star, 
  Target, 
  Calendar, 
  TrendingUp,
  Award,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Loader2
} from 'lucide-react';
import { Child } from '../store/childStore';
import { milestonesService, Milestone } from '../services/milestonesService';
import toast from 'react-hot-toast';

interface MilestoneTrackerProps {
  child: Child | null;
  developmentalAreas: Array<{
    id: string;
    label: string;
    icon: any;
    color: string;
  }>;
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ child, developmentalAreas }) => {
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  // Fetch milestones from database
  useEffect(() => {
    const fetchMilestones = async () => {
      if (!child) {
        setMilestones([]);
        return;
      }

      setIsLoading(true);
      try {
        const fetchedMilestones = await milestonesService.getByChildId(child.id);
        setMilestones(fetchedMilestones);
      } catch (error: any) {
        console.error('Error fetching milestones:', error);
        toast.error('Failed to load milestones');
        setMilestones([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestones();
  }, [child]);

  const filteredMilestones = selectedArea === 'all' 
    ? milestones 
    : milestones.filter(m => m.area === selectedArea);

  const achievedCount = filteredMilestones.filter(m => m.achieved).length;
  const totalCount = filteredMilestones.length;
  const progressPercentage = totalCount > 0 ? (achievedCount / totalCount) * 100 : 0;

  const getAreaInfo = (areaId: string) => {
    return developmentalAreas.find(area => area.id === areaId);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isOverdue = (milestone: any) => {
    if (milestone.achieved || !child) return false;
    const childAgeMonths = child.age * 12;
    return childAgeMonths > milestone.targetAge;
  };

  const isUpcoming = (milestone: any) => {
    if (milestone.achieved || !child) return false;
    const childAgeMonths = child.age * 12;
    return milestone.targetAge - childAgeMonths <= 6 && milestone.targetAge > childAgeMonths;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{achievedCount}</div>
              <div className="text-sm text-gray-600">Achieved</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalCount - achievedCount}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredMilestones.filter(m => isUpcoming(m)).length}
              </div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedArea('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedArea === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Areas
            </button>
            {developmentalAreas.map((area) => {
              const Icon = area.icon;
              return (
                <button
                  key={area.id}
                  onClick={() => setSelectedArea(area.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedArea === area.id
                      ? `bg-${area.color}-100 text-${area.color}-700`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {area.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowAddMilestone(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">{achievedCount} of {totalCount} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {filteredMilestones.map((milestone, index) => {
          const areaInfo = getAreaInfo(milestone.area);
          const Icon = areaInfo?.icon || Target;
          
          return (
            <motion.div
              key={milestone.id}
              className={`bg-white rounded-xl p-6 shadow-sm border transition-all duration-300 ${
                milestone.achieved 
                  ? 'border-green-200 bg-green-50' 
                  : isOverdue(milestone)
                    ? 'border-red-200 bg-red-50'
                    : isUpcoming(milestone)
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-100'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  milestone.achieved 
                    ? 'bg-green-100 text-green-600' 
                    : isOverdue(milestone)
                      ? 'bg-red-100 text-red-600'
                      : isUpcoming(milestone)
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-600'
                }`}>
                  {milestone.achieved ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{milestone.title}</h4>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceColor(milestone.importance)}`}>
                        {milestone.importance}
                      </span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setEditingMilestone(milestone)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this milestone?')) {
                              try {
                                await milestonesService.delete(milestone.id);
                                const updated = await milestonesService.getByChildId(child!.id);
                                setMilestones(updated);
                                toast.success('Milestone deleted');
                              } catch (error: any) {
                                toast.error('Failed to delete milestone');
                              }
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${areaInfo?.color}-600`} />
                      <span className="capitalize">{milestone.area}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {milestone.achieved ? (
                        <span className="text-green-600 font-medium">
                          Achieved {milestone.achievedDate?.toLocaleDateString()}
                        </span>
                      ) : (
                        <span>
                          Target age: {Math.floor(milestone.targetAge / 12)}y {milestone.targetAge % 12}m
                        </span>
                      )}
                    </div>

                    {isOverdue(milestone) && (
                      <span className="text-red-600 font-medium">Overdue</span>
                    )}
                    
                    {isUpcoming(milestone) && (
                      <span className="text-yellow-600 font-medium">Coming Soon</span>
                    )}
                  </div>

                  {!milestone.achieved && (
                    <div className="mt-4">
                      <button 
                        onClick={async () => {
                          try {
                            await milestonesService.markAchieved(milestone.id);
                            const updated = await milestonesService.getByChildId(child!.id);
                            setMilestones(updated);
                            toast.success('Milestone marked as achieved! 🎉');
                          } catch (error: any) {
                            toast.error('Failed to update milestone');
                          }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Mark as Achieved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading milestones...</p>
        </div>
      ) : filteredMilestones.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No milestones found</h3>
          <p className="text-gray-600 mb-6">
            {selectedArea === 'all' 
              ? 'Start tracking developmental milestones for your child'
              : `No milestones found for ${getAreaInfo(selectedArea)?.label} development`
            }
          </p>
          <button
            onClick={() => setShowAddMilestone(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Milestone
          </button>
        </div>
      ) : null}

      {/* Add/Edit Milestone Modal */}
      <AnimatePresence>
        {(showAddMilestone || editingMilestone) && (
          <MilestoneForm
            child={child}
            milestone={editingMilestone}
            onClose={() => {
              setShowAddMilestone(false);
              setEditingMilestone(null);
            }}
            onSave={async () => {
              if (child) {
                const updated = await milestonesService.getByChildId(child.id);
                setMilestones(updated);
              }
              setShowAddMilestone(false);
              setEditingMilestone(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple Milestone Form Component
const MilestoneForm: React.FC<{
  child: Child | null;
  milestone?: Milestone | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ child, milestone, onClose, onSave }) => {
  const [title, setTitle] = useState(milestone?.title || '');
  const [description, setDescription] = useState(milestone?.description || '');
  const [area, setArea] = useState<'cognitive' | 'language' | 'social' | 'physical' | 'creative'>(milestone?.area || 'cognitive');
  const [targetAge, setTargetAge] = useState(milestone?.targetAge || 36);
  const [importance, setImportance] = useState<'high' | 'medium' | 'low'>(milestone?.importance || 'medium');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!child) return;

    setIsSaving(true);
    try {
      if (milestone) {
        await milestonesService.update(milestone.id, {
          title,
          description,
          area,
          targetAge,
          importance
        });
        toast.success('Milestone updated');
      } else {
        await milestonesService.create({
          childId: child.id,
          title,
          description,
          area,
          targetAge,
          importance
        });
        toast.success('Milestone created');
      }
      onSave();
    } catch (error: any) {
      toast.error('Failed to save milestone');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl p-6 max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">{milestone ? 'Edit' : 'Add'} Milestone</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Area</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="cognitive">Cognitive</option>
              <option value="language">Language</option>
              <option value="social">Social</option>
              <option value="physical">Physical</option>
              <option value="creative">Creative</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Age (months)</label>
            <input
              type="number"
              value={targetAge}
              onChange={(e) => setTargetAge(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Importance</label>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default MilestoneTracker;