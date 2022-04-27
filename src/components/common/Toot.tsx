import { Match, onMount, Show, Switch, type Component } from 'solid-js'
import { formatDistance } from 'date-fns'
import { TootEntity } from '../../services/mastodon'

interface Props {
  entity: TootEntity
  baseTime?: Date
  onMount?: (ref: HTMLElement | undefined) => void
}

const Toot: Component<Props> = (props) => {
  // eslint-disable-next-line prefer-const
  let ref: HTMLDivElement | undefined = undefined
  onMount(() => props.onMount && props.onMount(ref))

  return (
    <div
      ref={ref}
      id={`mastodon-toot-${props.entity.id}`}
      flex="~ col"
      m="4"
      p="y-4 x-8"
      border="rounded"
      shadow="md"
    >
      <div flex="~ row" justify="between" items="center">
        <div flex="~ row" items="center">
          <img
            src={props.entity.inner.account.avatar}
            alt={`Avatar image of ${props.entity.inner.account.display_name}`}
            w="16"
            h="16"
            border="rounded-full"
          />
          <a href={props.entity.inner.account.url} flex="~ col" m="l-4">
            <Show when={props.entity.inner.account.display_name}>
              <span text="lg">{props.entity.inner.account.display_name}</span>
              <span text="base gray-400">
                @{props.entity.inner.account.username}
              </span>
            </Show>
            <Show when={!props.entity.inner.account.display_name}>
              <a href={props.entity.inner.account.url} text="lg">
                @{props.entity.inner.account.username}
              </a>
            </Show>
          </a>
        </div>
        <div flex="~ col" justify="end" text="right gray-500 space-nowrap">
          <span>
            <Switch>
              <Match when={props.entity.inner.visibility === 'public'}>
                Public
              </Match>
              <Match when={props.entity.inner.visibility === 'unlisted'}>
                Unlisted
              </Match>
              <Match when={props.entity.inner.visibility === 'private'}>
                Private
              </Match>
              <Match when={props.entity.inner.visibility === 'direct'}>
                Direct
              </Match>
            </Switch>
          </span>
          <span title={props.entity.createdAt.toLocaleString()}>
            {formatDistance(
              props.entity.createdAt,
              props.baseTime ?? new Date()
            )}{' '}
            ago
          </span>
        </div>
      </div>
      {/* eslint-disable-next-line solid/no-innerhtml */}
      <div m="y-2" innerHTML={props.entity.inner.content} />
    </div>
  )
}

export default Toot
