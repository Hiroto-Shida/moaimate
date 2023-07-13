import type { NextPage } from 'next'
import { useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Raycaster, Vector2, Intersection } from 'three';
import { CameraControls } from '@react-three/drei';

interface IntersectionExampleProps { }

const IntersectionExample: React.FC<IntersectionExampleProps> = () => {
    const { camera, scene } = useThree();
    const raycaster = useRef<Raycaster>(new Raycaster());
    const [intersections, setIntersections] = useState<Intersection[]>([]);

    const handleMouseClick = (event) => {
        const mouse = new Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.current.setFromCamera(mouse, camera);
        const intersects = raycaster.current.intersectObjects(scene.children, true);
        setIntersections(intersects);
    };

    useFrame(() => {
        // ここではオブジェクトのアニメーションや更新処理を行います
    });

    return (
        <>
            <mesh onClick={(e) => handleMouseClick(e)}>
                {/* レイが交差する可能性のあるオブジェクト */}
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="red" />
            </mesh>

            {/* intersectionsを使用して交差したオブジェクトに対する操作を行う */}
            {intersections.map((intersection, index) => (
                <mesh
                    key={index}
                    position={intersection.point}
                    scale={0.1}
                >
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial color="green" />
                </mesh>
            ))}
        </>
    );
};

// export default IntersectionExample;


const Page: NextPage = () => {
    return (
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 7], fov: 50 }}>
            <CameraControls />
            <IntersectionExample />
        </Canvas>
    )

}

export default Page