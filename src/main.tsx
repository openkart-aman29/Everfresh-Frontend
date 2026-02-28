import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/store/Store'
import { MainRouter } from '@/router/MainRouter'
import { SSEProvider } from '@/features/global/sse/context/SSEContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SSEProvider>
          <MainRouter />
        </SSEProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
