import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BookOpen, GraduationCap, Sparkles, Trophy } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-brand-600" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">ExamNavigator</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>AI-Driven Personal Learning Assistant</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Master Competitive Exams with <span className="text-brand-600">Intelligent RAG Tutoring</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Centralize your syllabus, generate personalized flashcards, solve doubts instantly with grounded AI, and track your readiness score.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Start Preparing Free
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Core Features
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <BookOpen className="h-10 w-10 text-brand-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Structured Syllabus</h3>
              <p className="text-slate-600">
                Browse subjects, chapters, and curated topic resources designed specifically for JEE, NEET, and MHT-CET.
              </p>
            </Card>
            <Card className="p-6">
              <Sparkles className="h-10 w-10 text-brand-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">RAG AI Tutor</h3>
              <p className="text-slate-600">
                Ask doubts and receive instant, grounded explanations cited directly from official syllabus documents.
              </p>
            </Card>
            <Card className="p-6">
              <Trophy className="h-10 w-10 text-brand-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Adaptive Assessments</h3>
              <p className="text-slate-600">
                Test your accuracy with AI-generated quizzes and full mock tests with real-time performance analytics.
              </p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} ExamNavigator. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
