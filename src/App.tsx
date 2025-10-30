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

const App = () => {
  const { isAuthenticated } = useAuthStore();
  const { children, setActiveChild } = useChildStore();

  // Set active child on app load if none is selected
  useEffect(() => {
    if (isAuthenticated && children.length > 0) {
      setActiveChild(children[0]);
    }
  }, [isAuthenticated, children, setActiveChild]);

  if (!isAuthenticated) {
    return (
      <>
        <LandingPage />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <Router>
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
    </Router>
  );
};

export default App;