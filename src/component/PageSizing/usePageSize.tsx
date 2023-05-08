// ヘッダーの高さやウィンドウサイズ設定
import { useState, useEffect } from 'react';

const pageSizeInfo = {
    headerHeight: 0,
    innerHeight: 0,
    subscribers: new Set<(headerHeight: number, innerHeight: number) => void>(), // 高さ変更時に通知を受け取るコールバック関数のセット
};

export const usePageSize = () => {
    const [headerHeight, setHeaderHeight] = useState<number>(pageSizeInfo.headerHeight);
    const [innerHeight, setInnerHeight] = useState<number>(pageSizeInfo.innerHeight);

    useEffect(() => {
        const updateHeight = (newHeaderHeight: number, newInnerHeight: number) => {
            setHeaderHeight(newHeaderHeight);
            setInnerHeight(newInnerHeight);
        };
        pageSizeInfo.subscribers.add(updateHeight);

        return () => {
            pageSizeInfo.subscribers.delete(updateHeight);
        };
    }, []);

    const setPageInfo = (newHeaderHeight: number, newInnerHeight: number) => {
        pageSizeInfo.headerHeight = newHeaderHeight;
        pageSizeInfo.innerHeight = newInnerHeight;
        for (const subscriber of pageSizeInfo.subscribers) {
            subscriber(newHeaderHeight, newInnerHeight);
        }
    };

    return [headerHeight, innerHeight, setPageInfo] as const;
};
