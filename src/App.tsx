import { lazy, type Component } from 'solid-js'
import { Route, Router, Routes } from 'solid-app-router'
import { AuthProvider } from './stores/auth'
import Layout from './components/Layout'
import { StreamProvider } from './stores/stream'
import { ServiceProvider } from './stores/service'
import { EntityCacheProvider } from './stores/entityCache'

const Stream = lazy(() => import('./components/Stream'))

const App: Component = () => {
  return (
    <ServiceProvider>
      <EntityCacheProvider>
        <AuthProvider>
          <StreamProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route
                    path="/"
                    component={() => <h1 text="5xl red-500">Hello world!</h1>}
                  />
                  <Route
                    path="/public"
                    component={() => <Stream streamId="home" />}
                  />
                </Routes>
              </Layout>
            </Router>
          </StreamProvider>
        </AuthProvider>
      </EntityCacheProvider>
    </ServiceProvider>
  )
}

export default App
