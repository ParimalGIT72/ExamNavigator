import { STUDENT_NAV_ITEMS, ADMIN_NAV_ITEMS } from '../../src/config/navigation';
import { useToastStore } from '../../src/store/useToastStore';

describe('UI Infrastructure & Navigation Unit Tests', () => {
  it('should have valid navigation configurations', () => {
    expect(Array.isArray(STUDENT_NAV_ITEMS)).toBe(true);
    expect(STUDENT_NAV_ITEMS.length).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(ADMIN_NAV_ITEMS)).toBe(true);
    expect(ADMIN_NAV_ITEMS.length).toBeGreaterThanOrEqual(5);
  });

  it('should add and remove toasts in toast store', () => {
    useToastStore.getState().addToast({
      type: 'success',
      title: 'Test Notification',
      message: 'Toast added successfully',
    });

    let state = useToastStore.getState();
    expect(state.toasts.length).toBe(1);
    expect(state.toasts[0].message).toBe('Toast added successfully');

    const toastId = state.toasts[0].id;
    useToastStore.getState().removeToast(toastId);

    state = useToastStore.getState();
    expect(state.toasts.length).toBe(0);
  });
});
