import type { Component } from 'solid-js'

export interface Service {
  name: string
  identifier: string
  entityComponents: Record<
    string,
    Component<{ entityRef: EntityRef } & Record<string, unknown>>
  >
  entityResolvers: Record<
    string,
    ((id: string) => Entity | null | Promise<Entity | null>) | undefined
  >
  streamSources: Record<string, StreamSource>
}

export interface Entity {
  id: string
  serviceId: string
  type: string
  expired: boolean

  createdAt: Date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inner: any
}

export interface EntityRef {
  readonly serviceId: string
  readonly type: string
  readonly id: string
}

export interface StreamSource {
  id: string
  name: string
  getEntitiesAfter: (cursor: string | null, count: number) => Promise<Entity[]>
  getEntitiesBefore: (cursor: string | null, count: number) => Promise<Entity[]>
}
