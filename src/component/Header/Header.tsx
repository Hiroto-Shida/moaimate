import {
    Box,
    Avatar,
    Button,
    chakra,
    Container,
    FormControl,
    FormLabel,
    Flex,
    Heading,
    Text,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spacer,
    useToast,
    useDisclosure,
} from '@chakra-ui/react'
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
import { FirebaseError } from '@firebase/util'
import { getAuth, signOut } from 'firebase/auth'
// import { useRouter } from 'next/router'
// import Link from 'next/link'
import { Navigate } from '@src/component/Navigate/Navigate'
import { useRouter } from '@src/hooks/useRouter/useRouter'
import { FormEvent, useState } from 'react'
import { getDatabase, onChildAdded, onValue, push, set, ref } from '@firebase/database'


export const Header = () => {
    const user = useAuthContext()
    // console.log("abc = ", user?.user)
    // const { username } = useAuthContext()
    const toast = useToast()
    const { push } = useRouter()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [userName, setUserName] = useState<string>('')


    const handleAccountSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log('username = ', userName)
        try {

            // databaseに保存
            const db = getDatabase()
            const dbRef_chat = ref(db, `user/${user?.user.userinfo?.uid}/name`)
            await set(dbRef_chat, userName)

            // stateに保存
            user?.setUser(state => {
                return {
                    ...state,
                    username: userName // ユーザ名だけ設定
                }
            })

            toast({
                title: 'ユーザ名が変更されました',
                status: 'success',
                position: 'top',
            })
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.log(e)
            }
        }
    }

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
                                color={'white'}>MoaChat</Heading>
                            {/* </Link> */}
                        </Navigate>
                        <Spacer aria-hidden />
                        {user?.user.userinfo?.emailVerified ? (
                            <>
                                <Menu>
                                    <Box h={10} mr={3} color='#fff' display='flex' justifyContent='center' alignItems='center'>
                                        {/* <Text align='center' fontSize='md'>{user?.email}でログイン中</Text> */}
                                        <Text align='center' fontSize='md' as='b'>{user.user.username}</Text>
                                        <Text align='center' fontSize='md'>でログイン中</Text>
                                    </Box>
                                    <MenuButton>
                                        <Avatar flexShrink={0} width={10} height={10} />
                                    </MenuButton>
                                    <MenuList py={0}>
                                        <MenuItem py={5} onClick={onOpen}>アカウント</MenuItem>
                                        <MenuItem onClick={handleSignOut}>サインアウト</MenuItem>
                                    </MenuList>
                                </Menu>
                                {/* ↓アカウント設定のモーダル↓ */}
                                <Modal isOpen={isOpen} onClose={onClose}>
                                    <ModalOverlay />
                                    <ModalContent>
                                        <chakra.form onSubmit={handleAccountSubmit}>
                                            <ModalHeader>アカウント設定</ModalHeader>
                                            <ModalCloseButton />
                                            <ModalBody>
                                                <FormControl>
                                                    <FormLabel>登録メールアドレス</FormLabel>
                                                    <Input
                                                        type={'email'}
                                                        name={'email'}
                                                        value={String(user.user.userinfo.email)}
                                                        isReadOnly
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>アカウント名</FormLabel>
                                                    <Input
                                                        placeholder='アカウント名'
                                                        type={'name'}
                                                        name={'name'}
                                                        // value={user.user.username}
                                                        onChange={(e) => {
                                                            setUserName(e.target.value)
                                                        }}
                                                    />
                                                </FormControl>
                                            </ModalBody>
                                            <ModalFooter>
                                                <Button colorScheme='blue' mr={3} onClick={onClose}>
                                                    Close
                                                </Button>
                                                <Button type={'submit'} variant='ghost' onClick={onClose}>save</Button>
                                            </ModalFooter>
                                        </chakra.form>
                                    </ModalContent>
                                </Modal>
                            </>
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