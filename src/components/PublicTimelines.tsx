import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  untrack,
  type Component,
} from 'solid-js'
import Toot from './common/Toot'
import { useStream } from '../stores/stream'
import { useEntityCache } from '../stores/entityCache'

const createItemWatcher = (block: ScrollLogicalPosition) => {
  const [prevItem, setPrevItem] = createSignal<HTMLElement | null>(null)
  const [item, setItem] = createSignal<HTMLElement | null>(null)
  const [isItemVisible, setVisible] = createSignal(false)
  const observer = new IntersectionObserver(
    ([entry]) => entry && setVisible(entry.isIntersecting),
    { threshold: 1 }
  )
  createEffect(() => {
    const el = item()
    const prevEl = untrack(prevItem)
    if (prevEl) observer.unobserve(prevEl)
    if (el?.id !== prevEl?.id) {
      if (el) observer.observe(el)
      if (prevEl) document.getElementById(prevEl.id)?.scrollIntoView({ block })
    }
  })
  createEffect(() => setPrevItem(item()))
  onCleanup(() => {
    const el = item()
    el && observer.unobserve(el)
  })
  return [isItemVisible, setItem] as const
}

const PublicTimelines: Component = () => {
  const [entityCache] = useEntityCache()
  const [streamState, { loadItemsTop, loadItemsBottom }] = useStream()

  const [isTopItemVisible, setTopItem] = createItemWatcher('start')
  const [isBottomItemVisible, setBottomItem] = createItemWatcher('end')

  createEffect(() => {
    if (streamState.streams.home.entityRefs?.length === 0) loadItemsTop('home')
    if (isTopItemVisible()) loadItemsTop('home')
    if (isBottomItemVisible()) loadItemsBottom('home')
  })

  let timeout: number
  const [baseTime, setBaseTime] = createSignal(new Date())
  onMount(() => setInterval(() => setBaseTime(new Date()), 5000))
  onCleanup(() => clearInterval(timeout))

  return (
    <div id="timeline" m="x-auto" w="max-3xl">
      <For each={streamState.streams.home.entityRefs ?? []}>
        {(entity, i) => (
          <Toot
            entity={entityCache.cache[entity.id]}
            baseTime={baseTime()}
            onMount={(() => {
              switch (i()) {
                case 0:
                  return (ref) => setTopItem(ref ?? null)
                case (streamState.streams.home.entityRefs?.length ?? 0) - 1:
                  return (ref) => setBottomItem(ref ?? null)
              }
            })()}
          />
        )}
      </For>
    </div>
  )
}

export default PublicTimelines
