import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Brain, 
  Palette, 
  Music, 
  BookOpen, 
  Camera, 
  Play, 
  Shield, 
  Star, 
  ArrowRight, 
  Check, 
  Globe, 
  Clock, 
  Target,
  Sparkles,
  Baby,
  GraduationCap,
  Stethoscope,
  Home,
  Loader2,
  Mail,
  Menu,
  SendHorizonal,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const menuItems = [
  { name: 'Features', href: '#features' },
  { name: 'Solution', href: '#solution' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '#about' },
];

const LandingPage = () => {
  const [menuState, setMenuState] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { signInWithGoogle, isLoading } = useAuthStore();

  // Ensure video plays continuously
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((error) => {
        console.log('Video autoplay prevented:', error);
      });
      
      // Prevent video from pausing
      const handlePause = () => {
        video.play();
      };
      
      video.addEventListener('pause', handlePause);
      
      return () => {
        video.removeEventListener('pause', handlePause);
      };
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      // Error is already handled in the store
      console.error('Google sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header>
        <nav
          data-state={menuState ? 'active' : undefined}
          className="group fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent">
          <div className="w-full px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
              <div className="flex w-full justify-between lg:w-auto">
                <Link
                  to="/"
                  aria-label="home"
                  className="flex items-center space-x-2">
                  <Logo />
                </Link>
                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                  <Menu className={cn(
                    "m-auto size-6 duration-200",
                    menuState && "rotate-180 scale-0 opacity-0"
                  )} />
                  <X className={cn(
                    "absolute inset-0 m-auto size-6 duration-200 -rotate-180 scale-0 opacity-0",
                    menuState && "rotate-0 scale-100 opacity-100"
                  )} />
                </button>
              </div>
              <div className={cn(
                "bg-white dark:bg-gray-900 mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent",
                menuState && "block lg:flex"
              )}>
                <div className="lg:pr-4">
                  <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <a
                          href={item.href}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 block duration-150">
                          <span>{item.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.preventDefault(); handleGoogleSignIn(); }}>
                    <span>Login</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>Get Started</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative w-full overflow-hidden min-h-[600px]">
          {/* Background Video Section - Full Width */}
          <div className="absolute inset-0 w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ pointerEvents: 'none' }}
              onPause={(e) => {
                e.preventDefault();
                e.currentTarget.play();
              }}
            >
              <source src="/herobackground.mp4" type="video/mp4" />
            </video>
            {/* Overlay gradient for better text readability */}
            <div aria-hidden className="absolute z-[1] inset-0 bg-gradient-to-r from-white/80 from-35% to-transparent dark:from-zinc-950/80" />
          </div>
          
          {/* Content Section */}
          <div className="relative z-10 w-full px-6 lg:px-8 py-28 lg:py-20">
            <div className="lg:flex lg:items-center lg:gap-12 max-w-7xl mx-auto">
              <div className="relative z-10 mx-auto max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left">
                <Link
                  to="/"
                  className="rounded-lg mx-auto flex w-fit items-center gap-2 border border-gray-200 dark:border-gray-800 p-1 pr-3 lg:ml-0 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                  <span className="bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1 text-xs">New</span>
                  <span className="text-sm">Holistic Child Development Platform</span>
                  <span className="bg-gray-200 dark:bg-gray-700 block h-4 w-px"></span>
                  <ArrowRight className="size-4" />
                </Link>
                <h1 className="mt-10 text-balance text-4xl font-bold md:text-5xl xl:text-5xl">
                  Nurture Every Child's Potential
                </h1>
                <p className="mt-8 text-gray-600 dark:text-gray-400">
                  A comprehensive platform connecting parents, educators, and therapists to support 
                  holistic child development through personalized activities, progress tracking, and expert guidance.
                </p>
                <div>
                  <form
                    action=""
                    className="mx-auto my-10 max-w-sm lg:my-12 lg:ml-0 lg:mr-auto"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleGoogleSignIn();
                    }}>
                    <div className="bg-white dark:bg-gray-900 relative grid grid-cols-[1fr_auto] items-center rounded-[1rem] border border-gray-200 dark:border-gray-800 pr-1 shadow shadow-zinc-950/5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500">
                      <Mail className="pointer-events-none absolute inset-y-0 left-5 my-auto size-5 text-gray-400" />
                      <input
                        placeholder="Your email address"
                        className="h-14 w-full bg-transparent pl-12 focus:outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                        type="email"
                      />
                      <div className="md:pr-1.5 lg:pr-0">
                        <Button
                          aria-label="submit"
                          type="submit"
                          disabled={isLoading}
                          size="sm">
                          <span className="hidden md:block">Get Started</span>
                          <SendHorizonal
                            className="relative mx-auto size-5 md:hidden"
                            strokeWidth={2}
                          />
                        </Button>
                      </div>
                    </div>
                  </form>
                  <ul className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-400">
                    <li>Faster Development Tracking</li>
                    <li>Modern Educational Methods</li>
                    <li>100% Customizable Activities</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Holistic Development
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform brings together the best tools and expertise to support every aspect of your child's growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Cognitive Development",
                description: "Interactive activities designed to enhance problem-solving, memory, and critical thinking skills.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Heart,
                title: "Emotional Intelligence",
                description: "Tools and activities to help children understand and manage their emotions effectively.",
                color: "from-pink-500 to-pink-600"
              },
              {
                icon: Users,
                title: "Social Skills",
                description: "Collaborative activities that build communication, empathy, and relationship skills.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Palette,
                title: "Creative Expression",
                description: "Art, music, and storytelling activities that nurture creativity and self-expression.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: Target,
                title: "Motor Skills",
                description: "Physical activities and exercises designed to develop fine and gross motor skills.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: BookOpen,
                title: "Academic Support",
                description: "Educational content aligned with curriculum standards and learning objectives.",
                color: "from-indigo-500 to-indigo-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
        <Heart className="w-6 h-6 text-white" />
      </div>
      <span className="text-2xl font-bold text-blue-600">
        WholeChild
      </span>
    </div>
  );
};

export default LandingPage;