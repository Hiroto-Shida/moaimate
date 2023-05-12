import type { AppProps } from 'next/app'
import { chakra, ChakraProvider } from '@chakra-ui/react'
import { initializeFirebaseApp } from '@src/lib/firebase/firebase'
import { getApp } from 'firebase/app'
import { AuthProvider } from '@src/feature/auth/provider/AuthProvider'
import { Header } from '@src/component/Header/Header'
import { theme } from '@src/lib/chakra/theme'
import { TouchProvider } from '@src/component/KeyAndTouchEvent/TouchProvider'

initializeFirebaseApp()
function MyApp({ Component, pageProps }: AppProps) {
  // console.log(getApp())
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <TouchProvider>
          <Header />
          <chakra.main
            flex={1}
            display={'flex'}
            flexDirection={'column'}
            minHeight={0}
          >
            <Component {...pageProps} />
          </chakra.main>
        </TouchProvider>
      </AuthProvider>
    </ChakraProvider>
  )
}

export default MyApp
