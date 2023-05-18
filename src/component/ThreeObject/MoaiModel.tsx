import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three'
import { useRef } from 'react';

interface Props {
    colors: {
        r: number;
        g: number;
        b: number;
    }
    position: number[]
    rotation: number[]
    speed: number
}

export const MoaiModel = ({ colors, position, rotation, speed }: Props) => {
    const gltf = useLoader(GLTFLoader, "/3d_images/moai_3.gltf");
    const model: THREE.Object3D<THREE.Event> = gltf.scene.clone();
    const MoaiModelRef = useRef<THREE.Mesh>(null!) // モアイref情報

    const expansionMoaiForm = (e) => {
        MoaiModelRef.current.scale.x = 0.13
        MoaiModelRef.current.scale.y = 0.13
        MoaiModelRef.current.scale.z = 0.13
        speed += 2
    }
    const shrinkMoaiForm = (e) => {
        MoaiModelRef.current.scale.x = 0.1
        MoaiModelRef.current.scale.y = 0.1
        MoaiModelRef.current.scale.z = 0.1
        speed -= 2
    }

    useFrame(({ clock }) => {
        MoaiModelRef.current.rotation.y = clock.getElapsedTime() * speed * 2
    })

    model.traverse((object) => {
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
                    object.material.color.r = colors.r * 0.1;
                    object.material.color.g = colors.g * 0.1;
                    object.material.color.b = colors.b * 0.1;
                } else { // その他(メインカラー)の色設定
                    object.material = object.material.clone() // 同一のマテリアルを参照しているようなので複製したものを代入
                    object.material.color.r = colors.r;
                    object.material.color.g = colors.g;
                    object.material.color.b = colors.b;
                }
            }
        }
    })

    return (
        <>
            <primitive
                ref={MoaiModelRef}
                onPointerOver={(e) => expansionMoaiForm(e)}
                onPointerOut={(e) => shrinkMoaiForm(e)}
                object={model}
                scale={0.1}
                position={position}
                rotation={rotation}
            />
        </>
    );
};