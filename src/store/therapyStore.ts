import { create } from 'zustand';

export interface TherapySession {
  id: string;
  childId: string;
  type: 'speech' | 'ot';
  title: string;
  description: string;
  date: Date;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  goals: string[];
  activities: string[];
  notes: string;
  recordings?: string[];
  assessmentData?: any;
  therapistId: string;
  progress: {
    goalsAchieved: number;
    totalGoals: number;
    notes: string;
  };
}

export interface SpeechGoal {
  id: string;
  childId: string;
  title: string;
  description: string;
  targetDate: Date;
  category: 'articulation' | 'language' | 'fluency' | 'voice' | 'social';
  currentLevel: number;
  targetLevel: number;
  activities: string[];
  progress: {
    date: Date;
    level: number;
    notes: string;
  }[];
}

export interface OTGoal {
  id: string;
  childId: string;
  title: string;
  description: string;
  targetDate: Date;
  category: 'fine-motor' | 'gross-motor' | 'sensory' | 'cognitive' | 'daily-living';
  currentLevel: number;
  targetLevel: number;
  activities: string[];
  progress: {
    date: Date;
    level: number;
    notes: string;
  }[];
}

export interface Assessment {
  id: string;
  childId: string;
  type: 'speech' | 'ot';
  title: string;
  date: Date;
  assessor: string;
  results: any;
  recommendations: string[];
  nextAssessmentDate?: Date;
}

interface TherapyState {
  sessions: TherapySession[];
  speechGoals: SpeechGoal[];
  otGoals: OTGoal[];
  assessments: Assessment[];
  addSession: (session: Omit<TherapySession, 'id'>) => void;
  updateSession: (id: string, updates: Partial<TherapySession>) => void;
  deleteSession: (id: string) => void;
  addSpeechGoal: (goal: Omit<SpeechGoal, 'id'>) => void;
  updateSpeechGoal: (id: string, updates: Partial<SpeechGoal>) => void;
  addOTGoal: (goal: Omit<OTGoal, 'id'>) => void;
  updateOTGoal: (id: string, updates: Partial<OTGoal>) => void;
  addAssessment: (assessment: Omit<Assessment, 'id'>) => void;
  getSessionsForChild: (childId: string) => TherapySession[];
  getProgressData: (childId: string) => { speech: number; ot: number } | null;
}

export const useTherapyStore = create<TherapyState>((set, get) => ({
  sessions: [
    {
      id: '1',
      childId: '1',
      type: 'speech',
      title: 'Articulation Practice - /r/ sounds',
      description: 'Working on /r/ sound production in words and sentences',
      date: new Date('2025-01-15'),
      duration: 30,
      status: 'completed',
      goals: ['Produce /r/ in initial position', 'Use /r/ in conversation'],
      activities: ['Mirror practice', 'Word cards', 'Story reading'],
      notes: 'Great progress today! Emma is getting more consistent with /r/ sounds.',
      therapistId: 'therapist-1',
      progress: {
        goalsAchieved: 2,
        totalGoals: 2,
        notes: 'Met both session goals'
      }
    },
    {
      id: '2',
      childId: '1',
      type: 'ot',
      title: 'Fine Motor Skills Development',
      description: 'Pincer grasp and bilateral coordination activities',
      date: new Date('2025-01-14'),
      duration: 45,
      status: 'completed',
      goals: ['Improve pincer grasp', 'Bilateral coordination'],
      activities: ['Bead threading', 'Cutting practice', 'Play dough'],
      notes: 'Showed improvement in grip strength and coordination.',
      therapistId: 'therapist-2',
      progress: {
        goalsAchieved: 1,
        totalGoals: 2,
        notes: 'Good progress on pincer grasp'
      }
    }
  ],
  
  speechGoals: [
    {
      id: '1',
      childId: '1',
      title: 'Articulation of /r/ sounds',
      description: 'Produce /r/ sounds correctly in all positions of words',
      targetDate: new Date('2025-03-01'),
      category: 'articulation',
      currentLevel: 3,
      targetLevel: 5,
      activities: ['Mirror practice', 'Word repetition', 'Story reading'],
      progress: [
        {
          date: new Date('2025-01-15'),
          level: 3,
          notes: 'Consistent in initial position'
        }
      ]
    }
  ],
  
  otGoals: [
    {
      id: '1',
      childId: '1',
      title: 'Fine motor development',
      description: 'Improve pincer grasp and hand strength for writing readiness',
      targetDate: new Date('2025-04-01'),
      category: 'fine-motor',
      currentLevel: 2,
      targetLevel: 4,
      activities: ['Bead threading', 'Cutting practice', 'Drawing activities'],
      progress: [
        {
          date: new Date('2025-01-14'),
          level: 2,
          notes: 'Showing improvement in grip strength'
        }
      ]
    }
  ],
  
  assessments: [],
  
  addSession: (session) => {
    const newSession = { ...session, id: Date.now().toString() };
    set((state) => ({ sessions: [...state.sessions, newSession] }));
  },
  
  updateSession: (id, updates) => {
    set((state) => ({
      sessions: state.sessions.map(session => 
        session.id === id ? { ...session, ...updates } : session
      )
    }));
  },
  
  deleteSession: (id) => {
    set((state) => ({
      sessions: state.sessions.filter(session => session.id !== id)
    }));
  },
  
  addSpeechGoal: (goal) => {
    const newGoal = { ...goal, id: Date.now().toString() };
    set((state) => ({ speechGoals: [...state.speechGoals, newGoal] }));
  },
  
  updateSpeechGoal: (id, updates) => {
    set((state) => ({
      speechGoals: state.speechGoals.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      )
    }));
  },
  
  addOTGoal: (goal) => {
    const newGoal = { ...goal, id: Date.now().toString() };
    set((state) => ({ otGoals: [...state.otGoals, newGoal] }));
  },
  
  updateOTGoal: (id, updates) => {
    set((state) => ({
      otGoals: state.otGoals.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      )
    }));
  },
  
  addAssessment: (assessment) => {
    const newAssessment = { ...assessment, id: Date.now().toString() };
    set((state) => ({ assessments: [...state.assessments, newAssessment] }));
  },
  
  getSessionsForChild: (childId) => {
    return get().sessions.filter(session => session.childId === childId);
  },
  
  getProgressData: (childId) => {
    const sessions = get().sessions.filter(s => s.childId === childId);
    const speechSessions = sessions.filter(s => s.type === 'speech');
    const otSessions = sessions.filter(s => s.type === 'ot');
    
    const speechProgress = speechSessions.length > 0 
      ? speechSessions.reduce((sum, s) => sum + (s.progress.goalsAchieved / s.progress.totalGoals * 100), 0) / speechSessions.length
      : 0;
      
    const otProgress = otSessions.length > 0
      ? otSessions.reduce((sum, s) => sum + (s.progress.goalsAchieved / s.progress.totalGoals * 100), 0) / otSessions.length
      : 0;
    
    return {
      speech: Math.round(speechProgress),
      ot: Math.round(otProgress)
    };
  }
}));