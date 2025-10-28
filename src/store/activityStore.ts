import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Activity {
  id: string;
  title: string;
  description: string;
  methodologies: ('montessori' | 'reggio' | 'waldorf' | 'highscope' | 'bankstreet' | 'play-based' | 'inquiry-based')[];
  ageRange: [number, number];
  duration: number;
  materials: string[];
  instructions: string[];
  learningObjectives: string[];
  developmentalAreas: string[];
  speechTargets?: string[];
  otTargets?: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: string;
  tags: string[];
  media: {
    images: string[];
    videos: string[];
    audio: string[];
  };
  adaptations: {
    sensory: string[];
    motor: string[];
    cognitive: string[];
  };
  assessment: {
    observationPoints: string[];
    milestones: string[];
  };
  createdBy: string;
  rating: number;
  reviews: number;
  price?: number;
  parentGuidance: {
    setupTips: string[];
    encouragementPhrases: string[];
    extensionIdeas: string[];
    troubleshooting: string[];
  };
}

interface ActivityState {
  activities: Activity[];
  favoriteActivities: string[];
  completedActivities: string[];
  currentActivity: Activity | null;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  toggleFavorite: (id: string) => void;
  markCompleted: (id: string, childId: string) => void;
  setCurrentActivity: (activity: Activity | null) => void;
  getRecommendedActivities: (childId: string) => Activity[];
  getActivityById: (id: string) => Activity | undefined;
  getAIGeneratedActivities: () => Activity[];
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [
        {
          id: '1',
          title: 'Rainbow Sorting Sensory Bins',
          description: 'A multi-sensory activity combining Montessori color sorting with Reggio documentation and Waldorf natural materials. Perfect for developing classification skills while engaging multiple senses.',
          methodologies: ['montessori', 'reggio', 'waldorf'],
          ageRange: [3, 5],
          duration: 30,
          materials: [
            'Colored rice (red, orange, yellow, green, blue, purple)',
            '7 natural wooden bowls or containers',
            'Child-sized tongs or tweezers',
            'Large mixing bowl',
            'Camera for documentation',
            'Small spoon (backup tool)'
          ],
          instructions: [
            'Set up 7 bowls in rainbow order on a low table or mat where your child can comfortably reach',
            'Mix all colored rice together in the large container and place it in the center',
            'Show your child how to use the tongs to pick up rice, demonstrating with one color',
            'Invite your child to sort the rice by color, letting them choose which color to start with',
            'Observe and document their process - take photos of their work and note their strategies',
            'Encourage them to describe what they\'re doing and the colors they see',
            'When finished, invite them to mix the rice again or create patterns with the sorted colors'
          ],
          learningObjectives: [
            'Develop color recognition and naming skills',
            'Practice fine motor control and pincer grasp',
            'Build classification and sorting abilities',
            'Enhance concentration and focus',
            'Strengthen hand-eye coordination'
          ],
          developmentalAreas: ['Cognitive', 'Physical', 'Creative', 'Language'],
          speechTargets: ['Color vocabulary', 'Descriptive language', 'Following multi-step directions'],
          otTargets: ['Pincer grasp development', 'Bilateral coordination', 'Sensory processing'],
          difficulty: 2,
          category: 'Math & Logic',
          tags: ['sorting', 'colors', 'sensory', 'fine-motor', 'montessori'],
          media: {
            images: ['https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg'],
            videos: [],
            audio: []
          },
          adaptations: {
            sensory: [
              'Use larger rice pieces for children sensitive to small textures',
              'Provide noise-canceling headphones if the rice sounds are overwhelming',
              'Offer a fidget tool for the non-working hand'
            ],
            motor: [
              'Use adaptive grips on tongs for children with grip challenges',
              'Provide wrist support or weighted lap pad for stability',
              'Allow use of hands instead of tools if needed'
            ],
            cognitive: [
              'Start with just 3 colors instead of 7',
              'Use picture cards showing each color as visual supports',
              'Break the activity into shorter 10-minute sessions'
            ]
          },
          assessment: {
            observationPoints: [
              'How does the child hold and manipulate the tongs?',
              'Can they identify and name colors accurately?',
              'Do they show persistence when the task becomes challenging?',
              'How do they organize their workspace?'
            ],
            milestones: [
              'Sorts 5+ colors independently',
              'Uses descriptive language about colors and actions',
              'Shows sustained attention for 15+ minutes',
              'Demonstrates proper tool use'
            ]
          },
          createdBy: 'Dr. Maria Santos, Early Childhood Specialist',
          rating: 4.8,
          reviews: 127,
          price: 0,
          parentGuidance: {
            setupTips: [
              'Prepare the activity when your child is not watching to maintain the element of surprise',
              'Ensure good lighting so colors are clearly visible',
              'Have a small dustpan ready for easy cleanup',
              'Set up at your child\'s eye level for best engagement'
            ],
            encouragementPhrases: [
              'I notice you\'re being very careful with the tongs!',
              'You found all the red pieces - what color will you sort next?',
              'Your sorting is so organized!',
              'Tell me about what you\'re thinking as you work'
            ],
            extensionIdeas: [
              'Count how many pieces of each color you found',
              'Create patterns with the sorted colors',
              'Mix two colors together and see what happens',
              'Sort by size or shape if you have different rice types'
            ],
            troubleshooting: [
              'If child loses interest: Add a timer for "color challenges" or play sorting music',
              'If too difficult: Reduce to 3-4 colors or allow hand sorting',
              'If too easy: Add counting, patterning, or size sorting elements',
              'If messy: Place activity in a large tray or on a shower curtain'
            ]
          }
        },
        {
          id: '2',
          title: 'Story Stone Adventures',
          description: 'Waldorf storytelling meets HighScope plan-do-review with speech therapy integration. Children create and tell stories using tactile story stones.',
          methodologies: ['waldorf', 'highscope'],
          ageRange: [4, 6],
          duration: 45,
          materials: [
            'Set of story stones (6-8 stones with simple images)',
            'Recording device (phone or tablet)',
            'Art supplies (paper, crayons, markers)',
            'Story journal or notebook',
            'Comfortable storytelling area with cushions'
          ],
          instructions: [
            'Create a cozy storytelling space with your child using cushions or a special blanket',
            'PLAN: Invite your child to choose 3-5 story stones from the collection',
            'Ask them to look at their stones and think about what story they might tell',
            'DO: Encourage your child to tell their story, recording it if they\'re comfortable',
            'Listen actively and ask open-ended questions to extend their narrative',
            'Invite them to draw a picture of their favorite part of the story',
            'REVIEW: Together, listen to the recording and talk about the story they created'
          ],
          learningObjectives: [
            'Develop narrative and storytelling skills',
            'Practice creative expression and imagination',
            'Build sequencing and logical thinking',
            'Enhance vocabulary and language complexity',
            'Strengthen listening and speaking confidence'
          ],
          developmentalAreas: ['Language', 'Creative', 'Social', 'Cognitive'],
          speechTargets: ['Story structure (beginning, middle, end)', 'Vocabulary expansion', 'Articulation practice in connected speech'],
          otTargets: ['Drawing and pre-writing skills', 'Hand strength through art activities', 'Visual-motor integration'],
          difficulty: 3,
          category: 'Language & Literacy',
          tags: ['storytelling', 'creativity', 'speech', 'art', 'waldorf'],
          media: {
            images: ['https://images.pexels.com/photos/8613264/pexels-photo-8613264.jpeg'],
            videos: [],
            audio: []
          },
          adaptations: {
            sensory: [
              'Provide fidget tools during listening portions',
              'Use visual story maps or picture sequences',
              'Allow movement breaks between story sections'
            ],
            motor: [
              'Offer alternative recording methods (drawing instead of writing)',
              'Provide pencil grips or adaptive art tools',
              'Allow verbal responses instead of written ones'
            ],
            cognitive: [
              'Start with just 2 stones for simpler stories',
              'Use story templates or sentence starters',
              'Break into shorter sessions if attention wanes'
            ]
          },
          assessment: {
            observationPoints: [
              'Does the child create a story with beginning, middle, and end?',
              'How complex is their vocabulary and sentence structure?',
              'Do they show engagement and enthusiasm for storytelling?',
              'Can they answer questions about their story?'
            ],
            milestones: [
              'Tells a coherent 3-part story',
              'Uses past tense correctly in storytelling',
              'Shows creative thinking and imagination',
              'Engages in back-and-forth conversation about stories'
            ]
          },
          createdBy: 'Emma Thompson, Speech-Language Pathologist',
          rating: 4.9,
          reviews: 89,
          price: 5.99,
          parentGuidance: {
            setupTips: [
              'Choose a quiet time when your child is alert and engaged',
              'Make sure the storytelling space feels special and cozy',
              'Have art supplies ready but don\'t feel pressured to use them all',
              'Test your recording device beforehand'
            ],
            encouragementPhrases: [
              'What an interesting character! Tell me more about them.',
              'I wonder what happens next in your story?',
              'You\'re using such descriptive words!',
              'That\'s a creative solution to the problem in your story!'
            ],
            extensionIdeas: [
              'Act out the story with simple props or puppets',
              'Create a sequel to the story the next day',
              'Make up songs or rhymes about the story characters',
              'Draw a comic strip version of the story'
            ],
            troubleshooting: [
              'If child is shy about recording: Start with just telling the story to you',
              'If story is very short: Ask "what happened next?" or "tell me more about..."',
              'If child gets stuck: Offer gentle prompts like "I wonder if the character felt..."',
              'If too long/rambling: Gently guide with "How does your story end?"'
            ]
          }
        },
        {
          id: '3',
          title: 'Nature Texture Exploration',
          description: 'A Reggio-inspired investigation of natural textures combined with Montessori sensory learning and documentation.',
          methodologies: ['reggio', 'montessori'],
          ageRange: [3, 6],
          duration: 40,
          materials: [
            'Collection of natural items (pinecones, smooth stones, bark, leaves, shells)',
            'Magnifying glasses',
            'Texture rubbing paper and crayons',
            'Camera for documentation',
            'Collection basket or tray',
            'Soft cloth blindfold (optional)'
          ],
          instructions: [
            'Take your child on a nature walk to collect interesting textured items together',
            'Create a beautiful display of your collected treasures on a tray or cloth',
            'Invite your child to explore each item with their hands, describing what they feel',
            'Use magnifying glasses to look closely at the details and patterns',
            'Try texture rubbing - place paper over items and rub with crayon to capture the texture',
            'Play a gentle guessing game with eyes closed, identifying items by touch alone',
            'Document your discoveries with photos and your child\'s descriptions'
          ],
          learningObjectives: [
            'Develop tactile discrimination and sensory awareness',
            'Practice descriptive language and vocabulary',
            'Build scientific observation skills',
            'Enhance fine motor control through texture rubbing',
            'Foster connection with nature and environment'
          ],
          developmentalAreas: ['Cognitive', 'Physical', 'Language', 'Creative'],
          speechTargets: ['Descriptive vocabulary (rough, smooth, bumpy)', 'Comparative language (rougher than, smoother than)', 'Question formation and answering'],
          otTargets: ['Tactile processing and discrimination', 'Fine motor control for rubbing activity', 'Bilateral coordination'],
          difficulty: 2,
          category: 'Science & Nature',
          tags: ['nature', 'sensory', 'science', 'reggio', 'exploration'],
          media: {
            images: ['https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg'],
            videos: [],
            audio: []
          },
          adaptations: {
            sensory: [
              'Allow child to wash hands between textures if needed',
              'Start with less intense textures for sensitive children',
              'Provide verbal descriptions if child avoids touching certain textures'
            ],
            motor: [
              'Use adaptive grips for crayons during rubbing activity',
              'Provide hand-over-hand support for texture rubbing if needed',
              'Allow use of tools (like a paintbrush) to explore textures'
            ],
            cognitive: [
              'Focus on 3-4 items instead of many',
              'Use simple vocabulary and repeat key words',
              'Provide visual cards with texture words'
            ]
          },
          assessment: {
            observationPoints: [
              'How does the child approach new textures?',
              'What descriptive words do they use spontaneously?',
              'Do they show curiosity and sustained interest?',
              'Can they identify textures without looking?'
            ],
            milestones: [
              'Uses varied descriptive vocabulary for textures',
              'Shows comfort exploring different textures',
              'Can identify familiar textures by touch alone',
              'Demonstrates scientific thinking through questions and observations'
            ]
          },
          createdBy: 'Dr. Sarah Chen, Nature-Based Learning Specialist',
          rating: 4.7,
          reviews: 156,
          price: 0,
          parentGuidance: {
            setupTips: [
              'Collect items when your child isn\'t watching to maintain wonder',
              'Choose items that are safe and clean',
              'Have a damp cloth ready for hand cleaning',
              'Set up in good natural light for detailed observation'
            ],
            encouragementPhrases: [
              'What does that feel like on your fingers?',
              'I notice you\'re being very gentle with that item.',
              'You\'re making such careful observations!',
              'Tell me more about what you discovered.'
            ],
            extensionIdeas: [
              'Create a texture book with rubbings and descriptions',
              'Sort items by texture categories',
              'Make texture predictions before touching',
              'Create art projects using the collected items'
            ],
            troubleshooting: [
              'If child avoids touching: Start with familiar, comfortable textures',
              'If overwhelmed by choices: Present 2-3 items at a time',
              'If loses interest quickly: Add mystery element or turn into a game',
              'If too messy: Use a large tray to contain the activity'
            ]
          }
        }
      ],
      favoriteActivities: [],
      completedActivities: [],
      currentActivity: null,
      
