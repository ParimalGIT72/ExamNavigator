import './globals.css';
import React from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'ExamNavigator | AI-Powered Learning Platform',
  description: 'Master concepts, solve doubts, and excel in competitive exams with ExamNavigator.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
