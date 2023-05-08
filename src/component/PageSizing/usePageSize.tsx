// ヘッダーの高さやウィンドウサイズ設定
import { useState, useEffect } from 'react';

const pageSizeInfo = {
    headerHeight: 0,
    innerHeight: 0,
    innerWidth: 0,
    subscribers: new Set<(headerHeight: number, innerHeight: number, innerWidth: number) => void>(), // 高さ変更時に通知を受け取るコールバック関数のセット
};

export const usePageSize = () => {
    const [headerHeight, setHeaderHeight] = useState<number>(pageSizeInfo.headerHeight);
    const [innerHeight, setInnerHeight] = useState<number>(pageSizeInfo.innerHeight);
    const [innerWidth, setInnerWidth] = useState<number>(pageSizeInfo.innerWidth);

    useEffect(() => {
        const updateHeight = (newHeaderHeight: number, newInnerHeight: number, newInnerWidth: number) => {
            setHeaderHeight(newHeaderHeight);
            setInnerHeight(newInnerHeight);
            setInnerWidth(newInnerWidth);
        };
        pageSizeInfo.subscribers.add(updateHeight);

        return () => {
            pageSizeInfo.subscribers.delete(updateHeight);
        };
    }, []);

    const setPageInfo = (newHeaderHeight: number, newInnerHeight: number, newInnerWidth: number) => {
        pageSizeInfo.headerHeight = newHeaderHeight;
        pageSizeInfo.innerHeight = newInnerHeight;
        pageSizeInfo.innerWidth = newInnerWidth;
        for (const subscriber of pageSizeInfo.subscribers) {
            subscriber(newHeaderHeight, newInnerHeight, newInnerWidth);
        }
    };

    return [headerHeight, innerHeight, innerWidth, setPageInfo] as const;
};
