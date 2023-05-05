import type { NextPage } from 'next'
import {
  Heading,
  Box,
  Image,
  Text,
  Center,
} from '@chakra-ui/react'
import styles from '../styles/Home.module.css'
import React, { CSSProperties, Suspense } from 'react';

import { useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, Props, useLoader } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// --- 2Dモアイ回転 ---
// const text = 'モアイ像とは南太平洋に位置するイースター島（チリ領）にある巨石像のことを指します'
// const sizePx = 500
// const charStyle = (i: number) => {
//   return {
//     '--sizePx': `${sizePx}px`,
//     '--sizePx-50': `${sizePx - 50}px`,
//     '--sizePx-per2': `${sizePx / 2}px`,
//     '--rotateDeg': `${i}deg`
//   }
// }
// const sizeStyle: CSSProperties = {
//   '--sizePx': `${sizePx}px`,
//   '--sizePx-50': `${sizePx - 50}px`,
// }


const Page: NextPage = () => {


  // --- 2Dモアイ回転 ---
  // return (
  //   <div className={styles.circle} style={sizeStyle}>
  //     {/* <Center h='100%'> */}
  //     <Image
  //       src='/images/moai_normal.png'
  //       alt='moai'
  //       className={styles.logo}
  //       style={sizeStyle}
  //     />
  //     {/* </Center> */}
  //     <div className={styles.text}>
  //       {text.split('').map((char, i) => (
  //         <span key={i} className={styles.char} style={charStyle(i * 9)}>
  //           {char}
  //         </span>
  //       ))}
  //     </div>
  //   </div>
  // )

  const Model = () => {
    const colors = [{
      r: 0.7,
      g: 0.2,
      b: 0.2
    }, {
      r: 0.2,
      g: 0.7,
      b: 0.2
    }, {
      r: 0.2,
      g: 0.2,
      b: 0.7
    }];
    const models: THREE.Object3D<THREE.Event>[] = [];
    const gltf = useLoader(GLTFLoader, "/3d_images/moai_3.gltf");
    for (let i = 0; i < 3; i++) {
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
      <>
        <primitive object={models[0]} scale={0.1} position={[0, 1.5, 0]} rotation={new THREE.Euler(0, Math.PI / 2, 0)} />
        <primitive object={models[1]} scale={0.1} position={[0, 0, 0]} />
        <primitive object={models[2]} scale={0.1} position={[0, -1.5, 0]} rotation={new THREE.Euler(0, -Math.PI / 2, 0)} />
      </>
    );
  };

  return (
    <div className={styles.globe}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 7], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <spotLight intensity={5} angle={0.1} penumbra={1} position={[10, 15, 10]} color='#fff' castShadow />
        <Suspense fallback={null}>
          <Model />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={20.0} />
      </Canvas>
    </div>
  )

}

export default Page
