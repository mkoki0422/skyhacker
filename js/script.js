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

    // See Membersボタンのスクロール機能
    const seeMembers = document.querySelector('.see-members-button');
    const membersFrame = document.querySelector('.members-frame');
    const profilePopupOverlay = document.querySelector('.profile-popup-overlay');
    const firstProfileCard = document.querySelector('.profile-main');

    seeMembers.addEventListener('click', () => {
        const rect = membersFrame.getBoundingClientRect();
        const absoluteTop = window.pageYOffset + rect.top;
        const windowHeight = window.innerHeight;
        const scrollToPosition = absoluteTop - (windowHeight - rect.height) / 2;

        window.scrollTo({
            top: scrollToPosition,
            behavior: 'smooth'
        });

        // スクロールアニメーション完了後にポップアップを表示
        setTimeout(() => {
            // 最初のメンバーのプロファイルを表示
            const event = new Event('click');
            firstProfileCard.dispatchEvent(event);
        }, 1000); // スクロールアニメーションの完了を待つ
    });
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
    const newsCards = track.querySelectorAll('.news-card');
    let isDragging = false;
    let startX;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = null;
    let lastTime = null;
    let velocity = 0;
    let lastX;
    const SCROLL_SPEED = 0.05;

    // スクロールコンテナのオーバーフロー設定を変更
    scrollContainer.style.overflow = 'visible';
    track.style.overflow = 'visible';

    // ホバーエフェクトの追加
    newsCards.forEach(card => {
        // カードの初期スタイル設定
        card.style.transition = 'all 0.3s ease';
        card.style.position = 'relative';
        
        card.addEventListener('mouseenter', () => {
            // ホバーエフェクトを追加
            card.style.transform = 'scale(1.05)';
            card.style.zIndex = '10';
        });

        card.addEventListener('mouseleave', () => {
            // ホバーエフェクトを解除
            card.style.transform = 'scale(1)';
            card.style.zIndex = '1';
        });
    });

    // 自動スクロール
    function autoScroll(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        if (!isDragging) {
            currentTranslate -= SCROLL_SPEED * deltaTime;
            
            // カードの合計幅を計算
            const cardWidth = track.querySelector('.news-card').offsetWidth;
            const gap = parseFloat(getComputedStyle(track).gap);
            const numberOfCards = track.children.length;
            const totalWidth = (cardWidth + gap) * numberOfCards;
            const containerWidth = scrollContainer.offsetWidth;
            
            // 最後のカードが完全に画面外に出たらリセット
            if (Math.abs(currentTranslate) >= totalWidth + containerWidth) {
                currentTranslate = 0;
            }
            
            track.style.transform = `translateX(${currentTranslate}px)`;
        }
        animationID = requestAnimationFrame(autoScroll);
    }

    // 慣性スクロールのアニメーション
    function momentumScroll() {
        if (Math.abs(velocity) > 0.01) {
            currentTranslate += velocity * 16;
            velocity *= 0.95;  // 減衰率を調整

            // スクロール範囲の制限
            const maxScroll = track.scrollWidth - track.clientWidth;
            currentTranslate = Math.max(0, Math.min(currentTranslate, maxScroll));
            
            track.style.transform = `translateX(${currentTranslate}px)`;
            requestAnimationFrame(momentumScroll);
        } else {
            velocity = 0;
        }
    }

    const startDragging = (e) => {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        lastX = startX;
        prevTranslate = currentTranslate;
        lastTime = null;
        cancelAnimationFrame(animationID);
    };

    const drag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const currentX = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
        
        // 速度を計算
        const dx = currentX - lastX;
        const dt = 16; // 一般的なフレーム時間
        velocity = dx / dt * 0.12; // Newsセクションと同じ速度係数

        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
        track.style.transform = `translateX(${currentTranslate}px)`;
        
        lastX = currentX;
    };

    const stopDragging = () => {
        if (!isDragging) return;
        isDragging = false;
        
        // 慣性スクロールを開始
        momentumScroll();
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

// セクションのフェードインアニメーション
document.addEventListener('DOMContentLoaded', () => {
    const sections = [
        { selector: '.statement', direction: 'left' },
        { selector: '.members-section', direction: 'right' },
        { selector: '.image-section', direction: 'left' },
        { selector: '.news-section', direction: 'right' },
        { selector: '.schedule-section', direction: 'left' },
        { selector: '.instagram-section', direction: 'right' }
    ];

    // 各セクションにアニメーションクラスを追加
    sections.forEach(({ selector, direction }) => {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add(`fade-in-${direction}`);
        }
    });

    // Intersection Observerの設定
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-active');
                observer.unobserve(entry.target); // 一度表示されたら監視を解除
            }
        });
    }, {
        threshold: 0.2, // 20%見えたらアニメーション開始
        rootMargin: '0px'
    });

    // 各セクションを監視
    sections.forEach(({ selector }) => {
        const element = document.querySelector(selector);
        if (element) {
            observer.observe(element);
        }
    });
});

