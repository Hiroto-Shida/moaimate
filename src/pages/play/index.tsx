import type { NextPage } from 'next'
import {
    Heading,
    Box,
    Image,
    Text,
    Center,
    Button,
} from '@chakra-ui/react'
import styles from '@src/styles/Home.module.css'
import React, { CSSProperties, Suspense, useRef, useState } from 'react';

import { useEffect, createContext, MouseEvent } from 'react'
import * as THREE from 'three'
import { Canvas, Props, useFrame, useLoader } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CameraControls } from '@react-three/drei';
import { Controller, TypeControllerRefs } from '@src/component/KeyAndTouchEvent/Controller';
import { useTouchContext } from '@src/component/KeyAndTouchEvent/TouchProvider'
import useKeyboard from '@src/component/KeyAndTouchEvent/useKeyboard';
import { useTouchEvent } from '@src/component/KeyAndTouchEvent/useTouchEvent';



const Page: NextPage = () => {

    const CameraControlRef = useRef<CameraControls | null>(null)
    const cameraPos = new THREE.Vector3() // カメラの座標
    const is_touch = useTouchContext() // タッチできるか否か

    const ControllerRef = useRef<TypeControllerRefs | null>(null) // コントローラーのref

    const touchMap = useTouchEvent() // タップ情報

    // コントローラー初期値設定
    useEffect(() => {
        if (ControllerRef.current && ControllerRef.current.ParentRef.current) {
            ControllerRef.current.ParentRef.current.style.left = `${touchMap.controllerX - 100}px`
            ControllerRef.current.ParentRef.current.style.top = `${touchMap.controllerY - 100}px`
            // console.log("controller setting 2", `${touchMap.controllerX - 100}px`, `${touchMap.controllerY - 100}px`)
        }
        if (ControllerRef.current && ControllerRef.current.ChildRef.current) {
            ControllerRef.current.ChildRef.current.style.left = `${60 + touchMap.x}px`
            ControllerRef.current.ChildRef.current.style.top = `${60 + touchMap.y}px`
            // console.log("controller setting 2", `${touchMap.controllerX - 100}px`, `${touchMap.controllerY - 100}px`)
        }
    }, [touchMap.controllerY])


    // フィールド(地面)
    const Field = () => {
        return (
            <>
                <mesh position={[0, -0.2, 0]}>
                    <boxGeometry args={[20, 0.2, 20]} />
                    <meshStandardMaterial color="#22a7f2" />
                </mesh>
                <mesh position={[-10, 0.1, -10]}>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="#f00" />
                </mesh>
                <mesh position={[-10, 0.1, 10]}>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="#0f0" />
                </mesh>
                <mesh position={[10, 0.1, -10]}>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="#00f" />
                </mesh>
                <mesh position={[10, 0.1, 10]}>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="#f0f" />
                </mesh>
            </>
        )
    }

    // モアイ(キャラ)
    const keyMap = useKeyboard() // 押しているキーボード保持
    const Model = () => {

        // キーボード操作
        const MoaiRef = useRef<THREE.Mesh>(null!)
        const tmpPos = { x: 0, z: 0 }


        // モアイの位置座標処理(キーボード in PC)
        const updateMoaiPos = (directionAngle: number, delta: number) => {

            const cameraAzimuthAngle: number | undefined = CameraControlRef.current?.azimuthAngle // カメラの角度を取得

            // モアイのx,z座標を設定
            MoaiRef.current.position.z -= Math.cos((cameraAzimuthAngle ?? 0) + directionAngle) * 3 * delta
            MoaiRef.current.position.x -= Math.sin((cameraAzimuthAngle ?? 0) + directionAngle) * 3 * delta

            // カメラ準備設定
            CameraControlRef.current?.getPosition(cameraPos) // カメラの座標を取得
            const tmpCameraAngle = (cameraAzimuthAngle ?? 0) + Math.PI
            const tmpCameraX = -7 * Math.sin(tmpCameraAngle) // カメラの角度からx軸のベクトルに分解
            const tmpCameraZ = -7 * Math.cos(tmpCameraAngle) // カメラの角度からz軸のベクトルに分解
            // カメラの座標と見る方向の設定
            CameraControlRef.current?.setPosition(MoaiRef.current.position.x + tmpCameraX, cameraPos.y, MoaiRef.current.position.z + tmpCameraZ, true) // カメラの座標
            CameraControlRef.current?.setTarget(MoaiRef.current.position.x, MoaiRef.current.position.y, MoaiRef.current.position.z, true) // カメラの見る方向
            // console.log(CameraControlRef.current)
        }

        // モアイの進行方向による向いてる角度処理(キーボード)
        const updateMoaiAngle = () => {
            const tmpDifX = -1 * (MoaiRef.current.position.x - tmpPos.x) // x軸の移動変化量
            const tmpDifZ = -1 * (MoaiRef.current.position.z - tmpPos.z) // z軸の移動変化量
            const tmpAtan2 = Math.atan2(tmpDifX, tmpDifZ)

            MoaiRef.current.rotation.y = tmpAtan2 + Math.PI / 2 // モアイの角度を設定
            tmpPos.x = MoaiRef.current.position.x // 移動後のxを保持
            tmpPos.z = MoaiRef.current.position.z // 移動後のzを保持
        }

        // デバッグ用
        // const checkPos = (delta: number) => {
        //     CameraControlRef.current?.getPosition(cameraPos) // カメラの座標を取得
        //     console.log(cameraPos.y)
        // }

        // joystickコントローラー(スマホ)操作時の処理
        const updateController = (delta: number) => {
            if (touchMap.is_tapController) {
                const cameraAzimuthAngle: number | undefined = CameraControlRef.current?.azimuthAngle // カメラの角度を取得
                const tmpAngle = -touchMap.angle + (cameraAzimuthAngle ?? 0)
                // console.log("tmpAngle", tmpAngle)
                MoaiRef.current.rotation.y = tmpAngle
                MoaiRef.current.position.z += Math.cos(tmpAngle + Math.PI / 2) * 3 * delta // モアイのz座標を設定
                MoaiRef.current.position.x += Math.sin(tmpAngle + Math.PI / 2) * 3 * delta // モアイのx座標を設定
                // console.log('moai X,Z = ', MoaiRef.current.position.x, MoaiRef.current.position.z)

                // コントローラーの位置設定
                if (ControllerRef.current && ControllerRef.current.ChildRef.current) {
                    // コントローラーの円からはみ出ないような設定
                    const tmpR = Math.sqrt(touchMap.x ** 2 + touchMap.y ** 2)
                    let tmpMag: number = 1
                    if (tmpR > 100) {
                        tmpMag = tmpR / 100
                    }
                    ControllerRef.current.ChildRef.current.style.left = `${60 + (touchMap.x) / tmpMag}px`
                    ControllerRef.current.ChildRef.current.style.top = `${60 + (touchMap.y) / tmpMag}px`
                }

                // カメラ準備設定
                CameraControlRef.current?.getPosition(cameraPos) // カメラの座標を取得
                const tmpCameraAngle = (cameraAzimuthAngle ?? 0) + Math.PI
                const tmpCameraX = -7 * Math.sin(tmpCameraAngle) // カメラの角度からx軸のベクトルに分解
                const tmpCameraZ = -7 * Math.cos(tmpCameraAngle) // カメラの角度からz軸のベクトルに分解
                // カメラの座標と見る方向の設定
                CameraControlRef.current?.setPosition(MoaiRef.current.position.x + tmpCameraX, cameraPos.y, MoaiRef.current.position.z + tmpCameraZ, true) // カメラの座標
                CameraControlRef.current?.setTarget(MoaiRef.current.position.x, MoaiRef.current.position.y, MoaiRef.current.position.z, true) // カメラの見る方向
            } else {
                // コントローラーの位置設定(初期位置に設定)
                if (ControllerRef.current && ControllerRef.current.ChildRef.current) {
                    ControllerRef.current.ChildRef.current.style.left = `${60}px`
                    ControllerRef.current.ChildRef.current.style.top = `${60}px`
                }
            }
        }

        // フレームごとの処理
        useFrame((_, delta: number) => {
            is_touch && (updateController(delta)); // タップ操作が可能な場合に処理
            // keyMap['Space'] && (checkPos(delta)); // デバッグ用
            keyMap['ArrowUp'] && (updateMoaiPos(0, delta));
            keyMap['ArrowDown'] && (updateMoaiPos(Math.PI, delta));
            keyMap['ArrowRight'] && (updateMoaiPos(-Math.PI / 2, delta));
            keyMap['ArrowLeft'] && (updateMoaiPos(Math.PI / 2, delta));
            (keyMap['ArrowUp'] || keyMap['ArrowDown'] || keyMap['ArrowRight'] || keyMap['ArrowLeft']) && updateMoaiAngle();
        })

        // モアイ(キャラ生成)
        const colors = [{
            r: 0.7,
            g: 0.2,
            b: 0.2
        }];
        const models: THREE.Object3D<THREE.Event>[] = [];
        const gltf = useLoader(GLTFLoader, "/3d_images/moai_3.gltf");
        for (let i = 0; i < 1; i++) {
            models.push(gltf.scene.clone()) // モデルを複製
            models[i].traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    if (
                        // .colorを設定するのに必要
                        object.material instanceof THREE.MeshBasicMaterial ||
                        object.material instanceof THREE.MeshLambertMaterial ||
                        object.material instanceof THREE.MeshPhongMaterial ||
                        THREE.Material
                    ) {
                        if (object.name.indexOf('dark') !== -1) { // 影となる暗い部分の色設定
                            object.material = object.material.clone() // 同一のマテリアルを参照しているようなので複製したものを代入
                            object.material.color.r = colors[i].r * 0.1;
                            object.material.color.g = colors[i].g * 0.1;
                            object.material.color.b = colors[i].b * 0.1;
                        } else { // その他(メインカラー)の色設定
                            object.material = object.material.clone() // 同一のマテリアルを参照しているようなので複製したものを代入
                            object.material.color.r = colors[i].r;
                            object.material.color.g = colors[i].g;
                            object.material.color.b = colors[i].b;
                        }
                    }
                }
            })
        }
        return (
            <primitive ref={MoaiRef} object={models[0]} scale={0.1} position={new THREE.Vector3(0, 0.7, 0)} />
        );
    };

    return (
        <>
            <div className={styles.globe}>
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
                        <Model />
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

