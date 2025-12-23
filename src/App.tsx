import { BrowserRouter } from 'react-router-dom'

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { IntlProvider } from 'react-intl'
import PageRouter from './routes';


const queryClient = new QueryClient();

function App() {
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="vi" defaultLocale="vi" messages={{}}>
          <PageRouter/>
        </IntlProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App