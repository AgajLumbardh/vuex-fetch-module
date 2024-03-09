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
      requestFn: async () => {
        console.log('Listing todo items');
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
  namespaced: false,
});

export interface RootState {
  todos: typeof todosModule.state;
}

const store = createStore<RootState>({
  modules: {
    todos: todosModule,
  },
});

// NOTE: actions must be unique
store.dispatch('list');
store.dispatch('delete', '123');

console.log('data:', store.state.todos.list.data);
console.log('isLoading:', store.getters.list.isLoading);
console.log('error:', store.getters.list.error);

const main = () => {
  setTimeout(() => {
    console.log('data:', store.getters.list.data);
    console.log('isLoading:', store.state.todos.list.isLoading);
    console.log('error:', store.state.todos.list.error);
  }, 1500);
};

main();
