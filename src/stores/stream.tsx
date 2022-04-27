import { createLocalStorage } from '@solid-primitives/storage'
import {
  createContext,
  createSignal,
  onMount,
  useContext,
  type Component,
} from 'solid-js'
import * as JSONS from '@brillout/json-s'
import { MastodonServiceId } from '../services/mastodon'
import type { Entity } from '../services'
import { useService } from './service'
import { isTruthy } from '../utils'
import { createStore, Store } from 'solid-js/store'

const MAX_STREAM_ITEM_COUNT = 200
const STREAM_LOAD_COUNT_PER_SOURCE = 10

export type StreamContextState = Store<{
  streams: Record<
    string,
    {
      sources: {
        serviceId: string
        streamSourceId: string
      }[]
      entities: Entity[] | null
    }
  >
}>
type StreamContextActions = {
  loadItemsTop: (streamId: string, force?: boolean) => Promise<Entity | null>
  loadItemsBottom: (streamId: string) => Promise<Entity | null>
}
export type StreamContextValue = [
  state: StreamContextState,
  actions: StreamContextActions
]

const defaultState = {
  streams: {
    home: {
      sources: [
        {
          serviceId: MastodonServiceId,
          streamSourceId: 'publicTimeline',
        },
      ],
      entities: null,
    },
  },
}

const StreamContext = createContext<StreamContextValue>([
  defaultState,
  {
    loadItemsTop: () => Promise.resolve(null),
    loadItemsBottom: () => Promise.resolve(null),
  },
])

function getCursorForService(
  serviceId: string,
  entities: readonly Entity[] | null,
  direction: 'before' | 'after'
): string | null {
  if (!entities) return null
  const filtered = entities.filter((entity) => entity.serviceId === serviceId)
  switch (direction) {
    case 'before':
      return filtered.length ?? 0 > 0 ? filtered[0].id : null
    case 'after':
      return filtered.length ?? 0 > 0 ? filtered[filtered.length - 1].id : null
  }
}

export const StreamProvider: Component = (props) => {
  const [store, setStore] = createLocalStorage<unknown, unknown>({
    prefix: 'poopstream-StreamProvider',
    serializer: (val) => JSONS.stringify(val),
    deserializer: (val) => JSONS.parse(val),
  })
  const [state, setState] = createStore<StreamContextState>({
    ...defaultState,
    ...(store.streams as StreamContextState['streams']),
  })
  onMount(() => {
    const streams = store.streams as StreamContextState['streams']
    setState(
      'streams',
      streams ??
        Object.fromEntries(
          Object.entries(state.streams).map(([k, v]) => [
            k,
            { ...v, entities: [] },
          ])
        )
    )
  })
  const [serviceState] = useService()
  const [lock, setLock] = createSignal(false)
  const [reachedTop, setReachedTop] = createSignal(false)
  let reachedTopResetTimeout: number

  const actions: StreamContextActions = {
    // eslint-disable-next-line solid/reactivity
    loadItemsTop: async (streamId, force) => {
      if (lock()) return null
      if (reachedTop() && !force) return null
      setLock(true)
      console.log('loadItemsTop')
      const stream = state.streams[streamId]
      const results = await Promise.allSettled(
        stream.sources.map((source) => {
          const beforeCursor = getCursorForService(
            source.serviceId,
            stream.entities,
            'before'
          )
          return serviceState.services[source.serviceId].streamSources[
            source.streamSourceId
          ].getEntitiesBefore(beforeCursor, STREAM_LOAD_COUNT_PER_SOURCE)
        })
      )
      const entities = results
        .map((result) => (result.status === 'fulfilled' ? result.value : null))
        .filter(isTruthy)
        .flat()

      entities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      if (reachedTopResetTimeout) clearTimeout(reachedTopResetTimeout)
      setReachedTop(entities.length === 0)
      reachedTopResetTimeout = setTimeout(() => setReachedTop(false), 10000)

      const newEntities = [
        ...entities,
        ...(stream.entities?.slice(
          0,
          Math.min(
            stream.entities.length,
            stream.entities.length -
              (stream.entities.length + entities.length - MAX_STREAM_ITEM_COUNT)
          )
        ) ?? []),
      ]
      setState('streams', streamId, 'entities', newEntities)
      setStore('streams', state.streams)

      setTimeout(() => setLock(false), 1000)
      return newEntities[0] ?? null
    },
    // eslint-disable-next-line solid/reactivity
    loadItemsBottom: async (streamId) => {
      if (lock()) return null
      setLock(true)
      console.log('loadItemsBottom')
      const stream = state.streams[streamId]
      const results = await Promise.allSettled(
        stream.sources.map((source) => {
          const afterCursor = getCursorForService(
            source.serviceId,
            stream.entities,
            'after'
          )
          return serviceState.services[source.serviceId].streamSources[
            source.streamSourceId
          ].getEntitiesAfter(afterCursor, STREAM_LOAD_COUNT_PER_SOURCE)
        })
      )
      const entities = results
        .map((result) => (result.status === 'fulfilled' ? result.value : null))
        .filter(isTruthy)
        .flat()

      entities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      const frontSlice = Math.max(
        0,
        (stream.entities?.length ?? 0) + entities.length - MAX_STREAM_ITEM_COUNT
      )

      const newEntities = [
        ...(stream.entities?.slice(frontSlice) ?? []),
        ...entities,
      ]
      setState('streams', streamId, 'entities', newEntities)
      setStore('streams', state.streams)

      if (frontSlice !== 0) setReachedTop(false)
      setTimeout(() => setLock(false), 1000)
      return newEntities[newEntities.length - 1] ?? null
    },
  }

  return (
    <StreamContext.Provider value={[state, actions]}>
      {props.children}
    </StreamContext.Provider>
  )
}

export const useStream = () => useContext(StreamContext)
