import { useEffect } from 'react'
import { getDatabase, onChildAdded, ref } from '@firebase/database'
import { FirebaseError } from '@firebase/util'

export const Page = () => {

    // firebaseからチャットの送受信の取得
    useEffect(() => {
        try {
            const db = getDatabase()
            const dbRef_chat = ref(db, 'chat')
            return onChildAdded(dbRef_chat, (snapshot) => {
                const message = String(snapshot.val()['message'] ?? '')
                console.log(message)
            })
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.error(e)
            }
            return
        }
    }, [])

    return (
        <div>test</div>
    )
}

export default Page