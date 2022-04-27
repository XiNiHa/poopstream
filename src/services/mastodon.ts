import { Entity, Service } from '.'
import Toot from '../components/common/Toot'
import type { DeepReadonly } from '../utils'
import type { GetV1TimelinesPublicResult, Status } from '../types/mastodon'

export interface TootEntity extends Entity {
  inner: DeepReadonly<Status>
}

export const toTootEntity = (status: Status): TootEntity => ({
  id: status.id,
  serviceId: MastodonServiceId,
  type: 'toot',
  createdAt: new Date(status.created_at),
  inner: status,
})

export const MastodonServiceId = 'mastodon'

export const Mastodon: Service = {
  name: 'Mastodon',
  identifier: MastodonServiceId,
  entityComponents: {
    toot: Toot,
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
