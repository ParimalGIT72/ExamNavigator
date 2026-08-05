import { useAuthStore } from '../../src/store/useAuthStore';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runAuthStoreUnitTests() {
  useAuthStore.getState().logout();

  let state = useAuthStore.getState();
  assert(state.user === null, 'User should be null initially');
  assert(state.isAuthenticated === false, 'isAuthenticated should be false initially');

  const dummyUser: any = {
    id: 'usr1',
    fullName: 'John Doe',
    email: 'john@example.com',
    role: 'Student',
    accountStatus: 'Active',
    emailVerified: true,
  };

  useAuthStore.getState().setAuth(dummyUser, 'sample_jwt_token');
  state = useAuthStore.getState();
  assert(state.isAuthenticated === true, 'isAuthenticated should be true after setAuth');
  assert(state.user?.fullName === 'John Doe', 'user.fullName should be John Doe');
  assert(state.token === 'sample_jwt_token', 'token should be set');

  useAuthStore.getState().updateUser({ fullName: 'John Updated' });
  state = useAuthStore.getState();
  assert(state.user?.fullName === 'John Updated', 'user.fullName should be updated');

  useAuthStore.getState().logout();
  state = useAuthStore.getState();
  assert(state.user === null, 'user should be null after logout');
  assert(state.isAuthenticated === false, 'isAuthenticated should be false after logout');

  console.log('All useAuthStore unit tests passed successfully.');
}

if (require.main === module) {
  runAuthStoreUnitTests();
}
