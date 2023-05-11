import type { NextPage } from 'next'
import styles from '@src/styles/Home.module.css'
import React, { Suspense, useRef, useState } from 'react';

import { useEffect, } from 'react'
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Text } from '@react-three/drei';
import { CameraControls } from '@react-three/drei';
import { Controller, TypeControllerRefs } from '@src/component/KeyAndTouchEvent/Controller';
import { useTouchContext } from '@src/component/KeyAndTouchEvent/TouchProvider'
import { useTouchEvent } from '@src/component/KeyAndTouchEvent/useTouchEvent';
import { usePageSize } from '@src/component/PageSizing/usePageSize';
import { Field } from '@src/component/ThreeObject/Field';
import { Player } from '@src/component/ThreeObject/Player';


const Page: NextPage = () => {
    console.log("-- play page rendering --")
    const CameraControlRef = useRef<CameraControls | null>(null) // カメラのref．回転や方向の参照や調整に使用
    // const cameraPos = new THREE.Vector3() // カメラの座標
    const is_touch = useTouchContext() // タッチできるか否か
    const ControllerRef = useRef<TypeControllerRefs | null>(null) // コントローラーのref
    const touchMap = useTouchEvent() // タップ情報
    const controllerSize = useRef<{ parent: number; child: number }>({ parent: 0, child: 0 }) // コントローラのサイズref

    // ヘッダーの高さ，ページサイズ取得
    const [headerHeight, innerHeight, innerWidth] = usePageSize();
    const canvasStyles = {
        height: `${innerHeight - headerHeight - 10}px`, // ヘッダーの高さ，ページサイズでCanvasサイズを調整
    }

    // コントローラー初期値設定
    useEffect(() => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasStyles.height]) // innerHeight, innerWidthが決定されたあとに実行したい



    return (
        <>
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
                        <Player
                            CameraControlRef={CameraControlRef}
                            ControllerRef={ControllerRef}
                            controllerSize={controllerSize}
                            is_touch={is_touch}
                        />
                        <Environment preset="city" />
                    </Suspense>
                    {/* axesHelperメモ：軸を表示 X(赤), Y(緑), Z(青), args={[線の長さ]} */}
                    <axesHelper args={[10]} />
                    {/* <gridHelper args={[20, 20, 0xff0000, 'teal']} /> */}
                </Canvas>
            </div>
            {is_touch ? (
                <Controller ref={ControllerRef} />
            ) : (
                <></>
            )}
        </>
    )

}

export default Page

