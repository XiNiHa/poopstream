import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  untrack,
  type Component,
} from 'solid-js'
import Status from './common/Status'
import { useStream } from '../stores/stream'

const createItemWatcher = (block: ScrollLogicalPosition) => {
  const [prevItem, setPrevItem] = createSignal<HTMLElement | null>(
    null
  )
  const [item, setItem] = createSignal<HTMLElement | null>(null)
  const [isItemVisible, setVisible] = createSignal(false)
  const observer = new IntersectionObserver(
    ([entry]) => entry && setVisible(entry.isIntersecting),
    { threshold: 1 }
  )
  createEffect(() => {
    const el = item()
    const prevEl = untrack(prevItem)
    if (el !== prevEl) {
      if (el) observer.observe(el)
      if (prevEl) {
        observer.unobserve(prevEl)
        document.getElementById(prevEl.id)?.scrollIntoView({ block })
      }
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
  const [streamState, { loadItemsTop, loadItemsBottom }] = useStream()

  const [isTopItemVisible, setTopItem] = createItemWatcher('start')
  const [isBottomItemVisible, setBottomItem] = createItemWatcher('end')

  createEffect(() => {
    if (!streamState.items?.length) loadItemsTop()
    if (isTopItemVisible()) loadItemsTop()
    if (isBottomItemVisible()) loadItemsBottom()
  })

  return (
    <div id="timeline" m="x-auto" w="max-3xl">
      <For each={streamState.items ?? []}>
        {(status, i) => (
          <Status
            status={status}
            onMount={
              (() => {
                switch (i()) {
                  case 0:
                    return (ref) => setTopItem(ref ?? null)
                  case (streamState.items?.length ?? 0) - 1:
                    return (ref) => setBottomItem(ref ?? null)
                }
              })()
            }
          />
        )}
      </For>
    </div>
  )
}

export default PublicTimelines
