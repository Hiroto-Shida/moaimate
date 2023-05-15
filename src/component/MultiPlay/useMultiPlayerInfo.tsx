// playページの参加プレイヤーの情報管理
import { useEffect, useRef, useState } from 'react'
import { getDatabase, onChildAdded, onChildRemoved, onChildChanged, onDisconnect, push, set, ref, remove } from '@firebase/database'
import { FirebaseError } from 'firebase/app';
import { TypeSetPlayersInfo } from '@src/pages/play';

export interface TypeSetPlayersInfoWithUid {
    [uid: string]: TypeSetPlayersInfo
}

export const useMultiPlayerInfo = () => {
    const usersInfoRef = useRef<TypeSetPlayersInfoWithUid>({}) // playページの参加プレイヤーの情報

    // フィールドに新しいPlayerが参加した時，参加キャラ情報を更新
    useEffect(() => {
        try {
            const db = getDatabase()
            const dbRef_play = ref(db, `play`)
            // 新しいユーザが入ってきたら登録
            return onChildAdded(dbRef_play, (snapshot) => {
                const user_id = (snapshot.key ?? '')
                usersInfoRef.current[user_id] = snapshot.val()
                // console.log('set userNum')
                // console.log("users info = ", usersInfoRef.current)
            })
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.error(e)
            }
            return
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Playerが離脱した時，参加キャラ情報を更新
    useEffect(() => {
        try {
            const db = getDatabase()
            const dbRef_play = ref(db, `play`)
            // ユーザが減ったら更新
            return onChildRemoved(dbRef_play, (snapshot) => {
                const user_id = (snapshot.key ?? '')
                delete usersInfoRef.current[user_id]
                // console.log("out users info = ", user_id)
                // console.log('set userNum')
            })
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.error(e)
            }
            return
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // playerデータが変更されたら
    useEffect(() => {
        try {
            // Object.entries(usersInfoRef).map(([user_id], index) => {
            const db = getDatabase()
            const dbRef_play = ref(db, `play`)
            // 新しいユーザが入ってきたら登録
            return onChildChanged(dbRef_play, (snapshot) => {
                const user_id = (snapshot.key ?? '')
                const value = snapshot.val()
                if (usersInfoRef.current && user_id) {
                    // console.log(`user_id = ${snapshot.val().angle}`)
                    usersInfoRef.current[user_id].x = value.x
                    usersInfoRef.current[user_id].z = value.z
                    usersInfoRef.current[user_id].angle = value.angle
                    usersInfoRef.current[user_id].name = value.name
                    // console.log('set userNum')
                    // console.log("users info = ", usersInfoRef.current)
                }
            })
            // })
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.error(e)
            }
            return
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return usersInfoRef.current
}