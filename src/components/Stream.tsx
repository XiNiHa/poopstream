import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  untrack,
  type Component,
} from 'solid-js'
import { useStream } from '../stores/stream'
import { useService } from '../stores/service'

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

interface Props {
  streamId: string
}

const PublicTimelines: Component<Props> = (props) => {
  const [serviceState] = useService()
  const [streamState, { loadItemsTop, loadItemsBottom }] = useStream()

  const [isTopItemVisible, setTopItem] = createItemWatcher('start')
  const [isBottomItemVisible, setBottomItem] = createItemWatcher('end')

  createEffect(() => {
    if (streamState.streams[props.streamId].entityRefs?.length === 0)
      loadItemsTop('home')
    if (isTopItemVisible()) loadItemsTop('home')
    if (isBottomItemVisible()) loadItemsBottom('home')
  })

  let timeout: number
  const [baseTime, setBaseTime] = createSignal(new Date())
  onMount(() => setInterval(() => setBaseTime(new Date()), 5000))
  onCleanup(() => clearInterval(timeout))

  return (
    <div id="timeline" m="x-auto" w="max-3xl">
      <For each={streamState.streams[props.streamId].entityRefs ?? []}>
        {(entityRef, i) => {
          const Comp = serviceState.services[entityRef.serviceId].entityComponents[entityRef.type]

          return (
            <Comp
              entityRef={entityRef}
              baseTime={baseTime()}
              onMount={(() => {
                switch (i()) {
                  case 0:
                    return (ref: HTMLElement) => setTopItem(ref ?? null)
                  case (streamState.streams[props.streamId].entityRefs
                    ?.length ?? 0) - 1:
                    return (ref: HTMLElement) => setBottomItem(ref ?? null)
                }
              })()}
            />
          )
        }}
      </For>
    </div>
  )
}

export default PublicTimelines
