import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  User, 
  Blocks, 
  BookOpen, 
  BarChart3, 
  Sparkles,
  LogOut,
  Sliders,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/child-profile', icon: User, label: 'Child Profile' },
    { path: '/activity-builder', icon: Blocks, label: 'Activities' },
    { path: '/learning-stories', icon: BookOpen, label: 'Learning Stories' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/ai-pro-generator', icon: Sliders, label: 'AI Pro Generator' }
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0" onClick={closeMenu}>
            <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              WholeChild
            </span>
          </Link>

          {/* Desktop Navigation Items - Show only on large screens (lg and above) */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-3 py-2 rounded-lg transition-colors"
                >
                  <div className={`flex items-center space-x-2 ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-blue-50 rounded-lg -z-10"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side: User Menu + Hamburger Button */}
          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            {/* User Menu - Show on all screens */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {user?.avatar && (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover"
                />
              )}
              <div className="hidden sm:block">
                <p className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[100px] md:max-w-none">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            
            {/* Sign Out Button - Show on all screens */}
            <button
              onClick={signOut}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Hamburger Menu Button - Show on iPad and mobile (below lg) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hamburger Menu Overlay - Show on iPad and mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={closeMenu}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-16 md:top-20 right-0 w-80 max-w-[85vw] h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-white border-l border-gray-200 shadow-xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 space-y-2">
                <div className="px-4 py-2 mb-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">Navigation</p>
                </div>
                
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMenu}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-base font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;