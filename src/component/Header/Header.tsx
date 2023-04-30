import {
    Box,
    Avatar,
    Button,
    chakra,
    Container,
    FormControl,
    FormLabel,
    Flex,
    Link,
    Heading,
    Text,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
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
    Center,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
import { FirebaseError } from '@firebase/util'
import { getAuth, signOut } from 'firebase/auth'
// import { useRouter } from 'next/router'
// import Link from 'next/link'
import { Navigate } from '@src/component/Navigate/Navigate'
import { useRouter } from '@src/hooks/useRouter/useRouter'
import { FormEvent, useState } from 'react'
import { getDatabase, onChildAdded, onValue, push, set, ref } from '@firebase/database'
import React from 'react'


export const Header = () => {
    const user = useAuthContext()
    // console.log("abc = ", user?.user)
    // const { username } = useAuthContext()
    const [userName, setUserName] = useState<string>('')
    const toast = useToast()
    const { push } = useRouter()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = React.useRef<HTMLButtonElement>(null)
    const [selectedItem, setSelectedItem] = useState<string>('')

    const onOpenDialog = (name: string) => {
        setSelectedItem(name)
    }

    const onCloseDialog = () => {
        setSelectedItem('')
    }


    const handleAccountSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log('username = ', userName)
        if (!userName.match(/\S/g)) {
            toast({
                title: '空白以外の文字を入力してください',
                status: 'error',
                position: 'top',
            })
        } else {
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
                onCloseDialog() // モーダルを閉じる
            } catch (e) {
                if (e instanceof FirebaseError) {
                    console.log(e)
                }
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
            <chakra.header py={4}>
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
                                    </Box>
                                    {/* <MenuButton>
                                        <Avatar flexShrink={0} width={10} height={10} />
                                    </MenuButton>
                                    <MenuList py={0}>
                                        <MenuItem py={5} onClick={onOpen}>アカウント</MenuItem>
                                        <MenuItem onClick={handleSignOut}>サインアウト</MenuItem>
                                    </MenuList> */}
                                </Menu>
                                <Button ref={btnRef} onClick={() => onOpenDialog('Hamburger')}>
                                    <HamburgerIcon />
                                </Button>
                                <Drawer
                                    isOpen={selectedItem === 'Hamburger'}
                                    placement='right'
                                    onClose={onCloseDialog}
                                    finalFocusRef={btnRef}
                                >
                                    <DrawerOverlay />
                                    <DrawerContent>
                                        <DrawerCloseButton />
                                        <DrawerHeader>Menu</DrawerHeader>

                                        <DrawerBody>
                                            <Flex flexDirection={'column'} gap={2} alignItems={'start'}>
                                                <Navigate href={(path) => path.$url()}>
                                                    <Link lineHeight={1}>トップページ</Link>
                                                </Navigate>
                                                <Navigate href={(path) => path.signin.$url()}>
                                                    <Link lineHeight={1}>サインイン</Link>
                                                </Navigate>
                                                <Navigate href={(path) => path.signup.$url()}>
                                                    <Link lineHeight={1}>サインアップ</Link>
                                                </Navigate>
                                                <Navigate href={(path) => path.chat.$url()}>
                                                    <Link lineHeight={1}>チャット</Link>
                                                </Navigate>
                                                <Button onClick={() => onOpenDialog('AccountSetting')}>アカウント設定</Button>
                                                <Button onClick={handleSignOut}>サインアウト</Button>
                                            </Flex>
                                        </DrawerBody>

                                        <DrawerFooter>
                                            <Button variant='outline' mr={3} onClick={onClose}>
                                                Close
                                            </Button>
                                        </DrawerFooter>
                                    </DrawerContent>
                                </Drawer>

                                {/* ↓アカウント設定のモーダル↓ */}
                                <Modal
                                    isOpen={selectedItem === 'AccountSetting'}
                                    onClose={onCloseDialog}
                                >
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
                                                <Button colorScheme='blue' mr={3} onClick={onCloseDialog}>
                                                    Close
                                                </Button>
                                                <Button type={'submit'} variant='ghost'>save</Button>
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