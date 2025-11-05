import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ActivityBuilder from './pages/ActivityBuilder';
import ChildProfile from './pages/ChildProfile';
import LearningStories from './pages/LearningStories';
import TherapyCenter from './pages/TherapyCenter';
import ProgressAnalytics from './pages/ProgressAnalytics';
import AIActivityGenerator from './pages/AIActivityGenerator';
import AIProGenerator from './pages/AIProGenerator';
import Navigation from './components/Navigation';
import { useAuthStore } from './store/authStore';
import { useChildStore } from './store/childStore';
import { supabase } from './lib/supabase';

const App = () => {
  const { isAuthenticated, setSession, isLoading: authLoading } = useAuthStore();
  const { children, setActiveChild } = useChildStore();
  const [initializing, setInitializing] = React.useState(true);

  // Listen to Supabase auth state changes
  useEffect(() => {
    let mounted = true;

    // Get initial session and wait for it to load
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error);
            setSession(null);
          } else {
            setSession(session);
          }
          setInitializing(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setSession(null);
          setInitializing(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      
      // Handle OAuth callback
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setInitializing(false);
        
        // Clear hash fragment from URL after OAuth redirect
        if (event === 'SIGNED_IN' && window.location.hash) {
          // Wait a bit to ensure Supabase has processed the hash
          setTimeout(() => {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }, 100);
        }
      }
      
      // Handle sign out
      if (event === 'SIGNED_OUT') {
        setInitializing(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession]);

  // Set active child on app load if none is selected
  useEffect(() => {
    if (isAuthenticated && children.length > 0) {
      setActiveChild(children[0]);
    }
  }, [isAuthenticated, children, setActiveChild]);

  // Show loading state while initializing auth
  if (initializing || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {!isAuthenticated ? (
        <>
          <LandingPage />
          <Toaster position="top-right" />
        </>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/child-profile" element={<ChildProfile />} />
              <Route path="/activity-builder" element={<ActivityBuilder />} />
              <Route path="/learning-stories" element={<LearningStories />} />
              <Route path="/therapy" element={<TherapyCenter />} />
              <Route path="/analytics" element={<ProgressAnalytics />} />
              <Route path="/admin/ai-generator" element={<AIActivityGenerator />} />
              <Route path="/admin/ai-pro-generator" element={<AIProGenerator />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      )}
    </Router>
  );
};

export default App;