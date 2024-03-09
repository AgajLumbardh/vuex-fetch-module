import { createStore } from 'vuex';

import { createFetchModule } from '../createFetchModule';

export interface Todo {
  id: string;
  name: string;
  isCompleted: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
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
});

const booksModule = createFetchModule({
  endpoints: (builder) => ({
    list: builder.create<Book[], void>({
      requestFn: async () => {
        console.log('Listing books');
        return Promise.resolve<Book[]>([{ id: '1', title: 'Dune', author: 'Frank Herbert' }]);
      },
    }),
  }),
});

export interface RootState {
  todos: typeof todosModule.state;
  books: typeof booksModule.state;
}

const store = createStore<RootState>({
  modules: {
    todos: todosModule,
    books: booksModule,
  },
});

store.dispatch('todos/list');
store.dispatch('books/list');

const main = () => {
  setTimeout(() => {
    console.log('todos/list.data:', store.getters['todos/list'].data);
    console.log('todos/list.isLoading:', store.state.todos.list.isLoading);
    console.log('todos/list.error:', store.state.todos.list.error);

    console.log('books/list.data', store.state.books.list.data);
    console.log('books/list.isLoading', store.getters['books/list'].isLoading);
    console.log('books/list.error:', store.getters['books/list'].error);
  }, 1500);
};

main();
