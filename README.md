# vuex-fetch-module
A small library for request state management when using Vuex. The purpose of the library is to eliminate boilerplate code when fetching data is involved in web applications that use Vuex library.

## Installation

### Using the ES Module Build
You can use any of your preferred package managers to install the library.

```
  npx install vuex-fetch-module

  yarn add vuex-fetch-module

```

### Using the UMD Build
For browser usage, please use the UMD library build found in /dist folder. Besides adding the library via script tag you will also need to add library dependencies, namely Vue and Vuex.

```
  <script src="dist/index.js"></script>
```

## Getting Started

Please find below an example of creating a todos Vuex fetch module.

```
const todosModule = createFetchModule({
  endpoints: (builder) => ({
    create: builder.create<Todo, CreateTodo>({
      requestFn: async (payload, dispatch) => {
        const response = await axios.post<Todo>('/api/todos', payload)
        dispatch('list');
        return response.data;
      },
    }),
    retrieve: builder.create<Todo, string>({
      requestFn: async (id) => {
        const response = await axios.get<{data: Todo[]}>('/api/todos/${id}');
        return response.data;
      },
    }),
    list: builder.create<Todo[], void>({
      requestFn: async () => {
        const response = await axios.get<{data: Todo[]}>('/api/todos');
        return response.data.data;
      },
    }),
    update: builder.create<Todo, UpdateTodo>({
      requestFn: async (payload) => {
        const {id, ...body} = payload;
        const response = await axios.put<Todo>(`/api/todos/${id}`, body);
        dispatch('list');
        return response.data;
      },
    }),
    delete: builder.create<void, string>({
      requestFn: async (id, dispatch) => {
        await axios.delete(`/api/todos/${id}`);
        dispatch('list');
      },
    }),
  }),
});

```
Then, after module registration in the global store we can start consuming the todos module state, getters, and action methods.

```
  store.dispatch('todos/list');  // Dispatch todos list action

  store.state.todos.list.data // Read todos list data
  store.state.todos.list.isLoading // Read if todos list is loading
  store.state.todos.list.error // Read todos list error

  store.getters['todos/list'].data // Read todos list data using getters

  store.dispatch('todos/delete', '1') // Dispatch todos delete action

```

## APIs
### createFetchModule()
Th sole exported method which allows you to create Vuex fetch modules.

- **Syntax**
```
createFetchModule<E extends Endpoints, R>({ endpoints, namespaced = true }: CreateFetchModuleOptions<E>): FetchModuleDefinition<E,R>
```
- **Parameters**
  - **namespaced**: set Vuex module namespacing.
  - **endpoints**: a callback function which must return an object literal with API endpoints. The callback function accepts EndpointBuilder object as parameter.
      #### Important Types
      - **EndpointBuilder**: an object with create() method that allows you to write your API endpoints.
        ```
        type EndpointBuilder  = {
          create<ResultType,RequestArg>(definition: EndpointDefinition< ResultType, RequestArg>): EndpointDefinition<ResultType, RequestArg>;
        }
        ```
      - **Endpoints**: an object literal that contains API endpoint definitions.
        ```
        type Endpoints = Record<string, EndpointDefinition<any, any>>;
        ```
      - **EndpointDefinition**: describes how an API endpoint retrieves the data from the server. The first generic parameter defines the result type which requestFn() must return whereas the second generic parameter defines the type of the parameter which requestFn() accepts (if it has any).
        ```
        type EndpointDefinition<ResultType, RequestArg> = {
          requestFn(arg:RequestArg, dispatch: Dispatch): MaybePromise<ResultType>;
        }
        ```
- **Return value**
  - A Vuex module with the state, getters, mutations and actions for each API endpoint.
      #### Important Types
      - **FetchModuleDefinition**: defines a Vuex fetch module.
        ```
        type FetchModuleDefinition<E extends Endpoints, R> = {
            namespaced: boolean,
            state: FetchModuleState<E>,
            getters: FetchModuleGetters<E, R>,
            mutations: FetchModuleMutations<E>,
            actions: FetchModuleActions<E, R>
        }
        ``` 
      - **FetchModuleRequestState**: defines the state of each API endpoint request.
        ```
        type FetchModuleRequestState<E extends EndpointDefinition<any, any>> = {
          isLoading: boolean;
          hasError: boolean;
          error: any | null;
          data: ResultTypeFrom<E> | null;
        };
        ```


## Caveats
Please find below some of the quirky traits that come with the library implementation.
- the library will ignore the request if a previous request has not finished loading.
- only the dispatch object is passed down as argument to the action context (found in requestFn() method)

### The Noise with types
Given that Vuex is a weakly typed library you must still add the global store type. In saying that, you do not have to write the types for modules that you create with vuex-fetch-module library. Please find below an example of registering the todosModule in the global store.
  ```
    export interface RootState {
      todos: typeof todosModule.state;
    }

    const store = createStore<RootState>({
      modules: {
        todos: todosModule
      }
    })
  ```



## Feature requests
- caching: build a mechanism to fetch data from server only when it becomes invalid.