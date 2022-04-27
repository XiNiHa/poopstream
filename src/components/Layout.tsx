import { Link } from 'solid-app-router'
import { For, Show, type JSX, type Component, Suspense } from 'solid-js'
import { useAuth } from '../stores/auth'

const Layout: Component = (props) => {
  return (
    <div w="full" h="full" flex="~ col">
      <Header border="b gray-300" />
      <div flex="1 ~ row" overflow="hidden">
        <SideNav w="min-300px" border="r gray-300" p="4" />
        <main flex="1" overflow="y-auto" h="max-full">
          <Suspense
            fallback={
              <div flex="~" justify="center" items="center" h="full" text="2xl">
                Loading...
              </div>
            }
          >
            {props.children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}

const Header: Component<JSX.HTMLAttributes<HTMLElement>> = (props) => {
  const [authState, { setActiveAccount, clearActiveAccount }] = useAuth()

  return (
    <header
      p="x-8 y-4"
      flex="~ row"
      justify="between"
      align="items-center"
      bg="blue-100"
      {...props}
    >
      <h1 text="2xl">Poopstream</h1>
      <div flex="~ row" align="items-center">
        <span>Active account ID: {authState.activeAccountId ?? 'None'}</span>
        <Show when={authState.activeAccountId}>
          <button onClick={clearActiveAccount}>Log out</button>
        </Show>
      </div>
    </header>
  )
}

const SideNav: Component<JSX.HTMLAttributes<HTMLElement>> = (props) => {
  const links = {
    '/': 'Home',
    '/public': 'Public Timelines',
  }

  return (
    <nav {...props}>
      <ul flex="~ col">
        <For each={Object.keys(links)}>
          {(key) => (
            <li>
              <Link
                href={key}
                text="lg no-underline black"
                block="~"
                w="[fit-content]"
                m="y-1"
                p="1"
                transition="all duration-300"
                border="b transparent"
                hover:border="gray-500"
              >
                - {links[key as keyof typeof links]}
              </Link>
            </li>
          )}
        </For>
      </ul>
    </nav>
  )
}

export default Layout
