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
    ChakraComponent,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
import { FirebaseError } from '@firebase/util'
import { getAuth, signOut } from 'firebase/auth'
// import { useRouter } from 'next/router'
// import Link from 'next/link'
import { Navigate } from '@src/component/Navigate/Navigate'
import { useRouter } from '@src/hooks/useRouter/useRouter'
import { FormEvent, createContext, useEffect, useRef, useState } from 'react'
import { getDatabase, onChildAdded, onValue, push, set, ref } from '@firebase/database'
import React from 'react'
import { usePageSize } from '../PageSizing/usePageSize'


export const Header = () => {
    const user = useAuthContext()
    // console.log("abc = ", user?.user)
    // const { username } = useAuthContext()
    const [userName, setUserName] = useState<string>('')
    const toast = useToast()
    const { push } = useRouter()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = React.useRef<HTMLButtonElement>(null)
    const [selectedItem, setSelectedItem] = useState<string>('') // 選択したメニューバーなどのボタン情報

    // ヘッダー高さ，ウィンドウサイズ取得・設定
    const headerRef = useRef<HTMLDivElement>(null);
    const [, , , setPageInfo] = usePageSize()
    useEffect(() => {
        if (headerRef.current) {
            const headerHeight = headerRef.current.offsetHeight;
            const innerHeight = window.innerHeight;
            const innerWidth = window.innerWidth;
            setPageInfo(headerHeight, innerHeight, innerWidth)
            // console.log('Header height:', headerHeight);
        }
    }, [setPageInfo]);

    // メニューバーを開いたときの設定
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
            <chakra.header py={4} ref={headerRef}>
                <Container maxW={'container.lg'}>
                    <Flex>
                        <Navigate href={(path) => path.$url()}>
                            {/* <Link href={'/'} passHref> */}
                            <Heading
                                _hover={{
                                    opacity: 0.8,
                                }}
                                color={'white'}>MoaiMate</Heading>
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
                                            <Flex flexDirection={'column'} gap={5} fontSize={20} alignItems={'start'}>
                                                <Navigate href={(path) => path.$url()}>
                                                    <Link lineHeight={1}>Top</Link>
                                                </Navigate>
                                                <Navigate href={(path) => path.signin.$url()}>
                                                    <Link lineHeight={1}>Sign In</Link>
                                                </Navigate>
                                                <Navigate href={(path) => path.signup.$url()}>
                                                    <Link lineHeight={1}>Sign Up</Link>
                                                </Navigate>
                                                <Navigate href={(path) => path.chat.$url()}>
                                                    <Link lineHeight={1}>Chat</Link>
                                                </Navigate>
                                                <Navigate href={(path) => path.play.$url()}>
                                                    <Link lineHeight={1}>Play</Link>
                                                </Navigate>
                                                <Spacer aria-hidden />
                                                <Button onClick={() => onOpenDialog('AccountSetting')}>Setting</Button>
                                                <Button onClick={handleSignOut}>Sign Out</Button>
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
                                            <ModalHeader>Setting</ModalHeader>
                                            <ModalCloseButton />
                                            <ModalBody>
                                                <FormControl>
                                                    <FormLabel>E-Mail</FormLabel>
                                                    <Input
                                                        type={'email'}
                                                        name={'email'}
                                                        value={String(user.user.userinfo.email)}
                                                        isReadOnly
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Your Name</FormLabel>
                                                    <Input
                                                        placeholder='Your Name'
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
                                    Sign In
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