// ローディング画面の制御
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const main = document.querySelector('main');
    const mainBanner = document.querySelector('.main-banner');

    // 画像の読み込みを待つ
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            main.classList.add('loaded');
            
            // ローディング画面を完全に削除
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                // メインバナーをフェードイン
                mainBanner.classList.add('fade-in');
            }, 500);
        }, 1500);
    });
});

// Members section scroll control
document.addEventListener('DOMContentLoaded', function() {
    const MathUtils = {
        lerp: (a, b, n) => (1 - n) * a + n * b,
        map: (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c
    };

    const membersContent = document.querySelector('.members-content');
    const memberCards = document.querySelectorAll('.profile-main, .profile-small');
    let targetScrollLeft = 0;
    let currentScrollLeft = 0;
    let velocity = 0;
    let isScrolling = false;
    let rafId = null;
    let isDragging = false;
    let startX;
    let scrollLeft;
    let lastX;

    // メンバーコンテンツのスタイル設定
    membersContent.style.overflow = 'hidden';  // スクロール用に hidden に変更
    membersContent.style.padding = '30px';     // 拡大時の余白を確保
    membersContent.style.margin = '-30px';     // 余白分のオフセットを設定
    const membersSection = document.querySelector('.members-section');
    membersSection.style.overflow = 'visible'; // セクション全体を visible に
    const membersFrame = document.querySelector('.members-frame');
    membersFrame.style.overflow = 'visible';   // フレーム全体を visible に

    // メンバーカードのホバーエフェクト
    memberCards.forEach(card => {
        // カードの初期スタイル設定
        card.style.transition = 'all 0.3s ease';
        card.style.position = 'relative';
        card.style.willChange = 'transform';  // パフォーマンス最適化
        card.style.transformOrigin = 'center center';  // 変形の中心を設定
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
            card.style.zIndex = '100';  // より確実に上に表示されるように
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
            card.style.zIndex = '1';
        });
    });

    // Members drag scroll
    membersContent.addEventListener('mousedown', (e) => {
        isDragging = true;
        membersContent.classList.add('active');
        startX = e.pageX - membersContent.offsetLeft;
        lastX = startX;
        scrollLeft = membersContent.scrollLeft;
        currentScrollLeft = scrollLeft;
        targetScrollLeft = scrollLeft;
        velocity = 0;
        cancelAnimationFrame(rafId);
    });

    membersContent.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            membersContent.classList.remove('active');
            momentumScroll();
        }
    });

    membersContent.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            membersContent.classList.remove('active');
            momentumScroll();
        }
    });

    membersContent.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const currentX = e.pageX - membersContent.offsetLeft;
        
        // 速度を計算
        const dx = currentX - lastX;
        const dt = 16; // 一般的なフレーム時間
        velocity = dx / dt * 0.12; // Newsセクションと同じ速度係数

        const diff = currentX - startX;
        currentScrollLeft = scrollLeft - diff;
        targetScrollLeft = currentScrollLeft;
        membersContent.scrollLeft = currentScrollLeft;
        
        lastX = currentX;
    });

    // 慣性スクロールのアニメーション
    function momentumScroll() {
        if (Math.abs(velocity) > 0.01) {
            currentScrollLeft += velocity * 16;
            velocity *= 0.95;  // 減衰率を調整

            // スクロール範囲の制限
            const maxScroll = membersContent.scrollWidth - membersContent.clientWidth;
            currentScrollLeft = Math.max(0, Math.min(currentScrollLeft, maxScroll));
            
            targetScrollLeft = currentScrollLeft;
            membersContent.scrollLeft = currentScrollLeft;
            
            requestAnimationFrame(momentumScroll);
        } else {
            velocity = 0;
        }
    }

    // 横スクロールの処理
    function handleHorizontalScroll(e) {
        const maxScroll = membersContent.scrollWidth - membersContent.clientWidth;
        const currentScroll = membersContent.scrollLeft;
        const deltaY = e.deltaY;

        // 右端でさらに右にスクロールしようとした場合
        if (currentScroll >= maxScroll - 1 && deltaY > 0) {
            return; // デフォルトの縦スクロールを許可
        }
        
        // 左端でさらに左にスクロールしようとした場合
        if (currentScroll <= 1 && deltaY < 0) {
            return; // デフォルトの縦スクロールを許可
        }

        // それ以外の場合は横スクロール
        e.preventDefault();
        const scrollMultiplier = 0.6;
        const adjustedDeltaY = deltaY * scrollMultiplier;

        velocity = adjustedDeltaY * 0.12;
        targetScrollLeft += adjustedDeltaY;

        if (!isScrolling) {
            isScrolling = true;
            currentScrollLeft = membersContent.scrollLeft;
            cancelAnimationFrame(rafId);
            smoothScroll();
        }
    }

    // メンバーコンテンツ内のホイールイベント
    membersContent.addEventListener('wheel', handleHorizontalScroll, { passive: false });

    // スクロール位置のリセット
    function resetScroll() {
        currentScrollLeft = membersContent.scrollLeft;
        targetScrollLeft = currentScrollLeft;
        velocity = 0;
    }

    window.addEventListener('resize', resetScroll);
    
    // 初期状態のチェック
    resetScroll();
});

