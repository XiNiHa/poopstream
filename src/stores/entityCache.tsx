import {
  createContext,
  onCleanup,
  onMount,
  useContext,
  type Component,
} from 'solid-js'
import { createStore, type Store } from 'solid-js/store'
import { createLocalStorage } from '@solid-primitives/storage'
import { deepmerge } from 'deepmerge-ts'
import * as JSONS from '@brillout/json-s'
import { useService } from './service'
import { isTruthy } from '../utils'
import type { Entity, EntityRef } from '../services'

export type EntityCacheContextState = Store<{
  cache: Record<string, Entity | null | Promise<Entity | null> | undefined>
}>
type EntityCacheContextActions = {
  get: (ref: EntityRef) => Entity | null | Promise<Entity | null>
  set: (ref: EntityRef, entity: Partial<Entity>, ttl?: number) => void
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

  const updateCache = (ref: EntityRef, val: Entity | undefined) => {
    setState('cache', getEntityId(ref), val)
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

  const set = (
    ref: EntityRef,
    entity: Partial<Entity> | null | Promise<Partial<Entity> | null>,
    ttl = 60000
  ) => {
    const merged = deepmerge(state.cache[getEntityId(ref)], entity)
    const cloned = JSONS.parse(JSONS.stringify(merged))
    // The actual thing I wanted was `structuredClone()`
    updateCache(ref, cloned as Entity)
    const timeout = setTimeout(() => {
      const newMerged = deepmerge(cloned, { expired: true })
      updateCache(ref, JSONS.parse(JSONS.stringify(newMerged)) as Entity)
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
