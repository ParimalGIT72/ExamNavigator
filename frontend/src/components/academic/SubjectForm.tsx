import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ISubject } from '@/types';

const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name must be at least 2 characters'),
  code: z.string().min(2, 'Subject code must be at least 2 characters'),
  examType: z.enum(['JEE', 'NEET', 'MHT-CET', 'University', 'Other']),
  description: z.string().optional(),
  order: z.number().min(0, 'Order must be non-negative'),
  isActive: z.boolean().default(true),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export interface SubjectFormProps {
  initialData?: ISubject | null;
  onSubmit: (data: SubjectFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      examType: initialData?.examType || 'JEE',
      description: initialData?.description || '',
      order: initialData?.order ?? 1,
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Subject Name"
        placeholder="e.g. Physics, Organic Chemistry"
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Subject Code"
          placeholder="e.g. PHY101"
          error={errors.code?.message}
          {...register('code')}
        />

        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Target Exam</label>
          <select
            aria-label="Target Exam"
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register('examType')}
          >
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
            <option value="MHT-CET">MHT-CET</option>
            <option value="University">University</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          rows={3}
          aria-label="Subject Description"
          placeholder="Brief summary of syllabus and subject contents..."
          className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <Input
          label="Display Order"
          type="number"
          error={errors.order?.message}
          {...register('order', { valueAsNumber: true })}
        />

        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="isActiveSubject"
            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded"
            {...register('isActive')}
          />
          <label htmlFor="isActiveSubject" className="text-sm font-medium text-slate-700">
            Active & Visible to Students
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Subject' : 'Create Subject'}
        </Button>
      </div>
    </form>
  );
};
