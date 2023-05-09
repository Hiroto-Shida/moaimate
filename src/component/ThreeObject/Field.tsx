// フィールド,地面コンポーネント
export const Field = () => {
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
            <mesh position={[9.5, 0.1, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#555" />
            </mesh>
        </>
    )
}