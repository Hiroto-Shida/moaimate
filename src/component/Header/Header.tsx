import {
    Box,
    Avatar,
    Button,
    chakra,
    Container,
    Flex,
    Heading,
    Text,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spacer,
    useToast,
} from '@chakra-ui/react'
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
import { FirebaseError } from '@firebase/util'
import { getAuth, signOut } from 'firebase/auth'
// import { useRouter } from 'next/router'
// import Link from 'next/link'
import { Navigate } from '@src/component/Navigate/Navigate'
import { useRouter } from '@src/hooks/useRouter/useRouter'

export const Header = () => {
    const { user } = useAuthContext()
    const toast = useToast()
    const { push } = useRouter()

    const handleSignOut = async () => {
        try {
            const auth = getAuth()
            await signOut(auth)
            toast({
                title: 'ログアウトしました。',
                status: 'success',
                position: 'top',
            })
            // push('/signin')
            push((path) => path.signin.$url())
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.log(e)
            }
        }
    }


    return (
        <>
            <chakra.header py={4} bgColor={'blue.600'}>
                <Container maxW={'container.lg'}>
                    <Flex>
                        <Navigate href={(path) => path.$url()}>
                            {/* <Link href={'/'} passHref> */}
                            <Heading
                                _hover={{
                                    opacity: 0.8,
                                }}
                                color={'white'}>Firebase Realtime Chat</Heading>
                            {/* </Link> */}
                        </Navigate>
                        <Spacer aria-hidden />
                        {user?.emailVerified ? (
                            <Menu>
                                <Box h={10} mr={3} color='#fff' display='flex' justifyContent='center' alignItems='center'>
                                    <Text align='center' fontSize='md'>{user?.email}でログイン中</Text>
                                </Box>
                                <MenuButton>
                                    <Avatar flexShrink={0} width={10} height={10} />
                                </MenuButton>
                                <MenuList py={0}>
                                    <MenuItem onClick={handleSignOut}>サインアウト</MenuItem>
                                </MenuList>
                            </Menu>
                        ) : (
                            <Navigate href={(path) => path.signin.$url()}>
                                {/* <Link href={'/signin'} passHref> */}
                                <Button colorScheme={'teal'}>
                                    サインイン
                                </Button>
                                {/* </Link> */}
                            </Navigate>
                        )}
                    </Flex>
                </Container >
            </chakra.header >
        </>
    )
}