import { createFetchModule } from './createFetchModule';

interface Todo {
  id: string;
  name: string;
  isCompleted: boolean;
}

describe('createFetchModule()', () => {
  it('should build state', () => {
    const module = createFetchModule({
      endpoints: (builder) => ({
        retrieve: builder.create<Todo, string>({
          requestFn: async () => {
            return Promise.resolve<Todo>({ id: '1', name: 'Lunch with Jon Doe', isCompleted: false });
          },
        }),
      }),
    });

    expect(module.state).not.toEqual({}), expect(module.state['retrieve']).not.toBeUndefined();
    expect(module.state['retrieve']?.isLoading).toEqual(false);
    expect(module.state['retrieve']?.hasError).toEqual(false);
    expect(module.state['retrieve']?.error).toEqual(null);
    expect(module.state['retrieve']?.data).toEqual(null);
  });

  it('should build getters', () => {
    const module = createFetchModule({
      endpoints: (builder) => ({
        retrieve: builder.create<Todo, string>({
          requestFn: async () => {
            return Promise.resolve<Todo>({ id: '1', name: 'Lunch with Jon Doe', isCompleted: false });
          },
        }),
      }),
    });

    expect(module.getters).not.toEqual({});
    expect(module.getters['retrieve']).not.toBeUndefined();
    const retrieveGetterFn = module.getters['retrieve'];
    expect(retrieveGetterFn).not.toBeUndefined();
    const getterResult = retrieveGetterFn?.(module.state, {}, {}, {});
    expect(getterResult).toEqual({
      data: null,
      error: null,
      hasError: false,
      isLoading: false,
    });
  });

  it('should build mutations', () => {
    const module = createFetchModule({
      endpoints: (builder) => ({
        retrieve: builder.create<Todo, string>({
          requestFn: async () => {
            return Promise.resolve<Todo>({ id: '1', name: 'Lunch with Jon Doe', isCompleted: false });
          },
        }),
      }),
    });

    expect(module.mutations['retrieveInit']).not.toBeUndefined();
    const initMutationFn = module.mutations['retrieveInit'];
    expect(initMutationFn).not.toBeUndefined();
    initMutationFn?.(module.state);
    expect(module.state['retrieve']?.isLoading).toEqual(true);
    expect(module.state['retrieve']?.hasError).toEqual(false);
    expect(module.state['retrieve']?.error).toEqual(null);
    expect(module.state['retrieve']?.data).toEqual(null);

    expect(module.mutations['retrieveSuccess']).not.toBeUndefined();
    const successMutationFn = module.mutations['retrieveSuccess'];
    expect(successMutationFn).not.toBeUndefined();
    const payload = [{ id: '1', name: 'Buy water', isCompleted: false }];
    successMutationFn?.(module.state, payload);
    expect(module.state['retrieve']?.isLoading).toEqual(false);
    expect(module.state['retrieve']?.hasError).toEqual(false);
    expect(module.state['retrieve']?.error).toEqual(null);
    expect(module.state['retrieve']?.data).toEqual(payload);

    expect(module.mutations['retrieveError']).not.toBeUndefined();
    const errorMutationFn = module.mutations['retrieveError'];
    expect(errorMutationFn).not.toBeUndefined();
    const errorPayload = new Error('Unknown error occurred');
    errorMutationFn?.(module.state, errorPayload);
    expect(module.state['retrieve']?.isLoading).toEqual(false);
    expect(module.state['retrieve']?.hasError).toEqual(true);
    expect(module.state['retrieve']?.error).toEqual(errorPayload);
    expect(module.state['retrieve']?.data).toEqual(null);
  });

  it('should build actions', async () => {
    const result = createFetchModule({
      endpoints: (builder) => ({
        retrieve: builder.create<Todo, string>({
          requestFn: async () => {
            return Promise.resolve<Todo>({ id: '1', name: 'Lunch with Jon Doe', isCompleted: false });
          },
        }),
      }),
    });

    expect(result.actions).not.toEqual({});
    expect(result.actions['retrieve']).not.toBeUndefined();
    const actionFn = result.actions['retrieve'];
    expect(actionFn).not.toBeUndefined();
  });
});
