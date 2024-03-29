import { useFrame, useLoader } from '@react-three/fiber';
import useKeyboard from '@src/component/KeyAndTouchEvent/useKeyboard';
import { useRef } from 'react';
import * as THREE from 'three'
import { useTouchEvent } from '@src/component/KeyAndTouchEvent/useTouchEvent';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextAbovePlayer } from '@src/component/ThreeObject/TextAbovePlayer';
import { getDatabase, onChildAdded, onValue, push, set, ref } from '@firebase/database'
import { GlobalAuthState, useAuthContext } from '@src/feature/auth/provider/AuthProvider';
import { FirebaseError } from 'firebase/app';
import { CameraControls } from '@react-three/drei';
import { TypeControllerRefs } from '@src/component/KeyAndTouchEvent/Controller';
import { TypeSetPlayersInfo } from '@src/pages/play';

type Props = {
    CameraControlRef: React.MutableRefObject<CameraControls | null>
    ControllerRef: React.MutableRefObject<TypeControllerRefs | null>
    controllerSize: React.MutableRefObject<{ parent: number; child: number; }>
    is_touch: Boolean
    user: GlobalAuthState
    uuid: string
}

// 自分のキャラプレイヤー
export const MainPlayer = ({ CameraControlRef, ControllerRef, controllerSize, is_touch, user, uuid }: Props) => {
    // console.log("-- MainPlayer component rendering --")

    const cameraPos = new THREE.Vector3() // カメラの座標
    const MoaiRef = useRef<THREE.Mesh>(null!) // モアイref情報
    const TextRef = useRef<THREE.Mesh>(null!) // テキストref情報
    const tmpPos = { x: 0, z: 0 }
    const touchMap = useTouchEvent() // タップ情報
    const keyMap = useKeyboard() // 押しているキーボード保持
    // const user = useAuthContext() // ユーザ情報の取得

    const sendPlayerData = async () => {
        try {
            // databaseを参照して取得
            const db = getDatabase()
            // const dbRef_play = ref(db, `play/${user.userinfo?.uid}`)
            const dbRef_play = ref(db, `play/${uuid}`)
            const message: TypeSetPlayersInfo = {
                // 'is_exist': true,
                x: Math.round(MoaiRef.current.position.x * 100) / 100,
                z: Math.round(MoaiRef.current.position.z * 100) / 100,
                angle: Math.round(MoaiRef.current.rotation.y * 100) / 100,
                name: user.username
            }
            await set(dbRef_play, message)
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.log(e)
            }
        }
    }

    // モアイの位置座標処理(キーボード in PC)
    const updateMoaiPos = (directionAngle: number, delta: number) => {

        const cameraAzimuthAngle: number | undefined = CameraControlRef.current?.azimuthAngle // カメラの角度を取得

        // モアイのx,z座標を設定
        MoaiRef.current.position.z -= Math.cos((cameraAzimuthAngle ?? 0) + directionAngle) * 3 * delta
        MoaiRef.current.position.x -= Math.sin((cameraAzimuthAngle ?? 0) + directionAngle) * 3 * delta
        // テキストのx,z座標を設定
        TextRef.current.position.z = MoaiRef.current.position.z
        TextRef.current.position.x = MoaiRef.current.position.x

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
        sendPlayerData()
    }

    const updateTextAngle = () => {
        const cameraAzimuthAngle: number | undefined = CameraControlRef.current?.azimuthAngle // カメラの角度を取得
        if (TextRef.current) {
            TextRef.current.rotation.y = (cameraAzimuthAngle ?? 0)
            // console.log(TextRef.current)
        }
    }

    // デバッグ用
    // const checkPos = (delta: number) => {
    //     // CameraControlRef.current?.getPosition(cameraPos) // カメラの座標を取得
    //     // console.log(cameraPos.y)
    //     // console.log('cameraRef = ', CameraControlRef.current?.active)
    //     console.log('keyboard = ', keyMap)
    // }

    // joystickコントローラー(スマホ)操作時の処理
    const updateController = (delta: number) => {
        if (touchMap.is_tapController) { // コントローラを触っている時
            const cameraAzimuthAngle: number | undefined = CameraControlRef.current?.azimuthAngle // カメラの角度を取得
            const tmpAngle = -touchMap.angle + (cameraAzimuthAngle ?? 0)
            // console.log("tmpAngle", tmpAngle)
            MoaiRef.current.rotation.y = tmpAngle // モアイの角度設定
            MoaiRef.current.position.z += Math.cos(tmpAngle + Math.PI / 2) * 3 * delta // モアイのz座標を設定
            MoaiRef.current.position.x += Math.sin(tmpAngle + Math.PI / 2) * 3 * delta // モアイのx座標を設定
            // テキストのx,z座標を設定
            TextRef.current.rotation.y = tmpAngle // テキストの角度設定
            TextRef.current.position.z = MoaiRef.current.position.z // テキストのz座標を設定
            TextRef.current.position.x = MoaiRef.current.position.x // テキストのx座標を設定
            // console.log('moai X,Z = ', MoaiRef.current.position.x, MoaiRef.current.position.z)

            // コントローラーの位置設定
            if (ControllerRef.current && ControllerRef.current.ChildRef.current) {
                // コントローラーの円からはみ出ないような設定
                const tmpR = Math.sqrt(touchMap.x ** 2 + touchMap.y ** 2)
                let tmpMag: number = 1
                if (tmpR > controllerSize.current.parent / 2) {
                    tmpMag = tmpR / (controllerSize.current.parent / 2)
                }
                ControllerRef.current.ChildRef.current.style.left = `${controllerSize.current.child / 2 + (touchMap.x) / tmpMag}px`
                ControllerRef.current.ChildRef.current.style.top = `${controllerSize.current.child / 2 + (touchMap.y) / tmpMag}px`
            }

            // カメラ準備設定
            CameraControlRef.current?.getPosition(cameraPos) // カメラの座標を取得
            const tmpCameraAngle = (cameraAzimuthAngle ?? 0) + Math.PI
            const tmpCameraX = -7 * Math.sin(tmpCameraAngle) // カメラの角度からx軸のベクトルに分解
            const tmpCameraZ = -7 * Math.cos(tmpCameraAngle) // カメラの角度からz軸のベクトルに分解
            // カメラの座標と見る方向の設定
            CameraControlRef.current?.setPosition(MoaiRef.current.position.x + tmpCameraX, cameraPos.y, MoaiRef.current.position.z + tmpCameraZ, true) // カメラの座標
            CameraControlRef.current?.setTarget(MoaiRef.current.position.x, MoaiRef.current.position.y, MoaiRef.current.position.z, true) // カメラの見る方向
            sendPlayerData()
        } else {
            // コントローラーの位置設定(初期位置に設定)
            if (ControllerRef.current && ControllerRef.current.ChildRef.current) {
                ControllerRef.current.ChildRef.current.style.left = `${controllerSize.current.child / 2}px`
                ControllerRef.current.ChildRef.current.style.top = `${controllerSize.current.child / 2}px`
            }
        }
    }

    // フレームごとの処理
    useFrame((_, delta: number) => {
        is_touch && (updateController(delta)); // タップ操作が可能な場合に処理
        // keyMap['Space'] && (checkPos(delta)); // デバッグ用
        // (checkPos(delta)); // デバッグ用
        (CameraControlRef.current?.active) && (updateTextAngle())
        keyMap['KeyW'] && (updateMoaiPos(0, delta)); // 上
        keyMap['KeyS'] && (updateMoaiPos(Math.PI, delta)); // 下
        keyMap['KeyD'] && (updateMoaiPos(-Math.PI / 2, delta)); // 右
        keyMap['KeyA'] && (updateMoaiPos(Math.PI / 2, delta)); // 左
        (keyMap['KeyA'] || keyMap['KeyS'] || keyMap['KeyD'] || keyMap['KeyA']) && updateMoaiAngle(); // 斜め処理のため必要
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
        <>
            <mesh position={[0, 1.5, 0]} ref={TextRef}>
                <TextAbovePlayer
                    username={user.username}
                />
            </mesh>
            <primitive ref={MoaiRef} object={models[0]} scale={0.1} position={new THREE.Vector3(0, 0.7, 0)} />
        </>
    );
};