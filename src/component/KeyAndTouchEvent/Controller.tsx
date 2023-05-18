import { TypeControllerSize } from '@src/pages/play';
import styles from '@src/styles/Home.module.css'
import { MouseEvent, forwardRef, useRef, useImperativeHandle, useEffect } from 'react'
import { useTouchEvent } from '@src/component/KeyAndTouchEvent/useTouchEvent';

export interface TypeControllerRefs {
    ParentRef: React.RefObject<HTMLDivElement>;
    ChildRef: React.RefObject<HTMLDivElement>;
}

interface ControllerProps {
    controllerSize: React.MutableRefObject<TypeControllerSize>
}

// 長押しイベントを禁止
function handleContextMenu(evt: MouseEvent<HTMLDivElement>) {
    evt.preventDefault();
}

export const Controller = forwardRef<TypeControllerRefs, ControllerProps>(
    // (props, ref) => {
    function ControllerSetting({ controllerSize }, ref) {
        const ParentRef = useRef<HTMLDivElement>(null)
        const ChildRef = useRef<HTMLDivElement>(null)
        const touchMap = useTouchEvent() // タップ情報

        // refへのアクセスを制限
        useImperativeHandle(ref, () => ({
            ParentRef,
            ChildRef,
        }))

        // Player がJoinを押して，かつ認証が完了してuidが取得済みの時
        useEffect(() => {
            // コントローラー初期値設定
            const edgeSize = 30
            // コントローラーサイズを決定
            controllerSize.current.parent = (innerHeight >= innerWidth) ? (innerWidth / 3) : (innerHeight / 3)
            controllerSize.current.child = controllerSize.current.parent / 2
            // コントローラーの位置を決定
            touchMap.controllerX = edgeSize + controllerSize.current.parent / 2
            touchMap.controllerY = innerHeight - edgeSize - controllerSize.current.parent / 2

            // コントローラーの外枠の方(parent)の設定
            if (ParentRef.current) {
                ParentRef.current.style.width = `${controllerSize.current.parent}px`
                ParentRef.current.style.height = `${controllerSize.current.parent}px`
                ParentRef.current.style.left = `${touchMap.controllerX - controllerSize.current.parent / 2}px`
                ParentRef.current.style.top = `${touchMap.controllerY - controllerSize.current.parent / 2}px`
            }
            // コントローラーの内側(child, 操作して動く方)の設定
            if (ChildRef.current) {
                ChildRef.current.style.width = `${controllerSize.current.child}px`
                ChildRef.current.style.height = `${controllerSize.current.child}px`
                ChildRef.current.style.left = `${controllerSize.current.child / 2}px`
                ChildRef.current.style.top = `${controllerSize.current.child / 2}px`
            }
            // console.log("header height = ", headerHeight)

            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])


        return (
            <>
                <div
                    id='controller_parent'
                    ref={ParentRef}
                    className={styles.controllerParent}
                    onContextMenu={handleContextMenu}
                >
                    <div
                        onContextMenu={handleContextMenu}
                        id='controller_child'
                        className={styles.controllerChild}
                        ref={ChildRef}
                    >
                    </div>
                </div>
            </>
        )
    }
)