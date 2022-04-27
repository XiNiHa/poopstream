import type { Entity, Service } from '.'
import type { DeepReadonly } from '../utils'
import type {
  GetV1StatusesIdResult,
  GetV1TimelinesPublicResult,
  Status,
} from '../types/mastodon'
import { lazy } from 'solid-js'

export interface TootEntity extends Entity {
  inner: DeepReadonly<Status>
}

export const toTootEntity = (status: Status): TootEntity => ({
  id: status.id,
  serviceId: MastodonServiceId,
  type: 'toot',
  expired: false,
  createdAt: new Date(status.created_at),
  inner: status,
})

export const MastodonServiceId = 'mastodon'

export const Mastodon: Service = {
  name: 'Mastodon',
  identifier: MastodonServiceId,
  entityComponents: {
    toot: lazy(() => import('../components/mastodon/Toot')),
  },
  entityResolvers: {
    toot: async (id: string) => {
      try {
        const status = await fetch(`https://twingyeo.kr/api/v1/statuses/${id}`)
        const data: GetV1StatusesIdResult = await status.json()
        return toTootEntity(data)
      } catch {
        return null
      }
    },
  },
  streamSources: {
    publicTimeline: {
      id: 'publicTimeline',
      name: 'Public Timeline',
      getEntitiesAfter: async (
        max_id: string | null,
        limit: number
      ): Promise<TootEntity[]> => {
        const params = new URLSearchParams({
          ...(max_id && { max_id }),
          limit: limit.toFixed(0),
        })
        const statuses: GetV1TimelinesPublicResult = await fetch(
          `https://twingyeo.kr/api/v1/timelines/public?${params}`
        ).then((res) => res.json())

        return statuses.map(toTootEntity)
      },
      getEntitiesBefore: async (
        min_id: string | null,
        limit: number
      ): Promise<TootEntity[]> => {
        const params = new URLSearchParams({
          ...(min_id && { min_id }),
          limit: limit.toFixed(0),
        })
        const statuses: GetV1TimelinesPublicResult = await fetch(
          `https://twingyeo.kr/api/v1/timelines/public?${params}`
        ).then((res) => res.json())

        return statuses.map(toTootEntity)
      },
    },
  },
}
