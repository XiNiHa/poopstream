import { createContext, useContext, type Component } from 'solid-js'
import { createStore, type Store } from 'solid-js/store'

export type AuthContextState = Store<{
  activeAccountId: string | null
}>
type AuthContextActions = {
  setActiveAccount: (id: string) => void
  clearActiveAccount: () => void
}
export type AuthContextValue = [
  state: AuthContextState,
  actions: AuthContextActions
]

const defaultState = {
  activeAccountId: null,
}

const AuthContext = createContext<AuthContextValue>([
  defaultState,
  {
    setActiveAccount: () => undefined,
    clearActiveAccount: () => undefined,
  },
])

export const AuthProvider: Component = (props) => {
  const [state, setState] = createStore<AuthContextState>({
    ...defaultState,
  })

  const actions: AuthContextActions = {
    setActiveAccount: (id: string) => setState('activeAccountId', id),
    clearActiveAccount: () => setState({ activeAccountId: null }),
  }

  return (
    <AuthContext.Provider value={[state, actions]}>
      {props.children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
