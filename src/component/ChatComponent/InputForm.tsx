import { Button, Input, chakra } from "@chakra-ui/react"
import { useAuthContext } from "@src/feature/auth/provider/AuthProvider"
import { ChangeEvent, FormEvent, useState } from "react"
import { getDatabase, push, ref } from '@firebase/database'
import { FirebaseError } from '@firebase/util'

export const InputForm = () => {
    // console.log("-- chat page inputForm rendering --")

    const [message, setMessage] = useState<string>('')
    const user = useAuthContext()

    const handleChangeMessage = (e: ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value)
    }

    const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault() // リロード回避
        try {
            // databaseを参照して取得
            const db = getDatabase()
            const dbRef_chat = ref(db, 'chat')
            // pushはデータを書き込む際にユニークキーを自動で生成
            await push(dbRef_chat, {
                userName: user?.user.username,
                message: message,
            })
            setMessage('')
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.log(e)
            }
        }
        // console.log(user)
    }

    return (
        <chakra.form display={'flex'} gap={2} onSubmit={handleSendMessage}>
            <Input value={message} onChange={(e) => handleChangeMessage(e)} />
            <Button type={'submit'}>送信</Button>
        </chakra.form>
    )
}