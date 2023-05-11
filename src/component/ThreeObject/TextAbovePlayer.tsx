// 2Dテキスト
import { Text } from '@react-three/drei';
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider';

export const TextAbovePlayer = () => {
    // const textRef = useRotate([0, 0.1, 0])
    const font_data = '/fonts/MPLUS1p-Bold.woff'
    const user = useAuthContext() // ユーザ情報の取得

    return (
        <Text
            // ref={textRef}
            color="#100"
            fontSize={0.2}
            maxWidth={10}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign={'center'}
            font={font_data}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#ffffff"
        >
            {user?.user.username}
        </Text>
    )
}