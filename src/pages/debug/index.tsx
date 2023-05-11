import { Button, Input, chakra } from "@chakra-ui/react"
import { ChangeEvent, FormEvent, useState } from "react"

export const Page = () => {
    console.log("-- debug page rendering --")

    const [message, setMessage] = useState<string>('')

    const handleChangeMessage = (e: ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value)
    }

    const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
        setMessage('')
    }

    return (
        <chakra.form display={'flex'} gap={2} onSubmit={handleSendMessage}>
            <Input value={message} onChange={(e) => handleChangeMessage(e)} />
            <Button type={'submit'}>送信</Button>
        </chakra.form>
    )
}

export default Page