import {
  createContext,
  onCleanup,
  onMount,
  useContext,
  type Component,
} from 'solid-js'
import { createStore, produce, reconcile, type Store } from 'solid-js/store'
import { createLocalStorage } from '@solid-primitives/storage'
import * as JSONS from '@brillout/json-s'
import { useService } from './service'
import { isTruthy } from '../utils'
import type { Entity, EntityRef } from '../services'

export type EntityCacheContextState = Store<{
  cache: Record<string, Entity | null | Promise<Entity | null> | undefined>
}>
type EntityCacheContextActions = {
  get: (ref: EntityRef) => Entity | null | Promise<Entity | null>
  set: (
    ref: EntityRef,
    entity: Entity | Promise<Entity | null>,
    ttl?: number
  ) => void
}
export type EntityCacheContextValue = EntityCacheContextActions

const defaultState = {
  cache: {},
}

const EntityCacheContext = createContext<EntityCacheContextValue>({
  get: () => null,
  set: () => undefined,
})

export const EntityCacheProvider: Component = (props) => {
  const timeouts = new Set<number>()
  const [serviceState] = useService()
  const [store, setStore] = createLocalStorage<unknown, unknown>({
    prefix: 'poopstream-EntityCacheProvider',
    serializer: (val) => JSONS.stringify(val),
    deserializer: (val) => JSONS.parse(val),
  })
  const [state, setState] = createStore<EntityCacheContextState>({
    ...defaultState,
  })

  const getEntityId = (ref: EntityRef) =>
    `${ref.serviceId}:${ref.type}:${ref.id}`

  const updateCache = (
    ref: EntityRef,
    val:
      | Entity
      | Promise<Entity | null>
      | ((s: Entity | null | Promise<Entity | null> | undefined) => void)
  ) => {
    if (typeof val === 'function') {
      setState(produce((s) => val(s.cache[getEntityId(ref)])))
    } else if ('then' in val) {
      setState('cache', getEntityId(ref), val)
    } else {
      setState('cache', getEntityId(ref), reconcile(val))
    }

    setStore(
      'cache',
      Object.fromEntries(
        Object.entries(state.cache)
          .map(([k, v]) => v && !('then' in v) && !v.expired && [k, v])
          .filter(isTruthy)
      )
    )
  }

  onMount(() => {
    const cache = store.cache as EntityCacheContextState['cache']
    if (cache) setState('cache', cache)
  })

  const set = async (
    ref: EntityRef,
    entity: Entity | Promise<Entity | null>,
    ttl = 60000
  ) => {
    updateCache(ref, entity)
    const timeout = setTimeout(() => {
      updateCache(ref, (s) => {
        if (s && !('then' in s)) {
          s.expired = true
        }
      })
      timeouts.delete(timeout)
    }, ttl)
    timeouts.add(timeout)
  }
  const get = (ref: EntityRef) => {
    const entity = state.cache[getEntityId(ref)]
    if (entity) return entity

    const resolver =
      serviceState.services[ref.serviceId]?.entityResolvers[ref.type]
    if (!resolver) return null

    const promise = (async () => {
      const result = await resolver(ref.id)
      if (result) set(ref, result)
      return result
    })()
    set(ref, promise)
    return promise
  }
  const actions: EntityCacheContextActions = { get, set }

  onCleanup(() => timeouts.forEach(clearTimeout))

  return (
    <EntityCacheContext.Provider value={actions}>
      {props.children}
    </EntityCacheContext.Provider>
  )
}

export const useEntityCache = () => useContext(EntityCacheContext)
