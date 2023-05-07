// Safariなどの上下スクロールなどを無効化
export const disablePullToRefresh = () => {

    const touchmoveHandler = (event: TouchEvent) => {
        event.preventDefault();
    };

    document.addEventListener("touchmove", touchmoveHandler, { passive: false });

    return () => {
        document.removeEventListener("touchmove", touchmoveHandler);
    };
};

// (メモ)---SafariなどのPull-to-refreshを無効化---
// export const disablePullToRefresh = () => {
//     let lastTouchY = 0;
//     let preventPullToRefresh = false;

//     const touchstartHandler = (event: TouchEvent) => {
//         if (event.touches.length !== 1) return; // 複数のタッチがあるときは中断
//         lastTouchY = event.touches[0].clientY; // タッチしたY座標を記録
//         preventPullToRefresh = window.pageYOffset === 0; // windowのスクロール位置が最上部のときはtrue
//     };

//     const touchmoveHandler = (event: TouchEvent) => {
//         const touchY = event.touches[0].clientY;
//         const touchYDelta = touchY - lastTouchY;
//         lastTouchY = touchY;

//         if (preventPullToRefresh) {
//             preventPullToRefresh = false;
//             if (touchYDelta > 0) {
//                 event.preventDefault();
//             }
//         }
//     };

//     document.addEventListener("touchstart", touchstartHandler, { passive: false });
//     document.addEventListener("touchmove", touchmoveHandler, { passive: false });

//     return () => {
//         document.removeEventListener("touchstart", touchstartHandler);
//         document.removeEventListener("touchmove", touchmoveHandler);
//     };
// };