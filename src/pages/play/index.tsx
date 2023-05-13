import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    Center,
    Link,
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import styles from '@src/styles/Home.module.css'
import React, { Suspense, useRef, useState } from 'react';

import { useEffect, } from 'react'
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Text } from '@react-three/drei';
import { CameraControls } from '@react-three/drei';
import { Controller, TypeControllerRefs } from '@src/component/KeyAndTouchEvent/Controller';
import { getDatabase, onChildAdded, onValue, onDisconnect, push, set, ref, remove } from '@firebase/database'
import { useTouchContext } from '@src/component/KeyAndTouchEvent/TouchProvider'
import { useTouchEvent } from '@src/component/KeyAndTouchEvent/useTouchEvent';
import { usePageSize } from '@src/component/PageSizing/usePageSize';
import { Field } from '@src/component/ThreeObject/Field';
import { Player } from '@src/component/ThreeObject/Player';
import { AuthGuard } from '@src/feature/auth/component/AuthGuard/AuthGuard';
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider';
import { FirebaseError } from 'firebase/app';
import { usePathRouter } from '@src/hooks/usePathRouter/usePathRouter'
import { Navigate } from '@src/component/Navigate/Navigate';
import { useRouter } from 'next/router';

const Page: NextPage = () => {
    // console.log("-- play page rendering --")
    const [isJoin, setIsJoin] = useState<Boolean>(false) // 最初のJoinモーダル用(beforeunloadイベントの発火用にも必要)
    const { push } = usePathRouter()
    const nextRouter = useRouter()

    const { user } = useAuthContext() // ユーザ情報の取得
    const CameraControlRef = useRef<CameraControls | null>(null) // カメラのref．回転や方向の参照や調整に使用
    const is_touch = useTouchContext() // タッチできるか否か
    const ControllerRef = useRef<TypeControllerRefs | null>(null) // コントローラーのref
    const touchMap = useTouchEvent() // タップ情報
    const controllerSize = useRef<{ parent: number; child: number }>({ parent: 0, child: 0 }) // コントローラのサイズref

    // const usersInfoRef = useRef({}) // playページの参加プレイヤーの情報

    // ヘッダーの高さ，ページサイズ取得
    const [headerHeight, innerHeight, innerWidth] = usePageSize();
    const canvasStyles = {
        height: `${innerHeight - headerHeight - 10}px`, // ヘッダーの高さ，ページサイズでCanvasサイズを調整
    }

    // モーダルを閉じる時の処理
    const onCloseModal = () => {
        push((path) => path.$url())
    }


    // フィールドに新しいPlayerが参加した時，参加キャラ情報を更新
    // useEffect(() => {
    //     // if (typeof user.userinfo !== "undefined") {
    //     try {
    //         // console.log(`play/${user.user.userinfo}`)
    //         const db = getDatabase()
    //         const dbRef_play = ref(db, `play`)
    //         // onValueは
    //         return onChildAdded(dbRef_play, (snapshot) => {
    //             const user_id = (snapshot.key ?? '')
    //             usersInfoRef.current[user_id] = snapshot.val()
    //             console.log("users info = ", usersInfoRef.current)
    //             // databaseにすでにキャラ情報がある場合
    //             // if (snapshot.exists()) {
    //             //     // console.log("exist!!!")
    //             // } else { // databaseにキャラ情報がない場合
    //             //     console.log("no info!")
    //             //     registerPlayerInfo(user.userinfo?.uid)
    //             // }
    //         })
    //     } catch (e) {
    //         if (e instanceof FirebaseError) {
    //             console.error(e)
    //         }
    //         return
    //     }
    //     // }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])


    // App内ページの移動やブラウザバック処理
    useEffect(() => {
        // App内ページ遷移時に発火
        const pageChangeHandler = async () => {
            // console.log("移動！！！！")
            // console.log((isJoin), (typeof user.userinfo?.uid))
            if (typeof user.userinfo?.uid !== 'undefined') {
                // console.log("移動２！！！！！！！！！！！")
                try {
                    const user_id: String = user.userinfo?.uid
                    // databaseを参照して取得
                    const db = getDatabase()
                    const dbRef_play = ref(db, `play/${user_id}/`)
                    await remove(dbRef_play)
                } catch (e) {
                    if (e instanceof FirebaseError) {
                        console.log(e)
                    }
                }
            }
        }
        window.addEventListener('popstate', pageChangeHandler, false);
        nextRouter.events.on('routeChangeStart', pageChangeHandler)
        return () => {
            nextRouter.events.off('routeChangeStart', pageChangeHandler)
            window.removeEventListener('popstate', pageChangeHandler, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nextRouter, usePathRouter]);


    // ユーザ切断時処理 firebaseで判定
    useEffect(() => {
        if (typeof user.userinfo?.uid !== 'undefined') {
            try {
                const db = getDatabase();
                const dbRef_play = ref(db, `play/${user.userinfo.uid}`);

                // 切断時にデータを削除するように設定
                onDisconnect(dbRef_play).remove()
            } catch (e) {
                if (e instanceof FirebaseError) {
                    console.error(e);
                }
                return;
            }
        }
    }, [user.userinfo?.uid]);


    // firebaseに自分の位置情報などを登録
    const registerPlayerInfo = async (user_id: string) => {
        try {
            // databaseを参照して取得
            const db = getDatabase()
            const dbRef_play = ref(db, `play/${user_id}`)
            await set(dbRef_play, {
                // 'is_exist': true,
                'x': 0,
                'z': 0,
                'angle': 0
            })
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.log(e)
            }
        }
    }

    // firebaseからフィールドの自分のキャラプレイヤー情報の取得
    // useEffect(() => {
    //     if (typeof user.userinfo !== "undefined") {
    //         try {
    //             // console.log(`play/${user.user.userinfo}`)
    //             console.log(`play/${user.userinfo?.uid}`)
    //             const db = getDatabase()
    //             const dbRef_play = ref(db, `play/${user.userinfo?.uid}`)
    //             // onValueは
    //             return onValue(dbRef_play, (snapshot) => {
    //                 // databaseにすでにキャラ情報がある場合
    //                 if (snapshot.exists()) {
    //                     // console.log("exist!!!")
    //                 } else { // databaseにキャラ情報がない場合
    //                     console.log("no info!")
    //                     registerPlayerInfo(user.userinfo?.uid)
    //                 }
    //             })
    //         } catch (e) {
    //             if (e instanceof FirebaseError) {
    //                 console.error(e)
    //             }
    //             return
    //         }
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [user.username])

    // Player がJoinを押して，かつ認証が完了してuidが取得済みの時
    useEffect(() => {
        if ((isJoin) && (typeof user.userinfo?.uid !== 'undefined')) {

            // コントローラー初期値設定
            const edgeSize = 30
            // コントローラーサイズを決定
            controllerSize.current.parent = (innerHeight >= innerWidth) ? (innerWidth / 3) : (innerHeight / 3)
            controllerSize.current.child = controllerSize.current.parent / 2
            // コントローラーの位置を決定
            touchMap.controllerX = edgeSize + controllerSize.current.parent / 2
            touchMap.controllerY = innerHeight - edgeSize - controllerSize.current.parent / 2

            // コントローラーの外枠の方(parent)の設定
            if (ControllerRef.current && ControllerRef.current.ParentRef.current) {
                ControllerRef.current.ParentRef.current.style.width = `${controllerSize.current.parent}px`
                ControllerRef.current.ParentRef.current.style.height = `${controllerSize.current.parent}px`
                ControllerRef.current.ParentRef.current.style.left = `${touchMap.controllerX - controllerSize.current.parent / 2}px`
                ControllerRef.current.ParentRef.current.style.top = `${touchMap.controllerY - controllerSize.current.parent / 2}px`
            }
            // コントローラーの内側(child, 操作して動く方)の設定
            if (ControllerRef.current && ControllerRef.current.ChildRef.current) {
                ControllerRef.current.ChildRef.current.style.width = `${controllerSize.current.child}px`
                ControllerRef.current.ChildRef.current.style.height = `${controllerSize.current.child}px`
                ControllerRef.current.ChildRef.current.style.left = `${controllerSize.current.child / 2}px`
                ControllerRef.current.ChildRef.current.style.top = `${controllerSize.current.child / 2}px`
            }
            // console.log("header height = ", headerHeight)


            // firebaseに自分の位置情報などを登録
            registerPlayerInfo(user.userinfo.uid)


        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isJoin, user.userinfo?.uid]) // innerHeight, innerWidthが決定されたあとに実行したい



    return (
        <>
            <AuthGuard>
                {/* 開始時のモーダル */}
                <Modal
                    closeOnOverlayClick={false}
                    isOpen={!isJoin}
                    onClose={onCloseModal}
                    isCentered
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalBody>
                            <Center>
                                <Button colorScheme='blue' fontSize='lg' size='lg' m={5} onClick={() => setIsJoin(true)}>
                                    Join!
                                </Button>
                            </Center>
                            <Center>
                                <Navigate href={(path) => path.$url()}>
                                    <Link m={5} lineHeight={1} onClick={onCloseModal}>Back to Top</Link>
                                </Navigate>
                            </Center>
                        </ModalBody>
                    </ModalContent>
                </Modal>
                {/* メイン Canvas */}
                <div className={styles.playGlobe} style={canvasStyles}>
                    <Canvas shadows dpr={[1, 2]} camera={{ position: [+7, 3, 0], fov: 50 }}>
                        {/* <Canvas shadows dpr={[1, 2]}> */}
                        <CameraControls
                            ref={CameraControlRef}
                            enabled={true}
                            minPolarAngle={Math.PI / 3} // 上下回転を固定
                            maxPolarAngle={Math.PI / 2.1} // 上下回転を固定
                        />
                        <ambientLight intensity={0.7} />
                        {/* <spotLight intensity={5} angle={0.1} penumbra={1} position={[10, 15, 10]} color='#fff' castShadow /> */}
                        <Suspense fallback={null}>
                            <Field />
                            {isJoin ? (
                                <Player
                                    CameraControlRef={CameraControlRef}
                                    ControllerRef={ControllerRef}
                                    controllerSize={controllerSize}
                                    is_touch={is_touch}
                                    user={user}
                                />
                            ) : (
                                <></>
                            )}
                            <Environment preset="city" />
                        </Suspense>
                        {/* axesHelperメモ：軸を表示 X(赤), Y(緑), Z(青), args={[線の長さ]} */}
                        <axesHelper args={[10]} />
                        {/* <gridHelper args={[20, 20, 0xff0000, 'teal']} /> */}
                    </Canvas>
                </div>
                {(is_touch && isJoin) ? (
                    <Controller ref={ControllerRef} />
                ) : (
                    <></>
                )}
            </AuthGuard>
        </>
    )

}

export default Page

