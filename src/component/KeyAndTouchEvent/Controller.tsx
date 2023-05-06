import styles from '@src/styles/Home.module.css'
import { MouseEvent, forwardRef, useRef, useImperativeHandle } from 'react'

export interface TypeControllerRefs {
    ParentRef: React.RefObject<HTMLDivElement>;
    ChildRef: React.RefObject<HTMLDivElement>;
}

// 長押しイベントを禁止
function handleContextMenu(evt: MouseEvent<HTMLDivElement>) {
    evt.preventDefault();
}

export const Controller = forwardRef<TypeControllerRefs, {}>((props, ref) => {
    const ParentRef = useRef<HTMLDivElement>(null)
    const ChildRef = useRef<HTMLDivElement>(null)

    // refへのアクセスを制限
    useImperativeHandle(ref, () => ({
        ParentRef,
        ChildRef,
    }))

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
})