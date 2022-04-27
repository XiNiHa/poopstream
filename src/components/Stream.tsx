import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  type Component,
} from 'solid-js'
import { useStream } from '../stores/stream'
import { useService } from '../stores/service'

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

interface Props {
  streamId: string
}

const PublicTimelines: Component<Props> = (props) => {
  const [serviceState] = useService()
  const [streamState, { loadItemsTop, loadItemsBottom }] = useStream()

  /* eslint-disable prefer-const */
  let topAnchor: HTMLDivElement | undefined = undefined
  let bottomAnchor: HTMLDivElement | undefined = undefined
  /* eslint-enable prefer-const */

  const [isTopItemVisible, setTopItem] = createItemWatcher()
  const [isBottomItemVisible, setBottomItem] = createItemWatcher()
  onMount(() => {
    if (topAnchor) setTopItem(topAnchor)
    if (bottomAnchor) setBottomItem(bottomAnchor)
  })

  createEffect(() => {
    if (streamState.streams[props.streamId].entityRefs?.length === 0) {
      loadItemsTop('home')
    }
    if (isTopItemVisible()) {
      loadItemsTop('home').then((ref) => setTimeout(() => {
        if (ref) {
          document
            .getElementById(`${ref.serviceId}-${ref.type}-${ref.id}`)
            ?.scrollIntoView({ block: 'start' })
        }
      }, 0))
    }
    if (isBottomItemVisible()) {
      loadItemsBottom('home').then((ref) => setTimeout(() => {
        if (ref) {
          document
            .getElementById(`${ref.serviceId}-${ref.type}-${ref.id}`)
            ?.scrollIntoView({ block: 'end' })
        }
      }, 0))
    }
  })

  let timeout: number
  const [baseTime, setBaseTime] = createSignal(new Date())
  onMount(() => setInterval(() => setBaseTime(new Date()), 5000))
  onCleanup(() => clearInterval(timeout))

  return (
    <div id="timeline" m="x-auto" w="max-3xl">
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

export default PublicTimelines
