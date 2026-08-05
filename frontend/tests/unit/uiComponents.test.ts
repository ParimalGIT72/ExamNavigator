import { STUDENT_NAV_ITEMS, ADMIN_NAV_ITEMS } from '../../src/config/navigation';
import { useToastStore } from '../../src/store/useToastStore';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runUIComponentsUnitTests() {
  // 1. Navigation config assertions
  assert(Array.isArray(STUDENT_NAV_ITEMS), 'STUDENT_NAV_ITEMS must be an array');
  assert(STUDENT_NAV_ITEMS.length >= 2, 'STUDENT_NAV_ITEMS must contain at least 2 navigation items');
  assert(Array.isArray(ADMIN_NAV_ITEMS), 'ADMIN_NAV_ITEMS must be an array');
  assert(ADMIN_NAV_ITEMS.length >= 5, 'ADMIN_NAV_ITEMS must contain at least 5 navigation items');

  // 2. Toast Store assertions
  useToastStore.getState().addToast({
    type: 'success',
    title: 'Test Notification',
    message: 'Toast added successfully',
  });

  let state = useToastStore.getState();
  assert(state.toasts.length === 1, 'Toast should be added to store');
  assert(state.toasts[0].message === 'Toast added successfully', 'Toast message must match');

  const toastId = state.toasts[0].id;
  useToastStore.getState().removeToast(toastId);

  state = useToastStore.getState();
  assert(state.toasts.length === 0, 'Toast should be removed from store');

  console.log('All UI components & navigation infrastructure unit tests passed successfully.');
}

if (require.main === module) {
  runUIComponentsUnitTests();
}
