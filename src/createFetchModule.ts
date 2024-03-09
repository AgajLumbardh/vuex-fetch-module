import type { ActionTree, Dispatch, GetterTree, MutationTree } from 'vuex';

type MaybePromise<T> = T | PromiseLike<T>;

type ResultTypeFrom<E extends EndpointDefinition<any, any>> = E extends EndpointDefinition<infer RT, any>
  ? RT
  : unknown;

export type EndpointDefinition<ResultType, RequestArg> = {
  requestFn(arg: RequestArg extends void ? Dispatch : RequestArg, dispatch: Dispatch): MaybePromise<ResultType>;
};

export type Endpoints = Record<string, EndpointDefinition<any, any>>;

type FetchModuleRequestState<E extends EndpointDefinition<any, any>> = {
  isLoading: boolean;
  hasError: boolean;
  error: any | null;
  data: ResultTypeFrom<E> | null;
};

type EndpointBuilder = {
  create<ResultType, RequestArg>(
    definition: EndpointDefinition<ResultType, RequestArg>,
  ): EndpointDefinition<ResultType, RequestArg>;
};

type FetchModuleState<E extends Endpoints> = {
  [K in keyof E]: FetchModuleRequestState<Extract<E[K], EndpointDefinition<any, any>>>;
};

type FetchModuleGetters<E extends Endpoints, R> = GetterTree<FetchModuleState<E>, R>;

type FetchModuleMutations<E extends Endpoints> = MutationTree<FetchModuleState<E>>;

type FetchModuleActions<E extends Endpoints, R> = ActionTree<FetchModuleState<E>, R>;

export type FetchModuleDefinition<E extends Endpoints, R> = {
  namespaced: boolean;
  state: FetchModuleState<E>;
  getters: FetchModuleGetters<E, R>;
  mutations: FetchModuleMutations<E>;
  actions: FetchModuleActions<E, R>;
};

export type CreateFetchModuleOptions<Definitions extends Endpoints> = {
  endpoints: (build: EndpointBuilder) => Definitions;
  namespaced?: boolean;
};

export class EndpointBuilderImpl implements EndpointBuilder {
  create<ResultType, RequestArg>(
    definition: EndpointDefinition<ResultType, RequestArg>,
  ): EndpointDefinition<ResultType, RequestArg> {
    return definition;
  }
}

function buildState<E extends Endpoints>(endpoints: E): FetchModuleState<E> {
  const state: any = {};
  Object.keys(endpoints).forEach((name) => {
    state[name] = {
      isLoading: false,
      hasError: false,
      error: null,
      data: null,
    };
  });

  return state as FetchModuleState<E>;
}

function buildGetters<E extends Endpoints, R>(endpoints: E): GetterTree<FetchModuleState<Endpoints>, R> {
  const getters: any = {};
  Object.keys(endpoints).forEach((name) => {
    getters[name] = (state: FetchModuleState<Endpoints>) => ({
      isLoading: state[name]?.isLoading,
      hasError: state[name]?.hasError,
      error: state[name]?.error,
      data: state[name]?.data,
    });
  });

  return getters as GetterTree<FetchModuleState<Endpoints>, R>;
}

function buildMutations<E extends Endpoints>(endpoints: E): MutationTree<FetchModuleState<E>> {
  const mutations: any = {};
  Object.keys(endpoints).forEach((name) => {
    mutations[`${name}Init`] = (state: FetchModuleState<Endpoints>) => {
      state[name] = {
        isLoading: true,
        hasError: false,
        error: null,
        data: null,
      };
    };
    mutations[`${name}Success`] = (state: FetchModuleState<Endpoints>, payload: any) => {
      state[name] = {
        isLoading: false,
        hasError: false,
        error: null,
        data: payload,
      };
    };
    mutations[`${name}Error`] = (state: FetchModuleState<Endpoints>, payload: any) => {
      state[name] = {
        isLoading: false,
        hasError: true,
        error: payload,
        data: null,
      };
    };
  });

  return mutations as MutationTree<FetchModuleState<E>>;
}

function buildActions<E extends Endpoints, R>(endpoints: E): ActionTree<FetchModuleState<E>, R> {
  const actions: any = {};
  Object.keys(endpoints).forEach((name) => {
    actions[name] = async (
      { dispatch, commit, state }: { dispatch: any; commit: any; state: FetchModuleState<E> },
      params: any,
    ) => {
      if (state[name]?.isLoading) {
        return;
      }
      commit(`${name}Init`);
      try {
        const data = await endpoints[name]?.requestFn(params ?? dispatch, params !== undefined || params !== null ? dispatch : undefined);
        commit(`${name}Success`, data);
      } catch (error: any) {
        console.error(error);
        commit(`${name}Error`, error?.message ?? error);
      }
    };
  });

  return actions as ActionTree<FetchModuleState<E>, R>;
}

export function createFetchModule<E extends Endpoints, R>({
  endpoints,
  namespaced = true,
}: CreateFetchModuleOptions<E>): FetchModuleDefinition<E, R> {
  const definitions = endpoints(new EndpointBuilderImpl());
  const result = {
    namespaced,
    state: buildState(definitions),
    getters: buildGetters<E, R>(definitions),
    mutations: buildMutations(definitions),
    actions: buildActions<E, R>(definitions),
  };

  return result;
}
