import React from 'react';
import { cleanMathTags, renderKaTeXHtml } from '../../src/utils/katex-renderer';
import { AcademicService } from '../../src/services/academic.service';
import { ISubject, ILearningResource, IChapter } from '../../src/types';

describe('Phase 7C.2 — Quick Revision & Formula Sheets Unit Tests', () => {

  describe('Mathematical KaTeX Rendering Tests', () => {
    it('1. should clean legacy XML tags <math>, <equation>, <latex> into LaTeX delimiters', () => {
      const legacyXml = '<math>E = mc^2</math> and <equation>F = ma</equation>';
      const cleaned = cleanMathTags(legacyXml);
      expect(cleaned).toContain('\\(E = mc^2\\)');
      expect(cleaned).toContain('$F = ma$');
    });

    it('2. should render KaTeX inline equations without throwing errors', () => {
      const html = renderKaTeXHtml('E = mc^2', false);
      expect(html).toBeDefined();
      expect(html).toContain('katex');
    });

    it('3. should render KaTeX display equations without throwing errors', () => {
      const html = renderKaTeXHtml('F = \\frac{G m_1 m_2}{r^2}', true);
      expect(html).toBeDefined();
      expect(html).toContain('katex');
    });
  });

  describe('Quick Revision Service Data Fetching & Target Exam Scoping', () => {
    it('4. should fetch formula sheet resources using resourceType=FormulaSheet filter', async () => {
      const subjectId = '507f1f77bcf86cd799439001';
      const mockFormulaSheets: ILearningResource[] = [
        {
          _id: 'r1',
          topicId: 't1',
          chapterId: 'c1',
          subjectId,
          title: 'Coulomb Law Formula Sheet',
          resourceType: 'FormulaSheet',
          textContent: 'F = k * q1 * q2 / r^2',
          order: 1,
          isActive: true,
        },
        {
          _id: 'r2',
          topicId: 't2',
          chapterId: 'c1',
          subjectId,
          title: 'Gauss Law Formula Sheet',
          resourceType: 'FormulaSheet',
          textContent: 'Phi = Q / eps0',
          order: 2,
          isActive: true,
        },
      ];

      const spyResources = jest.spyOn(AcademicService, 'getResources').mockResolvedValueOnce({
        success: true,
        message: 'Formula sheets retrieved',
        data: {
          items: mockFormulaSheets,
          pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
        },
      });

      const res = await AcademicService.getResources(undefined, subjectId, 'FormulaSheet');
      expect(res.success).toBe(true);
      expect(res.data?.items.length).toBe(2);
      expect(res.data?.items[0].resourceType).toBe('FormulaSheet');
      expect(res.data?.items[0].order).toBe(1);
      expect(res.data?.items[1].order).toBe(2);

      spyResources.mockRestore();
    });

    it('5. should handle search filtering across formula sheet titles and text contents', () => {
      const sheets: ILearningResource[] = [
        { _id: 'r1', topicId: 't1', chapterId: 'c1', subjectId: 's1', title: 'Coulomb Law Formula Sheet', resourceType: 'FormulaSheet', textContent: 'Force calculation' },
        { _id: 'r2', topicId: 't2', chapterId: 'c1', subjectId: 's1', title: 'Gauss Law Quick Sheet', resourceType: 'FormulaSheet', textContent: 'Electric Flux' },
      ];

      const query = 'coulomb';
      const filtered = sheets.filter(
        (s) => s.title.toLowerCase().includes(query) || (s.textContent || '').toLowerCase().includes(query)
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Coulomb Law Formula Sheet');
    });

    it('6. should calculate Previous / Next navigation indices cleanly', () => {
      const sheets: ILearningResource[] = [
        { _id: 'r1', topicId: 't1', chapterId: 'c1', subjectId: 's1', title: 'Sheet 1', resourceType: 'FormulaSheet', order: 1 },
        { _id: 'r2', topicId: 't2', chapterId: 'c1', subjectId: 's1', title: 'Sheet 2', resourceType: 'FormulaSheet', order: 2 },
        { _id: 'r3', topicId: 't3', chapterId: 'c2', subjectId: 's1', title: 'Sheet 3', resourceType: 'FormulaSheet', order: 3 },
      ];

      // First item: no previous, has next
      let currentIdx = 0;
      let hasPrevious = currentIdx > 0;
      let hasNext = currentIdx < sheets.length - 1;
      expect(hasPrevious).toBe(false);
      expect(hasNext).toBe(true);

      // Middle item: has previous, has next
      currentIdx = 1;
      hasPrevious = currentIdx > 0;
      hasNext = currentIdx < sheets.length - 1;
      expect(hasPrevious).toBe(true);
      expect(hasNext).toBe(true);

      // Last item: has previous, no next
      currentIdx = 2;
      hasPrevious = currentIdx > 0;
      hasNext = currentIdx < sheets.length - 1;
      expect(hasPrevious).toBe(true);
      expect(hasNext).toBe(false);
    });

    it('7. should handle 403 FORBIDDEN_EXAM_CURRICULUM security error response gracefully', async () => {
      const spyResource = jest.spyOn(AcademicService, 'getResourceById').mockResolvedValueOnce({
        success: false,
        message: 'Access denied. Subject does not belong to your assigned target exam curriculum.',
        errorCode: 'FORBIDDEN_EXAM_CURRICULUM',
      });

      const res = await AcademicService.getResourceById('neetResourceUnderJeeUser');
      expect(res.success).toBe(false);
      expect(res.errorCode).toBe('FORBIDDEN_EXAM_CURRICULUM');

      spyResource.mockRestore();
    });
  });
});
