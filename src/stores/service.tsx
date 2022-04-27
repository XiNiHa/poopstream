import { createContext, useContext, type Component } from 'solid-js'
import { createStore, type Store } from 'solid-js/store'
import { Mastodon, MastodonServiceId } from '../services/mastodon'
import type { Service } from '../services'

export type ServiceContextState = Store<{
  services: Record<string, Service>
}>
type ServiceContextActions = {}
export type ServiceContextValue = [
  state: ServiceContextState,
  actions: ServiceContextActions
]

const defaultState = {
  services: {
    [MastodonServiceId]: Mastodon,
  },
}

const ServiceContext = createContext<ServiceContextValue>([
  defaultState,
  {
    setActiveAccount: () => undefined,
    clearActiveAccount: () => undefined,
  },
])

export const ServiceProvider: Component = (props) => {
  const [state, setState] = createStore<ServiceContextState>({
    ...defaultState,
  })

  const actions: ServiceContextActions = {}

  return (
    <ServiceContext.Provider value={[state, actions]}>
      {props.children}
    </ServiceContext.Provider>
  )
}

export const useService = () => useContext(ServiceContext)
