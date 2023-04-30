// 認証状況とユーザ情報(名前など)を取得
import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'
import type { User } from '@firebase/auth'
import { getAuth, onAuthStateChanged } from '@firebase/auth'
import { getDatabase, onChildAdded, onValue, push, set, ref } from '@firebase/database'
import { FirebaseError } from '@firebase/util'

// 認証情報userの設定
export type GlobalAuthState = {
    userinfo: User | null | undefined;
    username: string
}
const initialState: GlobalAuthState = {
    userinfo: undefined,
    username: 'initname'
}

export type GlobalsetState = {
    user: GlobalAuthState;
    setUser: React.Dispatch<React.SetStateAction<GlobalAuthState>>
}

const AuthContext = createContext<GlobalsetState | null>(null)

type Props = { children: ReactNode }

export const AuthProvider = ({ children }: Props) => {
    const [user, setUser] = useState<GlobalAuthState>(initialState)

    // firebaseに名前を登録
    const registerUserName = async (user_id: string | null | undefined, user_name: string) => {
        // console.log("checkUserName => ", user_id, userName)
        try {
            // databaseを参照して取得
            const db = getDatabase()
            const dbRef_chat = ref(db, `user/${user_id}`)
            await set(dbRef_chat, {
                'email': user.userinfo?.email,
                'name': user_name
            })
            // stateに登録
            setUser(state => {
                return {
                    ...state,
                    username: user_name // ユーザ名だけ設定
                }
            })
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.log(e)
            }
        }
    }


    // 認証状況の確認・取得
    useEffect(() => {
        try {
            const auth = getAuth()
            return onAuthStateChanged(auth, (user) => {
                // setUser({
                //     user,
                // })
                setUser(state => {
                    return {
                        ...state,
                        userinfo: user // ユーザ認証情報だけ設定
                    }
                })
            })
        } catch (error) {
            setUser(initialState)
            throw error
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    // firebaseからユーザ情報の確認・取得
    useEffect(() => {
        try {
            const db = getDatabase()
            const dbRef_user = ref(db, `user/${user.userinfo?.uid}`)
            // console.log('uid = ', user.userinfo)
            // onValueは
            return onValue(dbRef_user, (snapshot) => {
                // databaseにすでに名前登録がしてある場合
                if (snapshot.exists()) {
                    const user_name = String(snapshot.val()['name'] ?? '')
                    // stateに保存
                    setUser(state => {
                        return {
                            ...state,
                            username: user_name
                        }
                    })
                    // console.log('exists! name = ', user.username)
                } else {
                    // ユーザ名がまだ設定されてない場合，登録する．初期名はメアドの@以前の部分
                    registerUserName(user.userinfo?.uid, `${(user.userinfo?.email)?.split('@')[0]}`)
                    // console.log('---not exists---')
                }
            })
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.error(e)
            }
            return
        }
    }, [user.userinfo])

    return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>
}

//  <AuthProvider>で囲まれた要素では useAuthContext を使って認証状態・ユーザ情報を取得可能
export const useAuthContext = () => useContext(AuthContext)