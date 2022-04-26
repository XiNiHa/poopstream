import { createLocalStorage } from '@solid-primitives/storage'
import {
  createContext,
  createSignal,
  useContext,
  type Component,
} from 'solid-js'
import { GetV1TimelinesPublicResult } from '../types/mastodon'
import type { StreamItem } from '../types/stream'

const MAX_STREAM_ITEM_COUNT = 200

export type StreamContextState = {
  items: StreamItem[] | null
}
type StreamContextActions = {
  loadItemsTop: (force?: boolean) => Promise<string | null>
  loadItemsBottom: () => Promise<string | null>
}
export type StreamContextValue = [
  state: StreamContextState,
  actions: StreamContextActions
]

const defaultState = {
  items: [],
}

const StreamContext = createContext<StreamContextValue>([
  defaultState,
  {
    loadItemsTop: () => Promise.resolve(null),
    loadItemsBottom: () => Promise.resolve(null),
  },
])

export const StreamProvider: Component = (props) => {
  const [_store, setStore] = createLocalStorage<unknown, unknown>({
    prefix: 'poopstream-StreamProvider',
    serializer: (val) => JSON.stringify(val),
    deserializer: (val) => JSON.parse(val),
  })
  const [lock, setLock] = createSignal(false)
  const [reachedTop, setReachedTop] = createSignal(false)

  const state = _store as StreamContextState

  const actions: StreamContextActions = {
    // eslint-disable-next-line solid/reactivity
    loadItemsTop: async (force) => {
      if (lock()) return null
      if (reachedTop() && !force) return null
      setLock(true)
      console.log('loadItemsTop')
      const since_id = state.items?.length ?? 0 > 0 ? state.items?.[0].id : null
      const params = new URLSearchParams({
        ...(since_id && { since_id }),
        limit: '20',
      })
      const statuses: GetV1TimelinesPublicResult = await fetch(
        `https://twingyeo.kr/api/v1/timelines/public?${params}`
      ).then((res) => res.json())

      setReachedTop(statuses.length < 20)
      setStore('items', [
        ...statuses,
        ...(state.items?.slice(
          0,
          Math.min(
            state.items.length,
            state.items.length -
              (state.items.length + statuses.length - MAX_STREAM_ITEM_COUNT)
          )
        ) ?? []),
      ])
      setTimeout(() => setLock(false), 1000)
      return since_id ?? null
    },
    // eslint-disable-next-line solid/reactivity
    loadItemsBottom: async () => {
      if (lock()) return null
      setLock(true)
      console.log('loadItemsBottom')
      const max_id =
        state.items?.length ?? 0 > 0
          ? state.items?.[state.items.length - 1].id
          : null
      const params = new URLSearchParams({
        ...(max_id && { max_id }),
        limit: '20',
      })
      const statuses: GetV1TimelinesPublicResult = await fetch(
        `https://twingyeo.kr/api/v1/timelines/public?${params}`
      ).then((res) => res.json())

      const frontSlice = Math.max(
        0,
        (state.items?.length ?? 0) + statuses.length - MAX_STREAM_ITEM_COUNT
      )

      setStore('items', [
        ...(state.items?.slice(frontSlice) ?? []),
        ...statuses,
      ])
      if (frontSlice !== 0) setReachedTop(false)
      setTimeout(() => setLock(false), 1000)
      return max_id ?? null
    },
  }

  return (
    <StreamContext.Provider value={[state, actions]}>
      {props.children}
    </StreamContext.Provider>
  )
}

export const useStream = () => useContext(StreamContext)
