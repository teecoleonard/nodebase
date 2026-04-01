import {
    defaultShouldDehydrateQuery,
    QueryClient,
  } from '@tanstack/react-query';
  // import superjson from 'superjson';
  export function makeQueryClient() {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minuto - dados permanecem frescos
          gcTime: 5 * 60 * 1000, // 5 minutos - tempo de garbage collection
          refetchOnWindowFocus: false, // Não refaz query ao focar janela
          refetchOnMount: false, // Não refaz query ao montar componente se dados estão frescos
          retry: 1, // Apenas 1 tentativa em caso de erro
        },
        dehydrate: {
          // serializeData: superjson.serialize,
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) ||
            query.state.status === 'pending',
        },
        hydrate: {
          // deserializeData: superjson.deserialize,
        },
      },
    });
  }