      addActivity: (activity) => {
        const newActivity = { ...activity, id: Date.now().toString() };
        set((state) => ({ 
          activities: [...state.activities, newActivity] 
        }));
        console.log('Activity added to store:', newActivity.title, 'Tags:', newActivity.tags);
      },
      
      updateActivity: (id, updates) => {
        set((state) => ({
          activities: state.activities.map(activity => 
            activity.id === id ? { ...activity, ...updates } : activity
          )
        }));
      },
      
      deleteActivity: (id) => {
        set((state) => ({
          activities: state.activities.filter(activity => activity.id !== id)
        }));
      },
      
      toggleFavorite: (id) => {
        set((state) => ({
          favoriteActivities: state.favoriteActivities.includes(id)
            ? state.favoriteActivities.filter(fav => fav !== id)
            : [...state.favoriteActivities, id]
        }));
      },
      
      markCompleted: (id, childId) => {
        set((state) => ({
          completedActivities: [...state.completedActivities, `${childId}-${id}`]
        }));
      },
      
      setCurrentActivity: (activity) => {
        set({ currentActivity: activity });
      },
      
      getRecommendedActivities: (childId) => {
        const state = get();
        // Simple recommendation based on child's interests and age
        // In a real app, this would be more sophisticated AI-powered recommendations
        return state.activities.slice(0, 6);
      },

      getActivityById: (id) => {
        return get().activities.find(activity => activity.id === id);
      },

      getAIGeneratedActivities: () => {
        return get().activities.filter(activity => activity.tags.includes('ai-generated'));
      }
    }),
    {
      name: 'wholechild-activities',
      storage: createJSONStorage(() => localStorage),
    }
  )
);