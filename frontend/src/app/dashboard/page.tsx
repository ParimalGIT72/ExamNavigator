'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, Bell, Layers, Sparkles, Bot, RefreshCw, TrendingUp, CheckCircle2, Clock, Circle, Zap, History, CalendarCheck } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/useAuthStore';
import { useSubjectsQuery, useRecommendedTopicsQuery } from '@/hooks/useAcademic';
import { useProgressAnalyticsQuery, useLearningActivityQuery } from '@/hooks/useProgress';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading, isError, error, refetch } = useSubjectsQuery();
  const {
    data: recData,
    isLoading: recLoading,
  } = useRecommendedTopicsQuery({ limit: 4 });
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useProgressAnalyticsQuery();
  const {
    data: activityData,
    isLoading: activityLoading,
  } = useLearningActivityQuery();

  const targetExam = user?.targetExam || 'JEE';

  return (
    <ProtectedRoute allowedRoles={['Student', 'Admin']}>
      <StudentLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-brand-600 via-indigo-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-brand-200 text-xs font-bold uppercase tracking-wider mb-1">
                <span>Student Learning Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.fullName || 'Student'}! 👋
              </h1>
              <p className="text-brand-100 text-sm mt-2 max-w-xl leading-relaxed">
                Target Exam: <span className="font-bold text-white px-2 py-0.5 bg-white/20 rounded-md">{targetExam}</span>. Explore your target exam curriculum modules, chapters, and resources.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/ai/tutor"
                className="inline-flex items-center justify-center px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all flex-shrink-0"
              >
                <Sparkles className="h-4 w-4 mr-2 text-slate-950" /> Ask AI Tutor
              </Link>
              <Link
                href="/subjects"
                className="inline-flex items-center justify-center px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm shadow transition-all flex-shrink-0 border border-white/20"
              >
                <BookOpen className="h-4 w-4 mr-2" /> All Subjects
              </Link>
            </div>
          </div>

          {/* Quick Learning & AI Access */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Doubts Tutor Card */}
            <Card className="p-6 border-slate-200 hover:shadow-md transition-all flex flex-col justify-between bg-gradient-to-b from-emerald-50/50 to-white dark:from-slate-900 dark:to-slate-900 lg:col-span-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit">
                    <Bot className="h-6 w-6" />
                  </div>
                  <Badge variant="success">AI Assistant</Badge>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Doubts Tutor</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Ask doubts for your competitive exam ({targetExam}) with instant RAG-grounded AI solutions.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">24/7 AI Assistant</span>
                <Link href="/ai/tutor" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center">
                  Ask Doubts <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </Card>

            {/* Quick Revision Card */}
            <Card className="p-6 border-slate-200 hover:shadow-md transition-all flex flex-col justify-between bg-gradient-to-b from-amber-50/60 to-white dark:from-slate-900 dark:to-slate-900 lg:col-span-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl w-fit">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <Badge variant="warning">{targetExam} Formula Sheets</Badge>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Quick Revision</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Fast formula sheets, key concepts, and high-priority revision notes for last-minute exam prep.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Last-Minute Prep</span>
                <Link href="/quick-revision" className="text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center">
                  Open Formula Sheets <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </Card>

            {/* Platform Announcement Card */}
            <Card className="p-6 border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-4 lg:col-span-1">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Announcements</h3>
                  <p className="text-xs text-slate-500">Curriculum progress</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="brand">{targetExam} Active</Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Your target exam curriculum ({targetExam}) is active. Browse your registered subjects below.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Phase 7D: Recommended Next Topics Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    Recommended Next Topics
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Prioritized curriculum topics for <span className="font-bold text-brand-600 dark:text-brand-400">{targetExam}</span>
                  </p>
                </div>
              </div>
            </div>

            {recLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!recLoading && recData && recData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recData.map((rec) => (
                  <Card
                    key={rec.topicId}
                    className="p-5 border-slate-200 dark:border-slate-800 hover:shadow-md transition-all bg-white dark:bg-slate-900 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="brand">{rec.subjectCode || rec.subjectName}</Badge>
                          <Badge
                            variant={
                              rec.priorityLevel === 'HIGH'
                                ? 'warning'
                                : rec.priorityLevel === 'MEDIUM'
                                ? 'info'
                                : 'gray'
                            }
                          >
                            {rec.priorityLevel} PRIORITY
                          </Badge>
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                          CPS: {rec.priorityScore}/100
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {rec.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        Chapter {rec.chapterNumber}: {rec.chapterTitle}
                        {rec.chapterWeightage ? ` • ${rec.chapterWeightage}% Weightage` : ''}
                      </p>

                      {/* Transparent Explanation Block */}
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Why Recommended:
                        </p>
                        {rec.explanation.map((exp, idx) => (
                          <p key={idx} className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                            • {exp}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        Difficulty: <span className="font-bold text-slate-700 dark:text-slate-300">{rec.difficultyLevel}</span>
                      </span>
                      <Link
                        href={`/topics/${rec.topicId}`}
                        className="inline-flex items-center text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700"
                      >
                        Study Topic <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Phase 8B: Progress Analytics Overview & Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    Progress & Analytics
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Syllabus coverage across <span className="font-bold text-indigo-600 dark:text-indigo-400">{targetExam}</span> subjects
                  </p>
                </div>
              </div>
            </div>

            {analyticsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!analyticsLoading && analyticsData && (
              <div className="space-y-6">
                {/* Overall Summary Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card className="p-4 border-slate-200 bg-white dark:bg-slate-900 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Completion</span>
                      <TrendingUp className="h-4 w-4 text-brand-600" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        {analyticsData.overall.overallCompletionPercentage}%
                      </span>
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                          className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${analyticsData.overall.overallCompletionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 border-slate-200 bg-white dark:bg-slate-900 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {analyticsData.overall.completedTopics}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">/ {analyticsData.overall.totalTopics} topics</span>
                    </div>
                  </Card>

                  <Card className="p-4 border-slate-200 bg-white dark:bg-slate-900 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
                      <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                        {analyticsData.overall.inProgressTopics}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">topics</span>
                    </div>
                  </Card>

                  <Card className="p-4 border-slate-200 bg-white dark:bg-slate-900 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unstarted</span>
                      <Circle className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-black text-slate-700 dark:text-slate-300">
                        {analyticsData.overall.unstartedTopics}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">topics</span>
                    </div>
                  </Card>
                </div>

                {/* Per-Subject Progress Breakdown Cards */}
                {analyticsData.bySubject && analyticsData.bySubject.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analyticsData.bySubject.map((sbj) => (
                      <Card key={sbj.subjectId} className="p-4 border-slate-200 bg-white dark:bg-slate-900 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="brand">{sbj.subjectCode}</Badge>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{sbj.subjectName}</h3>
                          </div>
                          <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">
                            {sbj.completionPercentage}%
                          </span>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${sbj.completionPercentage}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                          <span>{sbj.completedTopics} of {sbj.totalTopics} completed</span>
                          {sbj.inProgressTopics > 0 && (
                            <span className="text-amber-600 font-medium">{sbj.inProgressTopics} in progress</span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phase 8C: Learning Consistency & Recent Activity */}
          <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      Learning Consistency & Recent Activity
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Daily active learning streak (UTC-based) and historical topic state transitions
                    </p>
                  </div>
                </div>
              </div>

              {activityLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {!activityLoading && activityData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Metrics Column */}
                  <div className="space-y-4 lg:col-span-1">
                    {/* Streak Metric Card */}
                    <Card className="p-5 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex items-center space-x-4">
                      <div className="p-3.5 bg-amber-500 text-white rounded-2xl shadow-md">
                        <Zap className="h-7 w-7" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                          Current Streak
                        </span>
                        <div className="flex items-baseline space-x-1.5 mt-0.5">
                          <span className="text-3xl font-black text-amber-900 dark:text-amber-100">
                            {activityData.metrics.currentStreak}
                          </span>
                          <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                            {activityData.metrics.currentStreak === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                          Consecutive UTC days with recorded progress
                        </p>
                      </div>
                    </Card>

                    {/* Total Active Days Metric Card */}
                    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-4">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <CalendarCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Total Active Days
                        </span>
                        <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                          {activityData.metrics.totalActiveDays}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Distinct calendar days logged
                        </p>
                      </div>
                    </Card>
                  </div>

                  {/* Recent Activity Timeline Column */}
                  <div className="lg:col-span-2">
                    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                          <div className="flex items-center space-x-2">
                            <History className="h-4 w-4 text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              Recent Activity Timeline
                            </h3>
                          </div>
                          <span className="text-xs text-slate-400">
                            {activityData.metrics.totalActivityEvents} recorded state events
                          </span>
                        </div>

                        {activityData.recentActivity.length === 0 ? (
                          <p className="text-xs text-slate-500 py-6 text-center">
                            No recorded learning transitions yet. Mark a topic IN_PROGRESS or COMPLETED to build your streak!
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {activityData.recentActivity.slice(0, 5).map((item) => (
                              <div
                                key={item.eventId}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <Badge variant="brand">{item.subjectCode}</Badge>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                      {item.topicTitle}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                      {item.subjectName}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 text-right shrink-0">
                                  <Badge
                                    variant={
                                      item.eventType === 'TOPIC_COMPLETED'
                                        ? 'success'
                                        : item.eventType === 'TOPIC_STARTED'
                                        ? 'info'
                                        : 'warning'
                                    }
                                  >
                                    {item.eventType === 'TOPIC_COMPLETED'
                                      ? 'Completed'
                                      : item.eventType === 'TOPIC_STARTED'
                                      ? 'Started'
                                      : 'Resumed'}
                                  </Badge>
                                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                                    {new Date(item.occurredAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>

          {/* Dynamic "My Subjects" Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Subjects</h2>
                <p className="text-xs text-slate-500">
                  Curriculum for <span className="font-semibold text-brand-600">{targetExam}</span>
                </p>
              </div>
              <Link
                href="/subjects"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center"
              >
                View All Subjects <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>

            {/* Error State with Retry */}
            {isError && (
              <div className="space-y-3">
                <Alert
                  variant="error"
                  title="Failed to Load Subjects"
                  message={error?.message || 'Unable to load curriculum subjects.'}
                />
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Dynamic Subjects Grid */}
            {!isLoading && data && data.items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map((subject) => (
                  <Card
                    key={subject._id}
                    className="p-6 border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between bg-white"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <Badge variant="brand">{subject.examType || targetExam}</Badge>
                      </div>

                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{subject.code}</span>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5 line-clamp-1">{subject.name}</h3>
                      <p className="text-slate-600 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {subject.description || 'Comprehensive syllabus modules covering theory, formulas, and topic exercises.'}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <Layers className="h-4 w-4 mr-1 text-slate-400" />
                        <span>{subject.chapterCount ?? 0} Chapters</span>
                      </div>

                      <Link
                        href={`/subjects/${subject._id}`}
                        className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        Explore <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && data && data.items.length === 0 && (
              <EmptyState
                title="No Subjects Available"
                description="No subjects available for your selected exam."
              />
            )}
          </div>
        </div>
      </StudentLayout>
    </ProtectedRoute>
  );
}
