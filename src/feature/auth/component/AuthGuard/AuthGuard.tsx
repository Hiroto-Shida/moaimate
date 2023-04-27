import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
// import { useRouter } from 'next/router'
import type { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
import { useRouter } from '@src/hooks/useRouter/useRouter'

type Props = {
    children: ReactNode
}

export const AuthGuard = ({ children }: Props) => {
    const user = useAuthContext()
    const { push } = useRouter()
    // console.log("emailVerified = ", user?.emailVerified)

    if (typeof user?.user.userinfo === 'undefined') {
        return <Box>読み込み中...</Box>
    }

    // メール認証を終えてない場合
    if ((user?.user.userinfo === null) || (!(user?.user.userinfo?.emailVerified))) {
        // push('/signin')
        push((path) => path.signin.$url())
        return null
    }

    // メール認証まで終えたらchildrenを返す
    return <>{children}</>
}