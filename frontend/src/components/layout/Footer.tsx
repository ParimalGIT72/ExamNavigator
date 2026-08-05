import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} <span className="font-semibold text-slate-700">ExamNavigator</span>. All rights reserved.
        </div>
        <div className="flex items-center space-x-6">
          <span className="hover:text-slate-700 transition-colors">Privacy Policy</span>
          <span className="hover:text-slate-700 transition-colors">Terms of Service</span>
          <span className="hover:text-slate-700 transition-colors">Help Center</span>
        </div>
      </div>
    </footer>
  );
};
