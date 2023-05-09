// 2Dテキスト
import { Text } from '@react-three/drei';

export const TextAbovePlayer = () => {
    // const textRef = useRotate([0, 0.1, 0])
    const text = 'hogehoge'
    const font_data = '/fonts/MPLUS1p-Bold.woff'

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
            {text}
        </Text>
    )
}