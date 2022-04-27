import type { Component } from 'solid-js'

export interface Service {
  name: string
  identifier: string
  entityComponents: Record<string, Component<{ entity: Entity }>>
  streamSources: Record<string, StreamSource>
}

export interface Entity {
  id: string
  serviceId: string
  type: string
  createdAt: Date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inner: any
}

export interface StreamSource {
  id: string
  name: string
  getEntitiesAfter: (cursor: string | null, count: number) => Promise<Entity[]>
  getEntitiesBefore: (cursor: string | null, count: number) => Promise<Entity[]>
}
