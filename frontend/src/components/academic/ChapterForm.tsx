import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { IChapter, ISubject } from '@/types';

const chapterSchema = z.object({
  subjectId: z.string().min(1, 'Parent subject is required'),
  title: z.string().min(2, 'Chapter title must be at least 2 characters'),
  chapterNumber: z.number().min(1, 'Chapter number must be at least 1'),
  description: z.string().optional(),
  weightage: z.number().min(0).max(100).optional(),
  estimatedHours: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

export interface ChapterFormProps {
  initialData?: IChapter | null;
  subjects: ISubject[];
  defaultSubjectId?: string;
  onSubmit: (data: ChapterFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ChapterForm: React.FC<ChapterFormProps> = ({
  initialData,
  subjects,
  defaultSubjectId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const getSubId = (sub: string | ISubject | undefined) =>
    typeof sub === 'object' ? sub._id : sub || defaultSubjectId || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      subjectId: getSubId(initialData?.subjectId),
      title: initialData?.title || '',
      chapterNumber: initialData?.chapterNumber || 1,
      description: initialData?.description || '',
      weightage: initialData?.weightage || 5,
      estimatedHours: initialData?.estimatedHours || 4,
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Parent Subject</label>
        <select
          aria-label="Parent Subject"
          className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          {...register('subjectId')}
        >
          <option value="">-- Select Subject --</option>
          {subjects.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name} ({sub.examType})
            </option>
          ))}
        </select>
        {errors.subjectId && <span className="text-xs text-red-600 font-medium">{errors.subjectId.message}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Chapter Title"
            placeholder="e.g. Kinematics and Motion"
            error={errors.title?.message}
            {...register('title')}
          />
        </div>
        <Input
          label="Chapter No."
          type="number"
          error={errors.chapterNumber?.message}
          {...register('chapterNumber', { valueAsNumber: true })}
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          rows={3}
          aria-label="Chapter Description"
          placeholder="Brief outline of concepts covered..."
          className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Weightage (%)"
          type="number"
          placeholder="e.g. 8"
          error={errors.weightage?.message}
          {...register('weightage', { valueAsNumber: true })}
        />
        <Input
          label="Est. Study Hours"
          type="number"
          placeholder="e.g. 6"
          error={errors.estimatedHours?.message}
          {...register('estimatedHours', { valueAsNumber: true })}
        />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input
          type="checkbox"
          id="isActiveChapter"
          className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded"
          {...register('isActive')}
        />
        <label htmlFor="isActiveChapter" className="text-sm font-medium text-slate-700">
          Active & Visible to Students
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Chapter' : 'Create Chapter'}
        </Button>
      </div>
    </form>
  );
};
