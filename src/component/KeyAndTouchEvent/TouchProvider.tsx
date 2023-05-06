// タッチできるかどうかの判定(PC or モバイル)
import React from 'react';
import { createContext, useState, useContext, useEffect, SetStateAction } from 'react';

const TouchContext = createContext<Boolean>(false);

export function TouchProvider({ children }) {
    const [is_touch, setIs_touch] = useState<Boolean>(false)

    // タッチ対応端末かの判定
    useEffect(() => {
        if (typeof document !== 'undefined') {

            // コントローラー初期値設定
            // setIs_touch(state => {
            //     return {
            //         ...state,
            //         controllerX: 200,
            //         controllerY: window.innerHeight - 200,
            //     }
            // })

            const touch_event = 'touchstart' in document;
            const touch_points = navigator.maxTouchPoints;
            if (touch_event !== undefined && 0 < touch_points) {
                console.log("タッチ対応端末です");
                setIs_touch(true)
            } else {
                console.log("タッチ非対応です");
                setIs_touch(false)
            }
        }
    }, [])

    return (
        <TouchContext.Provider value={is_touch}>{children}</TouchContext.Provider>
    );
}

// TouchProvider下では，useTouchContextで，タッチ情報is_touchを参照可能
export const useTouchContext = () => useContext(TouchContext)