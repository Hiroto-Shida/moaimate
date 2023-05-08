// タップ情報の設定
import React, { useRef } from 'react';
import { createContext, useState, useContext, useEffect, SetStateAction } from 'react';
import { disablePullToRefresh } from './disablePullToRefresh';

export type TypeTouchState = {
    is_tapController: Boolean // コントローラーをタッチしたか否か
    x: number; // コントローラー中心からのx座標
    y: number; // コントローラー中心からのy座標
    angle: number // コントローラーの操作角度
    controllerX: number; // コントローラー中心x座標
    controllerY: number; // コントローラー中心y座標
    controllerTouchId: number
}
const initialTouchState: TypeTouchState = {
    is_tapController: false,
    x: 0,
    y: 0,
    angle: 0,
    controllerX: 0,
    controllerY: 0,
    controllerTouchId: -1,
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

        const cleanup = disablePullToRefresh() // スマホの余計なスクロールを無効化
        return () => {
            cleanup()
        }
        // }
    }, [])

    // タッチ情報の取得
    useEffect(() => {
        // スクリーン触り始めのイベント処理
        const touchStartScreen = (e: TouchEvent) => {
            const targetElement = e.target as HTMLElement
            if ((targetElement.id == 'controller_parent') || (targetElement.id == 'controller_child')) {
                // console.log("tap target!!")
                // console.log("start e = ", e.touches.length)
                if (touchMap.current.controllerTouchId == -1) {
                    // const nowTouchId = e.touches[e.touches.length - 1].identifier
                    const nowTouchId = e.touches[0].identifier
                    touchMap.current.controllerTouchId = nowTouchId

                    touchMap.current.is_tapController = true
                    touchMap.current.x = e.touches[0].clientX - touchMap.current.controllerX
                    touchMap.current.y = e.touches[0].clientY - touchMap.current.controllerY
                    touchMap.current.angle = Math.atan2(e.touches[0].clientY - touchMap.current.controllerY, e.touches[0].clientX - touchMap.current.controllerX)
                }
            }
        }

        // スクリーンを触って移動中のイベント処理
        const touchMoveScreen = (e: TouchEvent) => {
            let tmpFlag = false
            for (const touch of e.changedTouches) {
                if (touch.identifier == touchMap.current.controllerTouchId) {
                    tmpFlag = true
                    break
                }
            }
            if (tmpFlag) {
                touchMap.current.x = e.touches[0].clientX - touchMap.current.controllerX
                touchMap.current.y = e.touches[0].clientY - touchMap.current.controllerY
                touchMap.current.angle = Math.atan2(e.touches[0].clientY - touchMap.current.controllerY, e.touches[0].clientX - touchMap.current.controllerX)
            }
            // console.log('move', touchInfo.x, touchInfo.y);
            // console.log("move e = ", e.touches.length)
        }

        // スクリーンから離したときのイベント処理
        const touchEndScreen = (e: TouchEvent) => {
            if (touchMap.current.controllerTouchId !== -1) {

                let tmpFlag = false
                for (const touch of e.changedTouches) {
                    if (touch.identifier == touchMap.current.controllerTouchId) {
                        tmpFlag = true
                        break
                    }
                }
                if (tmpFlag) {
                    touchMap.current.controllerTouchId = -1
                    touchMap.current.is_tapController = false
                    touchMap.current.x = 0
                    touchMap.current.y = 0
                }
            }
            // console.log('end e = ', e.touches.length)
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