import {
    Avatar,
    Box,
    Button,
    chakra,
    Container,
    Flex,
    Heading,
    Input,
    Spacer,
    Text,
} from '@chakra-ui/react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { getDatabase, onChildAdded, onValue, push, set, ref } from '@firebase/database'
import { FirebaseError } from '@firebase/util'
import { AuthGuard } from '@src/feature/auth/component/AuthGuard/AuthGuard'
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
import { InputForm } from '@src/component/ChatComponent/InputForm'


type MessageProps = {
    userName: string
    message: string
}

const Message = ({ userName, message }: MessageProps) => {
    return (
        <Flex alignItems={'start'}>
            <Avatar />
            <Box ml={2}>
                <Text fontSize='xs' rounded={'md'}>
                    {userName}
                </Text>
                <Text border='1px' borderColor='brand.chatborder' rounded={'md'} px={2} py={1}>
                    {message}
                </Text>
            </Box>
        </Flex>
    )
}

export const Page = () => {
    console.log("-- chat page rendering --")
    const messagesElementRef = useRef<HTMLDivElement | null>(null)

    const [chats, setChats] = useState<{ userName: string, message: string }[]>([])

    // firebaseからチャットの送受信の取得
    useEffect(() => {
        try {
            const db = getDatabase()
            const dbRef_chat = ref(db, 'chat')
            // onChildAddedは新しい子が追加されるたびに呼び出し
            return onChildAdded(dbRef_chat, (snapshot) => {
                // const test_message = snapshot.val()
                // console.log(test_message)
                const message = String(snapshot.val()['message'] ?? '')
                const userName = String(snapshot.val()['userName'] ?? '')
                setChats((prev) => [...prev, { userName, message }])
            })
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.error(e)
            }
            return
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // チャットに何か送信されたら，最新位置までスクロール
    useEffect(() => {
        messagesElementRef.current?.scrollTo({
            top: messagesElementRef.current.scrollHeight,
        })
    }, [chats])

    return (
        <AuthGuard>
            <Container
                py={14}
                flex={1}
                display={'flex'}
                flexDirection={'column'}
                minHeight={0}
            >
                <Heading>チャット</Heading>
                <Spacer flex={'none'} height={4} aria-hidden />
                <Flex
                    flexDirection={'column'}
                    overflowY={'auto'}
                    gap={2}
                    ref={messagesElementRef}
                    border='1px'
                    borderColor='brand.chatborder'
                >
                    {chats.map((chat, index) => (
                        <Message userName={chat.userName} message={chat.message} key={`ChatMessage_${index}`} />
                    ))}
                </Flex>
                <Spacer aria-hidden />
                <Spacer height={2} aria-hidden flex={'none'} />
                <InputForm />
            </Container>
        </AuthGuard>
    )
}

export default Page