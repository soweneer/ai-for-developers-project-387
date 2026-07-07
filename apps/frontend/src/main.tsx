import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import './index.css'
import { createTheme, MantineProvider } from '@mantine/core'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'

const theme = createTheme({
  primaryColor: 'violet',
  defaultRadius: 'md',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
)
