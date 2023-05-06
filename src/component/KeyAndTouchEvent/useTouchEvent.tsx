// タッチできるかどうかの判定(PC or モバイル)
import React, { useRef } from 'react';
import { createContext, useState, useContext, useEffect, SetStateAction } from 'react';

export type TypeTouchState = {
    is_tapController: Boolean // コントローラーをタッチしたか否か
    x: number; // コントローラー中心からのx座標
    y: number; // コントローラー中心からのy座標
    angle: number // コントローラーの操作角度
    controllerX: number; // コントローラー中心x座標
    controllerY: number; // コントローラー中心y座標
}
const initialTouchState: TypeTouchState = {
    is_tapController: false,
    x: 0,
    y: 0,
    angle: 0,
    controllerX: 0,
    controllerY: 0,
}


export function useTouchEvent() {
    // const [touchInfo, setTouchInfo] = useState<TypeTouchState>(initialTouchState)
    const touchMap = useRef<TypeTouchState>(initialTouchState)

    // コントローラー初期値設定
    useEffect(() => {
        // if (typeof document !== 'undefined') {

        // コントローラー初期値設定
        touchMap.current.controllerX = 200
        touchMap.current.controllerY = window.innerHeight - 200
        console.log('controller setting 1')

        // }
    }, [])

    // タッチ情報の取得
    useEffect(() => {
        // スクリーン触り始めのイベント処理
        const touchStartScreen = (e: TouchEvent) => {
            const targetElement = e.target as HTMLElement
            if ((targetElement.id == 'controller_parent') || (targetElement.id == 'controller_child')) {
                // console.log("tap target!!")
                touchMap.current.is_tapController = true
                touchMap.current.x = e.touches[0].clientX - touchMap.current.controllerX,
                    touchMap.current.y = e.touches[0].clientY - touchMap.current.controllerY,
                    touchMap.current.angle = Math.atan2(e.touches[0].clientY - touchMap.current.controllerY, e.touches[0].clientX - touchMap.current.controllerX)
            }
        }

        // スクリーンを触って移動中のイベント処理
        const touchMoveScreen = (e: TouchEvent) => {
            touchMap.current.x = e.touches[0].clientX - touchMap.current.controllerX,
                touchMap.current.y = e.touches[0].clientY - touchMap.current.controllerY,
                touchMap.current.angle = Math.atan2(e.touches[0].clientY - touchMap.current.controllerY, e.touches[0].clientX - touchMap.current.controllerX)
            // console.log('move', touchInfo.x, touchInfo.y);
        }

        // スクリーンから離したときのイベント処理
        const touchEndScreen = (e: TouchEvent) => {
            touchMap.current.is_tapController = false
            touchMap.current.x = 0
            touchMap.current.y = 0
            // console.log('end', touchInfo.x, touchInfo.y);
        }
        document.addEventListener('touchmove', touchMoveScreen)
        document.addEventListener('touchend', touchEndScreen)
        document.addEventListener('touchstart', touchStartScreen)

        return () => { // cleanupの処理(アンマウント)：マウント時の処理を消す
            document.removeEventListener('touchstart', touchStartScreen)
            document.removeEventListener('touchmove', touchMoveScreen)
            document.removeEventListener('touchend', touchEndScreen)
        }
    })
    return touchMap.current
}