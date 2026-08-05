import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ITopic, IChapter, ISubject } from '@/types';

const topicSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  chapterId: z.string().min(1, 'Chapter is required'),
  title: z.string().min(2, 'Topic title must be at least 2 characters'),
  topicNumber: z.number().min(1, 'Topic number must be at least 1'),
  summary: z.string().optional(),
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']),
  importanceScore: z.number().min(1).max(10).optional(),
  tags: z.string().optional(),
});

type TopicFormData = z.infer<typeof topicSchema>;

export interface TopicFormProps {
  initialData?: ITopic | null;
  subjects: ISubject[];
  chapters: IChapter[];
  defaultChapterId?: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TopicForm: React.FC<TopicFormProps> = ({
  initialData,
  subjects,
  chapters,
  defaultChapterId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const getObjId = (item: any, fallback = '') =>
    typeof item === 'object' ? item._id : item || fallback;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      subjectId: getObjId(initialData?.subjectId),
      chapterId: getObjId(initialData?.chapterId, defaultChapterId),
      title: initialData?.title || '',
      topicNumber: initialData?.topicNumber || 1,
      summary: initialData?.summary || '',
      difficultyLevel: initialData?.difficultyLevel || 'Medium',
      importanceScore: initialData?.importanceScore || 5,
      tags: initialData?.tags?.join(', ') || '',
    },
  });

  const selectedSubjectId = watch('subjectId');

  const filteredChapters = chapters.filter((ch) => {
    if (!selectedSubjectId) return true;
    const chSubId = typeof ch.subjectId === 'object' ? ch.subjectId._id : ch.subjectId;
    return chSubId === selectedSubjectId;
  });

  const handleFormSubmit = (data: TopicFormData) => {
    const formattedData = {
      ...data,
      tags: data.tags
        ? data.tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : [],
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Subject</label>
          <select
            aria-label="Subject"
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register('subjectId')}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
          {errors.subjectId && <span className="text-xs text-red-600 font-medium">{errors.subjectId.message}</span>}
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Chapter</label>
          <select
            aria-label="Chapter"
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register('chapterId')}
          >
            <option value="">-- Select Chapter --</option>
            {filteredChapters.map((ch) => (
              <option key={ch._id} value={ch._id}>
                Ch {ch.chapterNumber}: {ch.title}
              </option>
            ))}
          </select>
          {errors.chapterId && <span className="text-xs text-red-600 font-medium">{errors.chapterId.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Topic Title"
            placeholder="e.g. Newton's Laws of Motion"
            error={errors.title?.message}
            {...register('title')}
          />
        </div>
        <Input
          label="Topic No."
          type="number"
          error={errors.topicNumber?.message}
          {...register('topicNumber', { valueAsNumber: true })}
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Summary</label>
        <textarea
          rows={3}
          aria-label="Topic Summary"
          placeholder="Key formulas, concepts, and definitions..."
          className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          {...register('summary')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Difficulty Level</label>
          <select
            aria-label="Difficulty Level"
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register('difficultyLevel')}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <Input
          label="Importance (1-10)"
          type="number"
          placeholder="5"
          error={errors.importanceScore?.message}
          {...register('importanceScore', { valueAsNumber: true })}
        />
      </div>

      <Input
        label="Tags (Comma Separated)"
        placeholder="e.g. Force, Acceleration, Dynamics"
        error={errors.tags?.message}
        {...register('tags')}
      />

      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Topic' : 'Create Topic'}
        </Button>
      </div>
    </form>
  );
};
