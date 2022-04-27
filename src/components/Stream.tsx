import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  type Component,
} from 'solid-js'
import { createLocalStorage } from '@solid-primitives/storage'
import * as JSONS from '@brillout/json-s'
import { createLiveValue } from '../utils'
import { useStream } from '../stores/stream'
import { useService } from '../stores/service'
import type { EntityRef } from '../services'

const createItemWatcher = () => {
  const [item, setItem] = createSignal<HTMLElement | null>(null)
  const [isItemVisible, setVisible] = createSignal(false)
  const observer = new IntersectionObserver(
    ([entry]) => entry && setVisible(entry.isIntersecting),
    { threshold: 1 }
  )
  createEffect(() => {
    const el = item()
    if (el) observer.observe(el)
  })
  onCleanup(() => {
    const el = item()
    if (el) observer.unobserve(el)
  })
  return [isItemVisible, setItem] as const
}

const createScrollManager = (props: {
  container: () => HTMLDivElement | undefined
  topAnchor: () => HTMLDivElement | undefined
  bottomAnchor: () => HTMLDivElement | undefined
  onTopReached?: () => void
  onBottomReached?: () => void
}) => {
  const [store, setStore] = createLocalStorage<unknown, unknown>({
    prefix: 'poopstream-Stream-createScrollManager',
    serializer: (val) => JSONS.stringify(val),
    deserializer: (val) => JSONS.parse(val),
  })
  const [lock, setLock] = createSignal(true)
  const [isTopItemVisible, setTopItem] = createItemWatcher()
  const [isBottomItemVisible, setBottomItem] = createItemWatcher()

  onMount(() => {
    const topAnchor = props.topAnchor()
    const bottomAnchor = props.bottomAnchor()
    if (topAnchor) setTopItem(topAnchor)
    if (bottomAnchor) setBottomItem(bottomAnchor)
  })
  createEffect(() => {
    if (isTopItemVisible() && !lock()) props.onTopReached?.()
    if (isBottomItemVisible() && !lock()) props.onBottomReached?.()
  })

  createEffect(() => {
    if (store.scrollTop) {
      setLock(false)
      props
        .container()
        ?.parentElement?.scrollTo({ top: store.scrollTop as number })
    }
  })
  onMount(() => setTimeout(() => setLock(false), 2000))
  window.addEventListener('beforeunload', () => {
    const scroll = props.container()?.parentElement
    if (scroll) setStore('scrollTop', scroll.scrollTop)
  })

  const actions = {
    scrollToEntity: (ref: EntityRef, block: ScrollLogicalPosition) => {
      document
        .getElementById(`${ref.serviceId}-${ref.type}-${ref.id}`)
        ?.scrollIntoView({ block })
    },
  }

  return actions
}

interface Props {
  streamId: string
}

const Stream: Component<Props> = (props) => {
  const [serviceState] = useService()
  const [streamState, { loadItemsTop, loadItemsBottom }] = useStream()

  createEffect(() => {
    if (streamState.streams[props.streamId].entityRefs?.length === 0) {
      loadItemsTop('home')
    }
  })

  /* eslint-disable prefer-const */
  let container: HTMLDivElement | undefined = undefined
  let topAnchor: HTMLDivElement | undefined = undefined
  let bottomAnchor: HTMLDivElement | undefined = undefined
  /* eslint-enable prefer-const */

  const { scrollToEntity } = createScrollManager({
    container: () => container,
    topAnchor: () => topAnchor,
    bottomAnchor: () => bottomAnchor,
    onTopReached: () =>
      loadItemsTop('home').then((ref) =>
        setTimeout(() => ref && scrollToEntity(ref, 'start'), 0)
      ),
    onBottomReached: () =>
      loadItemsBottom('home').then((ref) =>
        setTimeout(() => ref && scrollToEntity(ref, 'end'), 0)
      ),
  })

  const baseTime = createLiveValue(() => new Date(), 5000)

  return (
    <div ref={container} m="x-auto" w="max-3xl">
      <div ref={topAnchor} w="full" />
      <For each={streamState.streams[props.streamId].entityRefs ?? []}>
        {(entityRef) => {
          const Comp =
            serviceState.services[entityRef.serviceId]?.entityComponents[
              entityRef.type
            ]

          return Comp && <Comp entityRef={entityRef} baseTime={baseTime()} />
        }}
      </For>
      <div ref={bottomAnchor} w="full" />
    </div>
  )
}

export default Stream
