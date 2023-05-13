import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
// import { useRouter } from 'next/router'
import type { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
import { usePathRouter } from '@src/hooks/usePathRouter/usePathRouter'

type Props = {
    children: ReactNode
}

export const AuthGuard = ({ children }: Props) => {
    const { user } = useAuthContext()
    const { push } = usePathRouter()
    // console.log("emailVerified = ", user.emailVerified)

    if (typeof user.userinfo === 'undefined') {
        return <Box>Loading...</Box>
    }

    // メール認証を終えてない場合
    if ((user.userinfo === null) || (!(user.userinfo?.emailVerified))) {
        // push('/signin')
        push((path) => path.signin.$url())
        return null
    }

    // メール認証まで終えたらchildrenを返す
    return <>{children}</>
}