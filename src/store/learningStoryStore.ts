import { create } from 'zustand';

export interface LearningStory {
  id: string;
  childId: string;
  title: string;
  description: string;
  date: Date;
  activityId?: string;
  media: {
    photos: string[];
    videos: string[];
    audio: string[];
  };
  observations: string[];
  milestones: string[];
  nextSteps: string[];
  developmentalAreas: string[];
  methodologyTags: string[];
  sharedWith: string[];
  isPrivate: boolean;
  reactions: {
    hearts: number;
    celebrations: number;
    insights: number;
  };
}

interface LearningStoryState {
  stories: LearningStory[];
  addStory: (story: Omit<LearningStory, 'id'>) => void;
  updateStory: (id: string, updates: Partial<LearningStory>) => void;
  deleteStory: (id: string) => void;
  getStoriesForChild: (childId: string) => LearningStory[];
  addReaction: (storyId: string, type: 'hearts' | 'celebrations' | 'insights') => void;
}

export const useLearningStoryStore = create<LearningStoryState>((set, get) => ({
  stories: [
    {
      id: '1',
      childId: '1',
      title: 'Emma\'s First Rainbow Sort',
      description: 'Emma showed incredible focus today while sorting colored rice. She naturally began creating patterns and even invented her own sorting game!',
      date: new Date('2025-01-15'),
      activityId: '1',
      media: {
        photos: [
          'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg',
          'https://images.pexels.com/photos/8613264/pexels-photo-8613264.jpeg'
        ],
        videos: [],
        audio: []
      },
      observations: [
        'Used pincer grasp consistently throughout activity',
        'Self-corrected when colors were mixed',
        'Showed sustained attention for 25 minutes',
        'Began creating AB patterns spontaneously'
      ],
      milestones: [
        'Sorts 7 colors independently',
        'Uses descriptive color language',
        'Shows mathematical thinking through patterning'
      ],
      nextSteps: [
        'Introduce more complex patterns',
        'Add counting to sorting activities',
        'Explore color mixing with paint'
      ],
      developmentalAreas: ['Cognitive', 'Physical', 'Language'],
      methodologyTags: ['Montessori', 'Reggio'],
      sharedWith: ['grandparents', 'teacher'],
      isPrivate: false,
      reactions: {
        hearts: 12,
        celebrations: 8,
        insights: 3
      }
    }
  ],
  
  addStory: (story) => {
    const newStory = { ...story, id: Date.now().toString() };
    set((state) => ({ stories: [...state.stories, newStory] }));
  },
  
  updateStory: (id, updates) => {
    set((state) => ({
      stories: state.stories.map(story => 
        story.id === id ? { ...story, ...updates } : story
      )
    }));
  },
  
  deleteStory: (id) => {
    set((state) => ({
      stories: state.stories.filter(story => story.id !== id)
    }));
  },
  
  getStoriesForChild: (childId) => {
    return get().stories.filter(story => story.childId === childId);
  },
  
  addReaction: (storyId, type) => {
    set((state) => ({
      stories: state.stories.map(story => 
        story.id === storyId 
          ? { ...story, reactions: { ...story.reactions, [type]: story.reactions[type] + 1 } }
          : story
      )
    }));
  }
}));