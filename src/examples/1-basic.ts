import { createStore } from 'vuex';

import { createFetchModule } from '../createFetchModule';

export interface Todo {
  id: string;
  name: string;
  isCompleted: boolean;
}

export interface CreateTodo {
  name: string;
  isCompleted: boolean;
}

export interface UpdateTodo extends Partial<CreateTodo> {
  id: string;
}

const todosModule = createFetchModule({
  endpoints: (builder) => ({
    create: builder.create<Todo, CreateTodo>({
      requestFn: async (newTodo) => {
        console.log('Creating todo item');
        return Promise.resolve<Todo>({ id: '5', ...newTodo });
      },
    }),
    retrieve: builder.create<Todo, string>({
      requestFn: async (id) => {
        console.log('Retrieving todo item with id:', id);
        return Promise.resolve<Todo>({ id: '1', name: 'Lunch with Jon Doe', isCompleted: false });
      },
    }),
    list: builder.create<Todo[], void>({
      requestFn: async (dispatch) => {
        console.log('Listing todo items');
        dispatch('retrieve', '155');
        return Promise.resolve<Todo[]>([{ id: '1', name: 'Lunch with Joe Doe', isCompleted: false }]);
      },
    }),
    update: builder.create<Todo, UpdateTodo>({
      requestFn: async (updateTodo) => {
        console.log('Updating a todo item with id:', updateTodo.id);
        return Promise.resolve<Todo>({
          id: '1',
          name: updateTodo.name ?? 'Lunch with Joe Doe',
          isCompleted: updateTodo.isCompleted ?? false,
        });
      },
    }),
    delete: builder.create<void, string>({
      requestFn: async (id, dispatch) => {
        console.log('Deleting a todo item with id:', id);
        dispatch('list');
      },
    }),
  }),
});

export interface RootState {
  todos: typeof todosModule.state;
}

const store = createStore<RootState>({
  modules: {
    todos: todosModule,
  },
});

const main = () => {
  store.dispatch('todos/list');
  console.log('data:', store.state.todos.list.data);
  console.log('isLoading:', store.getters['todos/list'].isLoading);
  console.log('error:', store.getters['todos/list'].error);

  setTimeout(() => {
    store.dispatch('todos/delete', '1');
  }, 500);

  setTimeout(() => {
    console.log('data:', store.getters['todos/list'].data);
    console.log('isLoading:', store.state.todos.list.isLoading);
    console.log('error:', store.state.todos.list.error);
  }, 1500);
};

main();
