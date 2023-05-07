// ヘッダーの高さ設定
import { useState, useEffect } from 'react';

const headerHeightState = {
    height: 0,
    subscribers: new Set<(height: number) => void>(),
};

export const useHeaderHeight = () => {
    const [height, setHeight] = useState<number>(0);

    useEffect(() => {
        const updateHeight = (newHeight: number) => {
            setHeight(newHeight);
        };
        headerHeightState.subscribers.add(updateHeight);

        return () => {
            headerHeightState.subscribers.delete(updateHeight);
        };
    }, []);

    const setHeaderHeight = (newHeight: number) => {
        headerHeightState.height = newHeight;
        for (const subscriber of headerHeightState.subscribers) {
            subscriber(newHeight);
        }
    };

    return [height, setHeaderHeight] as const;
};
