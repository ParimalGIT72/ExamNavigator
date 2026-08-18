import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ILearningResource, ITopic, IChapter, ISubject } from '@/types';

const resourceSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  chapterId: z.string().min(1, 'Chapter is required'),
  topicId: z.string().min(1, 'Topic is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  resourceType: z.string().min(1, 'Resource type is required'),
  contentUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  textContent: z.string().optional(),
  author: z.string().optional(),
});

export type ResourceFormData = z.infer<typeof resourceSchema>;

export interface ResourceFormProps {
  initialData?: ILearningResource | null;
  subjects: ISubject[];
  chapters: IChapter[];
  topics: ITopic[];
  defaultTopicId?: string;
  onSubmit: (data: ResourceFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ResourceForm: React.FC<ResourceFormProps> = ({
  initialData,
  subjects,
  chapters,
  topics,
  defaultTopicId,
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
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      subjectId: getObjId(initialData?.subjectId),
      chapterId: getObjId(initialData?.chapterId),
      topicId: getObjId(initialData?.topicId, defaultTopicId),
      title: initialData?.title || '',
      resourceType: initialData?.resourceType || 'PDF',
      contentUrl: initialData?.contentUrl || '',
      textContent: initialData?.textContent || '',
      author: initialData?.author || '',
    },
  });

  const selectedSubjectId = watch('subjectId');
  const selectedChapterId = watch('chapterId');

  const filteredChapters = chapters.filter((ch) => {
    if (!selectedSubjectId) return true;
    const chSubId = typeof ch.subjectId === 'object' ? ch.subjectId._id : ch.subjectId;
    return chSubId === selectedSubjectId;
  });

  const filteredTopics = topics.filter((tp) => {
    if (!selectedChapterId) return true;
    const tpChId = typeof tp.chapterId === 'object' ? tp.chapterId._id : tp.chapterId;
    return tpChId === selectedChapterId;
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                {ch.title}
              </option>
            ))}
          </select>
          {errors.chapterId && <span className="text-xs text-red-600 font-medium">{errors.chapterId.message}</span>}
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Topic</label>
          <select
            aria-label="Topic"
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register('topicId')}
          >
            <option value="">-- Select Topic --</option>
            {filteredTopics.map((tp) => (
              <option key={tp._id} value={tp._id}>
                {tp.title}
              </option>
            ))}
          </select>
          {errors.topicId && <span className="text-xs text-red-600 font-medium">{errors.topicId.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Resource Title"
            placeholder="e.g. Free Body Diagrams Quick Sheet"
            error={errors.title?.message}
            {...register('title')}
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Resource Type</label>
          <select
            aria-label="Resource Type"
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register('resourceType')}
          >
            <option value="PDF">PDF Document</option>
            <option value="Video">Video Tutorial</option>
            <option value="Text">Text Notes</option>
            <option value="Link">External Link</option>
            <option value="FormulaSheet">Formula Sheet</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <Input
        label="Content URL / External Link"
        placeholder="https://cdn.examnavigator.com/docs/fbd_notes.pdf"
        error={errors.contentUrl?.message}
        {...register('contentUrl')}
      />

      <Input
        label="Author / Instructor Name"
        placeholder="Prof. H.C. Verma"
        error={errors.author?.message}
        {...register('author')}
      />

      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Text Content / Study Notes</label>
        <textarea
          rows={4}
          aria-label="Text Content"
          placeholder="Enter text notes, summary or inline derivations..."
          className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs"
          {...register('textContent')}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Resource' : 'Create Resource'}
        </Button>
      </div>
    </form>
  );
};
