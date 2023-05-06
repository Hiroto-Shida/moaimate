import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
    initialColorMode: 'dark', // ダークモードをデフォルトに設定
    useSystemColorMode: false, // OSの設定を使わせない
}

export const theme = extendTheme({
    config: config,
    styles: {
        global: {
            'html, body,#__next': {
                height: '100%',
                '&': {
                    height: '100svh',
                },
                overscrollBehavior: 'none',
            },
            '#__next': {
                display: 'flex',
                flexDirection: 'column',
            },
        },
    },
    colors: {
        brand: {
            chatborder: 'rgba(255,255,255,0.3)'
        }
    }
})