// Profile popup functionality
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.querySelector('.profile-popup-overlay');
    const profileCards = document.querySelectorAll('.profile-main, .profile-small');
    const closeButton = document.querySelector('.profile-popup-nav .close-button');
    const prevButton = document.querySelector('.nav-left');
    const nextButton = document.querySelector('.nav-right');
    let currentProfileIndex = 0;

    // プロフィール表示を更新
    function showProfile(index, direction = null) {
        const card = document.querySelector('.profile-popup-card');
        
        // アニメーションクラスを追加
        if (direction === 'prev') {
            card.classList.add('slide-right');
        } else if (direction === 'next') {
            card.classList.add('slide-left');
        }

        // アニメーションの途中（不透明度が0の時）でコンテンツを更新
        setTimeout(() => {
            const profileData = getProfileData(index);
            updateProfileContent(profileData);
        }, 250); // アニメーションの半分の時間

        // アニメーション完了後にクラスを削除
        card.addEventListener('animationend', () => {
            card.classList.remove('slide-left', 'slide-right');
        }, { once: true });
    }

    // 前のメンバーを表示
    prevButton.addEventListener('click', () => {
        currentProfileIndex = (currentProfileIndex - 1 + profileCards.length) % profileCards.length;
        showProfile(currentProfileIndex, 'prev');
    });

    // 次のメンバーを表示
    nextButton.addEventListener('click', () => {
        currentProfileIndex = (currentProfileIndex + 1) % profileCards.length;
        showProfile(currentProfileIndex, 'next');
    });

    // プロフィールカードクリックでポップアップを表示
    profileCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            currentProfileIndex = index;
            showProfile(currentProfileIndex);
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // スクロール防止
        });
    });

    function getProfileData(index) {
        // ここで各メンバーのデータを返す
        // 実際のデータは別途管理する必要があります
        return {
            image: profileCards[index].style.backgroundImage,
            // 他のプロフィール情報も必要に応じて追加
        };
    }

    function updateProfileContent(data) {
        const popupImage = document.querySelector('.profile-popup-image');
        if (data.image) {
            popupImage.style.backgroundImage = data.image;
        }
        // 他のプロフィール情報の更新もここで行う
    }

    // X CLOSEボタンクリックでポップアップを非表示
    closeButton.addEventListener('click', () => {
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // スクロール再開
    });

    // オーバーレイクリックでポップアップを非表示
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // スクロール再開
        }
    });

    // ESCキーでポップアップを非表示
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // スクロール再開
        }
    });
});
