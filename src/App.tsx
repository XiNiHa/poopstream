import { lazy, type Component } from 'solid-js'
import { Route, Router, Routes } from 'solid-app-router'
import { AuthProvider } from './stores/auth'
import Layout from './components/Layout'
import { StreamProvider } from './stores/stream'

const PublicTimelines = lazy(() => import('./components/PublicTimelines'))

const App: Component = () => {
  return (
    <AuthProvider>
      <StreamProvider>
        <Router>
          <Layout>
            <Routes>
              <Route
                path="/"
                component={() => <h1 text="5xl red-500">Hello world!</h1>}
              />
              <Route path="/public" component={PublicTimelines} />
            </Routes>
          </Layout>
        </Router>
      </StreamProvider>
    </AuthProvider>
  )
}

export default App
