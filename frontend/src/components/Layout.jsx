import React from 'react';
import { Calendar, GraduationCap, Layout as LayoutIcon } from 'lucide-react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-primary-500 p-2 rounded-lg">
            <Calendar className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Smart Timetable <span className="text-primary-400">Pro</span>
          </h1>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/60">
          <a href="#" className="hover:text-primary-400 transition-colors">Documentation</a>
          <a href="#" className="hover:text-primary-400 transition-colors">Support</a>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
        {children}
      </main>

      <footer className="py-8 px-6 text-center text-white/30 text-sm border-t border-white/5 mt-auto">
        <p>© 2026 Bangalore Institute of Technology. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
