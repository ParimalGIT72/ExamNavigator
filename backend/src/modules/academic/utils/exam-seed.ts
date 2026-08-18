import { ExamModel, IExamDocument } from '../models/exam.model';

export const INITIAL_EXAMS: Partial<IExamDocument>[] = [
  {
    code: 'JEE',
    name: 'Joint Entrance Examination',
    category: 'Engineering',
    description: 'National level engineering entrance examination in India for admission to IITs, NITs, and IIITs.',
    icon: 'Brain',
    order: 1,
    isActive: true,
  },
  {
    code: 'NEET',
    name: 'National Eligibility cum Entrance Test',
    category: 'Medical',
    description: 'All India pre-medical entrance test for students wishing to pursue undergraduate medical (MBBS) and dental (BDS) courses.',
    icon: 'Stethoscope',
    order: 2,
    isActive: true,
  },
  {
    code: 'MHT-CET',
    name: 'Maharashtra Common Entrance Test',
    category: 'Engineering',
    description: 'State level entrance exam for engineering, pharmacy, and agriculture admissions in Maharashtra.',
    icon: 'GraduationCap',
    order: 3,
    isActive: true,
  },
  {
    code: 'GATE',
    name: 'Graduate Aptitude Test in Engineering',
    category: 'Engineering',
    description: 'Master level examination testing comprehensive understanding of undergraduate subjects in engineering and science.',
    icon: 'Award',
    order: 4,
    isActive: true,
  },
  {
    code: 'CAT',
    name: 'Common Admission Test',
    category: 'Management',
    description: 'Computer-based test for admission to graduate management programs at Indian Institutes of Management (IIMs).',
    icon: 'Briefcase',
    order: 5,
    isActive: true,
  },
];

/**
 * Idempotent seed function for initial exam definitions.
 * Running this function multiple times will update existing exams without creating duplicates.
 */
export async function seedExams(): Promise<IExamDocument[]> {
  const seededExams: IExamDocument[] = [];

  for (const examData of INITIAL_EXAMS) {
    const updated = await ExamModel.findOneAndUpdate(
      { code: examData.code },
      { $set: examData },
      { upsert: true, new: true, runValidators: true }
    ).exec();

    if (updated) {
      seededExams.push(updated);
    }
  }

  return seededExams;
}
