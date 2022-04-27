import {
  createResource,
  Match,
  Show,
  Switch,
  type Component,
} from 'solid-js'
import { formatDistance } from 'date-fns'
import { EntityRef } from '../../services'
import { useEntityCache } from '../../stores/entityCache'

interface Props {
  entityRef: EntityRef
  baseTime?: Date
}

const Toot: Component<Props> = (props) => {
  const { get: getEntityCache } = useEntityCache()
  const [entity] = createResource(async () => getEntityCache(props.entityRef))

  return (
    <div
      id={`${props.entityRef.serviceId}-${props.entityRef.type}-${props.entityRef.id}`}
      flex="~ col"
      m="4"
      p="y-4 x-8"
      border="rounded"
      shadow="md"
    >
      <div flex="~ row" justify="between" items="center">
        <div flex="~ row" items="center">
          <img
            src={entity()?.inner.account.avatar}
            alt={`Avatar image of ${entity()?.inner.account.display_name}`}
            w="16"
            h="16"
            border="rounded-full"
          />
          <a href={entity()?.inner.account.url} flex="~ col" m="l-4">
            <Show when={entity()?.inner.account.display_name}>
              <span text="lg">{entity()?.inner.account.display_name}</span>
              <span text="base gray-400">@{entity()?.inner.account.acct}</span>
            </Show>
            <Show when={!entity()?.inner.account.display_name}>
              <a href={entity()?.inner.account.url} text="lg">
                @{entity()?.inner.account.acct}
              </a>
            </Show>
          </a>
        </div>
        <div flex="~ col" justify="end" text="right gray-500 space-nowrap">
          <span>
            <Switch>
              <Match when={entity()?.inner.visibility === 'public'}>
                Public
              </Match>
              <Match when={entity()?.inner.visibility === 'unlisted'}>
                Unlisted
              </Match>
              <Match when={entity()?.inner.visibility === 'private'}>
                Private
              </Match>
              <Match when={entity()?.inner.visibility === 'direct'}>
                Direct
              </Match>
            </Switch>
          </span>
          <span title={entity()?.createdAt.toLocaleString()}>
            {(() => {
              const e = entity()
              return (
                e && formatDistance(e.createdAt, props.baseTime ?? new Date())
              )
            })()}{' '}
            ago
          </span>
        </div>
      </div>
      {/* eslint-disable-next-line solid/no-innerhtml */}
      <div m="y-2" innerHTML={entity()?.inner.content} />
    </div>
  )
}

export default Toot
