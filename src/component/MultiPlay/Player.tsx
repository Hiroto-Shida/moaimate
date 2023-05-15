import { useFrame, useLoader } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextAbovePlayer } from '@src/component/ThreeObject/TextAbovePlayer';
import { CameraControls } from '@react-three/drei';
import { useMultiPlayerInfo } from '@src/component/MultiPlay/useMultiPlayerInfo';

type Props = {
    user_id: string
    MainPlayerCameraRef: React.MutableRefObject<CameraControls | null>
}

// プレイヤー
export const Player = ({ user_id, MainPlayerCameraRef }: Props) => {
    // console.log("-- Player component rendering --")
    const usersInfoRef = useMultiPlayerInfo() // playページの参加プレイヤーの情報
    const PlayerRef = useRef<THREE.Mesh>(null!) // モアイref情報
    const TextRef = useRef<THREE.Mesh>(null!) // テキストref情
    const [username, setUserName] = useState<string>('noname')

    const updatePlayerInfo = () => {
        const cameraAzimuthAngle: number | undefined = MainPlayerCameraRef.current?.azimuthAngle // カメラの角度を取得
        if (user_id in usersInfoRef) {
            if (username !== usersInfoRef[user_id].name) {
                setUserName(usersInfoRef[user_id].name)
            }
            PlayerRef.current.position.x = usersInfoRef[user_id].x
            PlayerRef.current.position.z = usersInfoRef[user_id].z
            PlayerRef.current.rotation.y = usersInfoRef[user_id].angle

            TextRef.current.position.x = usersInfoRef[user_id].x
            TextRef.current.position.z = usersInfoRef[user_id].z
            TextRef.current.rotation.y = (cameraAzimuthAngle ?? 0)
            // console.log('player2 angle = ', usersInfoRef[user_id].angle)
        }
    }

    // フレームごとの処理
    useFrame((_, delta: number) => {
        updatePlayerInfo();
    })

    // モアイ(キャラ生成)
    const colors = {
        r: 0.3,
        g: 0.7,
        b: 0.2
    };
    const gltf = useLoader(GLTFLoader, "/3d_images/moai_3.gltf");
    const model: THREE.Object3D<THREE.Event> = gltf.scene.clone(); // モデルを複製
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
            <mesh position={[0, 1.5, 0]} ref={TextRef}>
                <TextAbovePlayer
                    username={username}
                />
            </mesh>
            <primitive
                ref={PlayerRef}
                object={model}
                scale={0.1}
                position={new THREE.Vector3(5, 0.7, 0)}
            />
        </>
    );
};