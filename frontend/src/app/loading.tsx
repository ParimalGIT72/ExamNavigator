import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mb-4" />
      <p className="text-sm font-medium text-slate-600">Loading ExamNavigator...</p>
    </div>
  );
}
