import {
    Box,
    Button,
    Center,
    chakra,
    Container,
    FormControl,
    FormLabel,
    Grid,
    Heading,
    Input,
    Link,
    Spacer,
    useToast,
} from '@chakra-ui/react'
import { type FormEvent, useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { FirebaseError } from '@firebase/util'
import { useRouter } from '@src/hooks/useRouter/useRouter'
import { Navigate } from '@src/component/Navigate/Navigate'

export const Page = () => {

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const toast = useToast()
    const { push } = useRouter()

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        setIsLoading(true)
        e.preventDefault()
        try {
            const auth = getAuth()
            await signInWithEmailAndPassword(auth, email, password)
            setEmail('')
            setPassword('')
            toast({
                title: 'Logged in',
                status: 'success',
                position: 'top',
            })
            push((path) => path.$url()) //ログイン後のページ遷移
        } catch (e) {
            toast({
                title: 'An error occurred',
                status: 'error',
                position: 'top',
            })
            if (e instanceof FirebaseError) {
                console.log(e)
            }
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <Container py={14}>
            <Heading>Sign In</Heading>
            <chakra.form onSubmit={handleSubmit}>
                <Spacer height={8} aria-hidden />
                <Grid gap={4}>
                    <Box display={'contents'}>
                        <FormControl>
                            <FormLabel>E-Mail</FormLabel>
                            <Input
                                type={'email'}
                                name={'email'}
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                }}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Pass word</FormLabel>
                            <Input
                                type={'password'}
                                name={'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                }}
                            />
                        </FormControl>
                    </Box>
                </Grid>
                <Spacer height={4} aria-hidden />
                <Center>
                    <Button type={'submit'} isLoading={isLoading}>
                        Login
                    </Button>
                </Center>
            </chakra.form>
            <Spacer height={10} aria-hidden />
            <Center>
                <Navigate href={(path) => path.signup.$url()}>
                    <Link lineHeight={1}>Sign up</Link>
                </Navigate>
            </Center>
        </Container>
    )
}

export default Page