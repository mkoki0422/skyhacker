document.addEventListener('DOMContentLoaded', function() {
    const createTextGroup = (isBlurred) => `
        <div class="text-group ${isBlurred ? 'blur-text' : ''}">
            <span>WHO ARE THE</span>
            <span>SKYHACKERS</span>
        </div>
    `.trim();

    // 5つのパターン: 通常/ぼかし/ぼかし/ぼかし/通常
    const textPattern = [
        createTextGroup(false),
        createTextGroup(true),
        createTextGroup(true),
        createTextGroup(false),
        createTextGroup(true)
    ].join('');

    const repeatCount = 4; // 基本パターンの繰り返し回数
    const initialContent = Array(repeatCount).fill(textPattern).join('');

    const scrollContainer = document.querySelector('.text-infinity-scroll');
    if (scrollContainer) {
        scrollContainer.innerHTML = '';
        
        const track = document.createElement('div');
        track.className = 'track';
        track.innerHTML = initialContent;
        
        scrollContainer.appendChild(track);

        // スクロール位置の監視と更新
        let scrollPosition = 0;
        const scrollSpeed = 1.5; // スクロール速度を少し遅く

        function updateScroll() {
            scrollPosition -= scrollSpeed;
            
            // スクロール位置が1パターン分を超えたら位置をリセット
            const patternWidth = track.firstElementChild.offsetWidth * 5; // 5つのグループで1パターン
            if (Math.abs(scrollPosition) >= patternWidth) {
                scrollPosition = 0;
            }

            track.style.transform = `translate3d(${scrollPosition}px, -50%, 0)`;
            requestAnimationFrame(updateScroll);
        }

        // アニメーション開始
        requestAnimationFrame(updateScroll);
    }
});

// ページの表示状態を監視
document.addEventListener('visibilitychange', function() {
    // タブが非表示の時はアニメーションを一時停止
    if (document.hidden) {
        document.body.classList.add('paused');
    } else {
        document.body.classList.remove('paused');
    }
});

// News scroll functionality
document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.querySelector('.news-scroll-container');
    const track = document.querySelector('.news-track');
    let isDragging = false;
    let startX;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = null;
    let lastTime = null;
    const SCROLL_SPEED = 0.05; // スクロール速度（ピクセル/ミリ秒）

    // 自動スクロール
    function autoScroll(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        if (!isDragging) {
            currentTranslate -= SCROLL_SPEED * deltaTime;
            // スクロール位置が最後まで行ったらリセット
            if (currentTranslate <= -track.offsetWidth / 2) {
                currentTranslate = 0;
            }
            track.style.transform = `translateX(${currentTranslate}px)`;
        }
        animationID = requestAnimationFrame(autoScroll);
    }

    const startDragging = (e) => {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        prevTranslate = currentTranslate;
        lastTime = null;
        cancelAnimationFrame(animationID);
    };

    const drag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const currentX = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
        track.style.transform = `translateX(${currentTranslate}px)`;
    };

    const stopDragging = () => {
        isDragging = false;
        lastTime = null;
        autoScroll(performance.now());
    };

    // Mouse events
    scrollContainer.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('mouseleave', stopDragging);

    // Touch events
    scrollContainer.addEventListener('touchstart', startDragging);
    scrollContainer.addEventListener('touchmove', drag);
    scrollContainer.addEventListener('touchend', stopDragging);

    // 初期の自動スクロール開始
    autoScroll(performance.now());
});
