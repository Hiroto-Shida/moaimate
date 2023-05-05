import type { NextPage } from 'next'
import {
    Heading,
    Box,
    Image,
    Text,
    Center,
} from '@chakra-ui/react'
import styles from '../../styles/Home.module.css'
import React, { CSSProperties, Suspense, useRef, useState } from 'react';

import { useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, Props, useFrame, useLoader } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import useKeyboard from '@src/component/KeyEvent/useKeyboard';
import { CameraControls } from '@react-three/drei';

const Page: NextPage = () => {

    const CameraControlRef = useRef<CameraControls | null>(null)
    const cameraPos = new THREE.Vector3() // カメラの座標
    const cameraAngle = new THREE.Vector3()

    // フィールド(地面)
    const Field = () => {
        return (
            <mesh position={[0, -0.1, 0]}>
                <boxGeometry args={[20, 0.2, 20]} />
                <meshStandardMaterial color="#22a7f2" />
            </mesh>
        )
    }

    // モアイ(キャラ)
    const Model = () => {

        // キーボード操作
        const MoaiRef = useRef<THREE.Mesh>(null!)
        const keyMap = useKeyboard()
        const tmpPos = { x: 0, z: 0 }

        // モアイの位置座標処理
        const updateMoaiPos = (directionAngle: number, delta: number) => {

            const cameraAzimuthAngle: number | undefined = CameraControlRef.current?.azimuthAngle // カメラの角度を取得
            // MoaiRef.current.rotation.y = moaiAngleY // モアイの角度

            MoaiRef.current.position.z -= Math.cos((cameraAzimuthAngle ?? 0) + directionAngle) * 3 * delta // モアイのz座標を設定
            MoaiRef.current.position.x -= Math.sin((cameraAzimuthAngle ?? 0) + directionAngle) * 3 * delta // モアイのx座標を設定

            CameraControlRef.current?.getPosition(cameraPos) // カメラの座標を取得
            // CameraControlRef.current?.setTarget(MoaiRef.current.position.x, MoaiRef.current.position.y, MoaiRef.current.position.z, true) // カメラの見る方向
            // CameraControlRef.current?.setPosition(MoaiRef.current.position.x - 7, cameraPos.y, MoaiRef.current.position.z, true) // カメラの座標
        }

        // モアイの進行方向による向いてる角度処理
        const updateMoaiAngle = () => {
            const tmpDifX = -1 * (MoaiRef.current.position.x - tmpPos.x) // x軸の移動変化量
            const tmpDifZ = -1 * (MoaiRef.current.position.z - tmpPos.z) // z軸の移動変化量
            const tmpR = Math.sqrt(tmpDifX ** 2 + tmpDifZ ** 2)
            const tmpCom = 1 / tmpR // 単位円を1として角度を計算したいため，倍率を計算
            const tmpACos = Math.acos(tmpDifZ * tmpCom) // tmpCom倍率で補正して進行方向の角度を求める

            let tmpAngle: number = 0
            // 角度によってArcCosの角度から調整
            if (tmpDifX >= 0) {
                tmpAngle = tmpACos + (Math.PI / 2)
                // console.log("up")
            } else {
                if (tmpDifZ >= 0) {
                    tmpAngle = 2 * Math.PI - tmpACos + (Math.PI / 2)
                    // console.log("down-right")
                } else {
                    tmpAngle = (2 * Math.PI) - tmpACos + (Math.PI / 2)
                    // console.log("down-left")
                }
            }
            // console.log(180 * tmpAngle / Math.PI)

            MoaiRef.current.rotation.y = tmpAngle // モアイの角度を設定
            tmpPos.x = MoaiRef.current.position.x // 移動後のxを保持
            tmpPos.z = MoaiRef.current.position.z // 移動後のzを保持
        }

        useFrame((_, delta: number) => {
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
            <primitive ref={MoaiRef} object={models[0]} scale={0.1} position={new THREE.Vector3(0, 0.7, 0)} rotation={new THREE.Euler(0, 0, 0)} />
        );
    };

    return (
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
                <gridHelper args={[20, 20, 0xff0000, 'teal']} />
            </Canvas>
        </div>
    )

}

export default Page

