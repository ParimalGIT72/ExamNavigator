import { useAuthStore } from '../../src/store/useAuthStore';

describe('useAuthStore Unit Tests', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should initialize with empty auth state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should update state on setAuth, updateUser, and logout', () => {
    const dummyUser: any = {
      id: 'usr1',
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'Student',
      accountStatus: 'Active',
      emailVerified: true,
    };

    useAuthStore.getState().setAuth(dummyUser, 'sample_jwt_token');
    let state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.fullName).toBe('John Doe');
    expect(state.token).toBe('sample_jwt_token');

    useAuthStore.getState().updateUser({ fullName: 'John Updated' });
    state = useAuthStore.getState();
    expect(state.user?.fullName).toBe('John Updated');

    useAuthStore.getState().logout();
    state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
