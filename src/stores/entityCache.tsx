import { createContext, onMount, useContext, type Component } from 'solid-js'
import { createStore, type Store } from 'solid-js/store'
import { deepmerge } from 'deepmerge-ts'
import { createLocalStorage } from '@solid-primitives/storage'
import * as JSONS from '@brillout/json-s'
import { Entity } from '../services'

export type EntityCacheContextState = Store<{
  cache: Record<string, Entity>
}>
type EntityCacheContextActions = {
  set: (id: string, entity: Partial<Entity>) => void
}
export type EntityCacheContextValue = [
  state: EntityCacheContextState,
  actions: EntityCacheContextActions
]

const defaultState = {
  cache: {},
}

const EntityCacheContext = createContext<EntityCacheContextValue>([
  defaultState,
  { set: () => undefined },
])

export const EntityCacheProvider: Component = (props) => {
  const [store, setStore] = createLocalStorage<unknown, unknown>({
    prefix: 'poopstream-EntityCacheProvider',
    serializer: (val) => JSONS.stringify(val),
    deserializer: (val) => JSONS.parse(val),
  })
  const [state, setState] = createStore<EntityCacheContextState>({
    ...defaultState,
  })

  onMount(() => {
    const cache = store.cache as EntityCacheContextState['cache']
    if (cache) setState('cache', cache)
  })

  const actions: EntityCacheContextActions = {
    // eslint-disable-next-line solid/reactivity
    set: (id, entity) => {
      const merged = deepmerge(state.cache[id], entity)
      // The actual thing I wanted was `structuredClone()`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setState('cache', id, JSONS.parse(JSONS.stringify(merged)) as any)
      setStore('cache', state.cache)
    },
  }

  return (
    <EntityCacheContext.Provider value={[state, actions]}>
      {props.children}
    </EntityCacheContext.Provider>
  )
}

export const useEntityCache = () => useContext(EntityCacheContext)
