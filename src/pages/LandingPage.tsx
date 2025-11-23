import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Brain, 
  Palette, 
  BookOpen, 
  Target,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { ShinyButton } from '../components/ui/ShinyButton';
import ShaderBackground from '../components/ShaderBackground';
import { cn } from '../lib/utils';

const menuItems = [
];

const LandingPage = () => {
  const [menuState, setMenuState] = useState(false);
  const { signInWithGoogle, isLoading } = useAuthStore();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header>
        <nav
          data-state={menuState ? 'active' : undefined}
          className="group fixed z-20 w-full border-b border-dashed bg-white/80 backdrop-blur-md md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent border-gray-200 dark:border-gray-800">
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
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden text-gray-900 dark:text-gray-100">
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
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 block duration-150 font-medium">
                          <span>{item.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:border-gray-200 lg:pl-6 dark:lg:border-gray-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={(e) => { e.preventDefault(); handleGoogleSignIn(); }}>
                    <span>Login</span>
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset]"
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
        {/* New Hero Section based on inspiration */}
        <ShaderBackground>
          <div className="relative z-10 max-w-[1060px] mx-auto px-4 pt-[120px] pb-16 md:pt-[180px] lg:pt-[216px]">
            <div className="flex flex-col items-center gap-12">
              {/* Hero Content */}
              <div className="max-w-[937px] flex flex-col items-center gap-3">
                <div className="flex flex-col items-center gap-6">
                  <h1 className="max-w-[800px] text-center text-white text-5xl md:text-[80px] font-normal leading-tight md:leading-[96px] font-serif drop-shadow-sm">
                    Nurture Every Child's Potential with WholeChild
                  </h1>
                  <p className="max-w-[600px] text-center text-gray-200 text-lg font-medium leading-7 drop-shadow-sm">
                    A comprehensive platform connecting parents, educators, and therapists to support holistic child development through personalized activities, progress tracking, and expert guidance.
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <ShinyButton 
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                   {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>Start for free</span>
                    )}
                </ShinyButton>
              </div>
            </div>
          </div>
        </ShaderBackground>

        {/* Features Section - Adapted spacing */}
        <section id="features" className="py-20 bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif text-gray-900 dark:text-white mb-4">
                Everything You Need for Holistic Development
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
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
                  className="bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
        <Heart className="w-6 h-6 text-white" />
      </div>
      <span className="text-2xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">
        WholeChild
      </span>
    </div>
  );
};

export default LandingPage;