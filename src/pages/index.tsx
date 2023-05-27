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
import { CameraControls, Environment, OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { usePageSize } from '@src/component/PageSizing/usePageSize';
import { MoaiModel } from '@src/component/ThreeObject/MoaiModel';

const Page: NextPage = () => {

  useEffect(() => {
    const uuid = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function changeString() {
      return ((new Date().getTime() + Math.random() * 16) % 16 | 0).toString(16);
    });
    console.log(uuid)
    // setGuestUuid(uuid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ヘッダーの高さ，ページサイズ取得
  const [headerHeight, innerHeight,] = usePageSize();
  const canvasStyles = {
    height: `${innerHeight - headerHeight - 10}px`, // ヘッダーの高さ，ページサイズでCanvasサイズを調整
  }

  const modelinfo = [
    {
      color: {
        r: 0.7,
        g: 0.2,
        b: 0.2
      },
      position: [0, 1.5, 0],
      rotation: [0, Math.PI / 2, 0],
      speed: 1,
    },
    {
      color: {
        r: 0.2,
        g: 0.7,
        b: 0.2
      },
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      speed: 2,
    },
    {
      color: {
        r: 0.2,
        g: 0.2,
        b: 0.7
      },
      position: [0, -1.5, 0],
      rotation: [0, -Math.PI / 2, 0],
      speed: 3,
    },
  ];

  return (
    <div className={styles.topGlobe} style={canvasStyles}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 7], fov: 50 }}>
        <CameraControls />
        <ambientLight intensity={0.7} />
        <spotLight intensity={5} angle={0.1} penumbra={1} position={[10, 15, 10]} color='#fff' castShadow />
        <Suspense fallback={null}>
          {modelinfo.map((model, index) => {
            return (
              <MoaiModel
                colors={model.color}
                position={model.position}
                rotation={model.rotation}
                speed={model.speed}
                key={index}
              />
            )
          })}
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )

}

export default Page
