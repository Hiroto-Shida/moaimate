import { useFrame, useLoader } from '@react-three/fiber';
import { useState } from 'react';
import * as THREE from 'three'
import { useMultiPlayerInfo } from '@src/component/MultiPlay/useMultiPlayerInfo';
import { CameraControls } from '@react-three/drei';
import { Player } from '@src/component/MultiPlay/Player';


type Props = {
    isRegisterPlayer: Boolean
    mainPlayerUid: string
    MainPlayerCameraRef: React.MutableRefObject<CameraControls | null>
}

// 自分以外のキャラプレイヤー
export const OtherPlayer = ({ isRegisterPlayer, mainPlayerUid, MainPlayerCameraRef }: Props) => {
    console.log("OtherPlayer component rendering!!!!")

    const [playersRef, setPlayersRef] = useState<Record<string, React.RefObject<THREE.Mesh>>>({});

    const usersInfoRef = useMultiPlayerInfo() // playページの参加プレイヤーの情報
    const [playersUid, setPlayersUid] = useState<string[]>([]) // 現在のプレイヤーのuidリスト(自分以外)


    // 現在の参加プレイヤー情報を更新 & レンダリング
    const updateUsersNum = () => {
        const newPlayersUid: string[] = []
        Object.entries(usersInfoRef).map(([user_id, ref], index) => {
            newPlayersUid.push(user_id)
        })
        setPlayersUid(newPlayersUid)
        console.log("人数更新！！！")
    }


    // デバッグ用
    // const checkPos = (delta: number) => {
    //     console.log(`uids = ${playersUid}`)
    // }

    // フレームごとの処理
    useFrame((_, delta: number) => {
        // (checkPos(delta)); // デバッグ用
        (playersUid.length !== Object.keys(usersInfoRef).length) && updateUsersNum(); // 参加プレイヤー情報の更新
    })

    return (
        <>
            {playersUid.map((user_id, index) => {
                if (user_id !== mainPlayerUid) {
                    return (
                        <Player
                            user_id={user_id}
                            MainPlayerCameraRef={MainPlayerCameraRef}
                            key={index}
                        />)
                }
                return null;
            })}
        </>
    );
};