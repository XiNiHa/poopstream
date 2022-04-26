import { Match, onMount, Show, Switch, type Component } from 'solid-js'
import type * as Mastodon from '../../types/mastodon'

type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}

interface Props {
  status: DeepReadonly<Mastodon.Status>
  onMount?: (ref: HTMLElement | undefined) => void
}

const Status: Component<Props> = (props) => {
  // eslint-disable-next-line prefer-const
  let ref: HTMLDivElement | undefined = undefined
  onMount(() => props.onMount && props.onMount(ref))

  let today = new Date()
  today = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayFormat = Intl.DateTimeFormat(undefined, { timeStyle: 'short' })
  const dateFormat = Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  })

  return (
    <div
      ref={ref}
      id={`mastodon-status-${props.status.id}`}
      flex="~ col"
      m="4"
      p="y-4 x-8"
      border="rounded"
      shadow="md"
    >
      <div flex="~ row" justify="between" items="center">
        <div flex="~ row" items="center">
          <img
            src={props.status.account.avatar}
            alt={`Avatar image of ${props.status.account.display_name}`}
            w="16"
            h="16"
            border="rounded-full"
          />
          <a href={props.status.account.url} flex="~ col" m="l-4">
            <Show when={props.status.account.display_name}>
              <span text="lg">{props.status.account.display_name}</span>
              <span text="base gray-400">@{props.status.account.username}</span>
            </Show>
            <Show when={!props.status.account.display_name}>
              <a href={props.status.account.url} text="lg">
                @{props.status.account.username}
              </a>
            </Show>
          </a>
        </div>
        <div flex="~ col" justify="end" text="right gray-500 space-nowrap">
          <span>
            <Switch>
              <Match when={props.status.visibility === 'public'}>Public</Match>
              <Match when={props.status.visibility === 'unlisted'}>
                Unlisted
              </Match>
              <Match when={props.status.visibility === 'private'}>
                Private
              </Match>
              <Match when={props.status.visibility === 'direct'}>Direct</Match>
            </Switch>
          </span>
          <span>
            {(() => {
              const date = new Date(props.status.created_at)
              const day = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
              )
              return (
                day.getTime() === today.getTime() ? todayFormat : dateFormat
              ).format()
            })()}
          </span>
        </div>
      </div>
      {/* eslint-disable-next-line solid/no-innerhtml */}
      <div m="y-2" innerHTML={props.status.content} />
    </div>
  )
}

export default Status
