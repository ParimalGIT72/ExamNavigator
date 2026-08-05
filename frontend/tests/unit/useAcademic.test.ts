import { AcademicService } from '../../src/services/academic.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runAcademicServiceUnitTests() {
  assert(typeof AcademicService.getSubjects === 'function', 'getSubjects service method must exist');
  assert(typeof AcademicService.getSubjectById === 'function', 'getSubjectById service method must exist');
  assert(typeof AcademicService.createSubject === 'function', 'createSubject service method must exist');
  assert(typeof AcademicService.updateSubject === 'function', 'updateSubject service method must exist');
  assert(typeof AcademicService.deleteSubject === 'function', 'deleteSubject service method must exist');

  assert(typeof AcademicService.getChapters === 'function', 'getChapters service method must exist');
  assert(typeof AcademicService.getChapterById === 'function', 'getChapterById service method must exist');
  assert(typeof AcademicService.createChapter === 'function', 'createChapter service method must exist');
  assert(typeof AcademicService.updateChapter === 'function', 'updateChapter service method must exist');
  assert(typeof AcademicService.deleteChapter === 'function', 'deleteChapter service method must exist');

  assert(typeof AcademicService.getTopics === 'function', 'getTopics service method must exist');
  assert(typeof AcademicService.getTopicById === 'function', 'getTopicById service method must exist');
  assert(typeof AcademicService.createTopic === 'function', 'createTopic service method must exist');
  assert(typeof AcademicService.updateTopic === 'function', 'updateTopic service method must exist');
  assert(typeof AcademicService.deleteTopic === 'function', 'deleteTopic service method must exist');

  assert(typeof AcademicService.getResources === 'function', 'getResources service method must exist');
  assert(typeof AcademicService.getResourceById === 'function', 'getResourceById service method must exist');
  assert(typeof AcademicService.createResource === 'function', 'createResource service method must exist');
  assert(typeof AcademicService.updateResource === 'function', 'updateResource service method must exist');
  assert(typeof AcademicService.deleteResource === 'function', 'deleteResource service method must exist');

  console.log('All AcademicService unit tests passed successfully.');
}

if (require.main === module) {
  runAcademicServiceUnitTests();
}
