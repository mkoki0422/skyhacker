// Smooth Scroll Implementation
document.addEventListener('DOMContentLoaded', function() {
    const createTextGroup = (isBlurred) => `
        <div class="text-group ${isBlurred ? 'blur-text' : ''}">
            <span>WHO ARE THE</span>
            <span>#SKYHACKER</span>
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
    const membersFrame = document.querySelector('.members-section');
    const profilePopupOverlay = document.querySelector('.profile-popup-overlay');
    const firstProfileCard = document.querySelector('.main-profile');

    if (seeMembers) {
        seeMembers.addEventListener('click', () => {
            const rect = membersFrame.getBoundingClientRect();
            const scrollToPosition = window.pageYOffset + rect.top - 50; // Add some offset for better positioning

            window.scrollTo({
                top: scrollToPosition,
                behavior: 'smooth'
            });

            // スクロールアニメーション完了後にポップアップを表示
            setTimeout(() => {
                if (firstProfileCard) {
                    firstProfileCard.click();
                }
            }, 1000);
        });
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
            currentTranslate += velocity * 16;  // メンバーセクションと同じ感覚に調整
            velocity *= 0.99;  // メンバーセクションと同じ減衰率
            track.style.transform = `translateX(${currentTranslate}px)`;
            requestAnimationFrame(momentumScroll);
        } else {
            // 慣性スクロール終了後、自動スクロールを再開
            lastTime = null;
            autoScroll(performance.now());
        }
    }

    const startDragging = (e) => {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        lastX = startX;
        prevTranslate = currentTranslate;
        lastTime = null;
        velocity = 0;
        cancelAnimationFrame(animationID);
    };

    const drag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const currentX = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
        
        // 速度を計算
        const dx = currentX - lastX;
        const dt = 16; // 一般的なフレーム時間
        velocity = dx / dt * 0.12; // メンバーセクションと同じ速度係数

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
        { selector: '.instagram-section', direction: 'right' },
        { selector: '.footer-section', direction: 'right' }

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
    membersContent.style.overflow = 'hidden';
    membersContent.style.padding = '30px';
    membersContent.style.margin = '-30px';
    membersContent.style.cursor = 'grab';
    const membersSection = document.querySelector('.members-section');
    membersSection.style.overflow = 'visible';
    const membersFrame = document.querySelector('.members-frame');
    if (membersFrame) {
        membersFrame.style.overflow = 'visible';
    }

    // メンバーセクションのスムーススクロール関数
    function smoothScrollMembers() {
        if (!isScrolling) return;

        const friction = 0.95; // 摩擦係数を調整
        const threshold = 0.01; // 停止閾値

        // 速度による慣性スクロール
        currentScrollLeft += velocity;
        velocity *= friction;

        // スクロール位置を更新
        membersContent.scrollLeft = Math.round(currentScrollLeft);

        // 速度が閾値以下になったら停止
        if (Math.abs(velocity) < threshold) {
            isScrolling = false;
            cancelAnimationFrame(rafId);
            return;
        }

        rafId = requestAnimationFrame(smoothScrollMembers);
    }

    // メンバーカードのホバーエフェクト
    memberCards.forEach(card => {
        card.style.transition = 'all 0.3s ease';
        card.style.position = 'relative';
        card.style.willChange = 'transform';
        card.style.transformOrigin = 'center center';
        
        // PCのみホバーエフェクトを適用
        if (!('ontouchstart' in window)) {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.05)';
                card.style.zIndex = '100';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1)';
                card.style.zIndex = '1';
            });
        }
    });

    // タッチイベントハンドラー
    function handleTouchStart(e) {
        isDragging = true;
        startX = e.touches[0].pageX - membersContent.offsetLeft;
        lastX = startX;
        scrollLeft = membersContent.scrollLeft;
        currentScrollLeft = scrollLeft;
        targetScrollLeft = scrollLeft;
        velocity = 0;
        isScrolling = false;
        cancelAnimationFrame(rafId);
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const currentX = e.touches[0].pageX - membersContent.offsetLeft;
        
        // 速度を計算
        const dx = currentX - lastX;
        const dt = 16;
        velocity = dx / dt * 0.5;

        const diff = currentX - startX;
        currentScrollLeft = scrollLeft - diff;
        membersContent.scrollLeft = currentScrollLeft;
        
        lastX = currentX;
    }

    function handleTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        if (!isScrolling) {
            isScrolling = true;
            smoothScrollMembers();
        }
    }

    // タッチイベントリスナーを追加
    membersContent.addEventListener('touchstart', handleTouchStart, { passive: false });
    membersContent.addEventListener('touchmove', handleTouchMove, { passive: false });
    membersContent.addEventListener('touchend', handleTouchEnd);
    membersContent.addEventListener('touchcancel', handleTouchEnd);

    // マウスドラッグによる横スクロール（PCのみ）
    if (!('ontouchstart' in window)) {
        membersContent.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX - membersContent.offsetLeft;
            lastX = startX;
            scrollLeft = membersContent.scrollLeft;
            currentScrollLeft = scrollLeft;
            targetScrollLeft = scrollLeft;
            velocity = 0;
            isScrolling = false;
            cancelAnimationFrame(rafId);
            membersContent.style.cursor = 'grabbing';
        });

        membersContent.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const currentX = e.pageX - membersContent.offsetLeft;
            
            const dx = currentX - lastX;
            const dt = 16;
            velocity = dx / dt * 0.5;

            const diff = currentX - startX;
            currentScrollLeft = scrollLeft - diff;
            membersContent.scrollLeft = currentScrollLeft;
            
            lastX = currentX;
        });

        function startMomentumScroll() {
            if (!isDragging) return;
            isDragging = false;
            membersContent.style.cursor = 'grab';
            
            if (!isScrolling) {
                isScrolling = true;
                smoothScrollMembers();
            }
        }

        membersContent.addEventListener('mouseup', startMomentumScroll);
        membersContent.addEventListener('mouseleave', startMomentumScroll);
    }

    // 横スクロールの処理
    function handleHorizontalScroll(e) {
        const maxScroll = membersContent.scrollWidth - membersContent.clientWidth;
        const currentScroll = membersContent.scrollLeft;
        const deltaY = e.deltaY;

        if (currentScroll >= maxScroll - 1 && deltaY > 0) {
            return;
        }
        
        if (currentScroll <= 1 && deltaY < 0) {
            return;
        }

        e.preventDefault();
        const scrollMultiplier = 0.6;
        const adjustedDeltaY = deltaY * scrollMultiplier;

        velocity = adjustedDeltaY * 0.12;
        currentScrollLeft = membersContent.scrollLeft;
        
        if (!isScrolling) {
            isScrolling = true;
            smoothScrollMembers();
        }
    }

    membersContent.addEventListener('wheel', handleHorizontalScroll, { passive: false });

    function resetScroll() {
        currentScrollLeft = membersContent.scrollLeft;
        targetScrollLeft = currentScrollLeft;
        velocity = 0;
    }

    window.addEventListener('resize', resetScroll);
    resetScroll();
});

// Profile popup functionality
document.addEventListener('DOMContentLoaded', function() {
    const members = [
       {
            name: "TAICHIRO　YAMASHITA",
            japaneseName: "山下 太一朗",
            role: "Chief PILOT",
            description: "佐賀県佐賀市出身/京都市在住。京都大学法学部進学後、中退。熱気球チーム#skyhackerを主宰。（一社）日本気球連盟 理事。（一社）日本熱気球事業協会 理事。プロパイロットとして熱気球に関する事業を行う。熱気球競技日本代表。（22年日本選手権準優勝）",
            image: "media/yamashita.png"
        },
        {
            name: "KOYOI　TSUJII",
            japaneseName: "辻井 今宵",
            role: "Ground Chief Crew / Planner",
            description: "滋賀県出身/東京在住。世界選手権出場経験もある父を持つ二世気球人。語学力を活かし世界中に気球ネットワークを持つ。#skyhackerでは地上チームのマネジメントと広報を担当。熱気球世界選手権代表クルー参加多数。普段は広告会社でプロモーションプランナーとして活動。",
            image: "media/koyoi.jpg"
        },
        {
            name: "YUMA　SAKAEDA",
            japaneseName: "榮枝 由真",
            role: "Weather Chief / PILOT",
            description: "佐賀大学理工学部卒、2020年FUKAP入社。オペレーションマネジメント部所属。学生時代から熱気球パイロット/インストラクターとして活動。2016年熱気球世界選手権では気象サポートを行う。#skyhackerでは気象分析と戦略立案を担当。",
            image: "media/yuma.png"
        },
        {
            name: "KENICHIRO　TAMAI",
            japaneseName: "玉井 健一郎",
            role: "Ground Crew / PILOT",
            description: "学生時代から宮崎大学気球部でパイロットとして活動。2021年熱気球ジュニア世界選手権の出場を皮切りに、日本各地でのフライト経験を積む。#skyhackerでは戦略立案と上空交信を行い、サブパイロットとしてフライト支援を行っている。普段は地元大分で農業改良普及員として公務に勤める。",
            image: "media/tamaken.jpg"
        },
        {
            name: "KOKI　MINAMI",
            japaneseName: "南 宏樹",
            role: "Ground Crew / System Engineer",
            description: "鹿児島県出身/埼玉県在住。都内IT企業でエンジニアとして活動。ウイングスーツベースジャンパーとして国内外でジャンプを重ねる一方、#skyhackerではドライバーを担当する。複数のスカイスポーツに関わることで得た幅広い経験と視点を持つ。",
            image: "media/koki.png"
        },
        {
            name: "MAMI　KOYAMA",
            japaneseName: "小山 真実",
            role: "Ground Crew",
            description: "大阪府出身/大阪府在住。奈良女子大学住環境学科を卒業後、大学職員として建築系業務に従事。学生時代は大学の気球部に所属し、現在は#skyhackerのクルーとして気球の組み立てなどを担当。服飾サークル所属経験から、ミシン技術を球皮の修理などに活かす方法を模索中。",
            image: "media/koyamami.png"
        },
        {
            name: "MOTOAKI　INUKAI",
            japaneseName: "犬飼 基耀",
            role: "Weather Crew / PILOT",
            description: "神奈川県出身/宮城県在住。東北大学工学部出身で化学工学を専攻。メンバー唯一の現役大学院生。パイロットの資格を保有し、学生ながら世界選手権にクルーとして複数参加。全日本学生選手権の大会実行委員長を勤めた経験もある。#skyhackerでは気象分析を担当。",
            image: "media/inu.png"
        },
        {
            name: "KENICHI　KURIYAMA",
            japaneseName: "栗山 健一",
            role: "Creative Director / Filmmaker",
            description: "2012年に上京し20歳よりディレクターとしてフリーランスの活動を始める。MV、WEBCM、テレビ番組、ショートフィルム、映画等に関わりオールジャンルでの映像製作に携わる。企画から監督、撮影、編集、納品まで個人でもこなし、作品を世に発信している。",
            image: "media/kenichi.png"
        }
    ];

    const overlay = document.querySelector('.profile-popup-overlay');
    const profileCards = document.querySelectorAll('.main-profile, .profile-small');
    const closeButton = document.querySelector('.profile-popup-nav .close-button');
    const prevButton = document.querySelector('.nav-left');
    const nextButton = document.querySelector('.nav-right');

    const popupImage = document.querySelector('.profile-popup-image');
    const popupName = document.querySelector('.profile-popup-text h1');
    const popupJName = document.querySelector('.profile-popup-jname');
    const popupRole = document.querySelector('.profile-popup-info');
    const popupDescription = document.querySelector('.profile-popup-description p');

    let currentProfileIndex = 0;

    function showProfile(index, direction = null) {
        const card = document.querySelector('.profile-popup-card');
        const profileData = members[index];
        
        if (!profileData) return;

        // コンテンツを即座に更新
        updateProfileContent(profileData);
        
        // アニメーションクラスを追加
        if (direction === 'prev') {
            card.classList.add('slide-right');
        } else if (direction === 'next') {
            card.classList.add('slide-left');
        }

        // アニメーション完了後にクラスを削除
        card.addEventListener('animationend', () => {
            card.classList.remove('slide-left', 'slide-right');
        }, { once: true });
    }

    function updateProfileContent(data) {
        // アニメーションをスムーズにするためにopacityを使用
        const contentElements = [popupName, popupJName, popupRole, popupDescription, popupImage];
        
        // コンテンツを一旦非表示に
        contentElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.2s ease';
        });
        
        // 少し遅延させてから新しいコンテンツを表示
        setTimeout(() => {
            popupName.innerHTML = data.name.replace(" ", "<br>");
            popupJName.textContent = data.japaneseName;
            popupRole.textContent = data.role;
            popupDescription.textContent = data.description;
            
            popupImage.style.backgroundImage = `url(${data.image})`;
            popupImage.style.backgroundSize = "cover";
            popupImage.style.backgroundPosition = "center";
            
            // コンテンツを表示
            contentElements.forEach(el => {
                el.style.opacity = '1';
            });
        }, 100);
    }

    // メインプロフィールと小さいプロフィールカードのクリックイベント
    profileCards.forEach((card, index) => {
        // 空のスロットは無視
        if (!card.querySelector('img')) return;
        
        card.addEventListener('click', () => {
            const imgSrc = card.querySelector('img').getAttribute('src');
            // 画像のsrcからメンバーのインデックスを見つける
            const memberIndex = members.findIndex(member => member.image === imgSrc);
            if (memberIndex !== -1) {
                currentProfileIndex = memberIndex;
                showProfile(currentProfileIndex);
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    prevButton.addEventListener('click', () => {
        currentProfileIndex = (currentProfileIndex - 1 + members.length) % members.length;
        showProfile(currentProfileIndex, 'prev');
    });

    nextButton.addEventListener('click', () => {
        currentProfileIndex = (currentProfileIndex + 1) % members.length;
        showProfile(currentProfileIndex, 'next');
    });

    closeButton.addEventListener('click', () => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const newsOverlay = document.querySelector('.news-popup-overlay');
    const newsPopupTitle = document.querySelector('.news-popup-title');
    const newsPopupDate = document.querySelector('.news-popup-date');
    const newsPopupDescription = document.querySelector('.news-popup-description');
    const newsPopupImage = document.querySelector('.news-popup-image');
    const newsCloseButton = document.querySelector('.news-close-button');

    const newsCards = document.querySelectorAll('.news-card');

    newsCards.forEach(card => {
        card.addEventListener('click', function () {
            const title = card.querySelector('.news-description').textContent;
            const date = card.querySelector('.news-date').textContent;
            const imageSrc = card.querySelector('.news-image').src;

            // ポップアップの内容を更新
            newsPopupTitle.textContent = title;
            newsPopupDate.textContent = date;
            newsPopupImage.style.backgroundImage = `url(${imageSrc})`;
            newsPopupImage.style.backgroundSize = 'cover';
            newsPopupImage.style.backgroundPosition = 'center';
            newsPopupDescription.textContent = "ここに詳細を記載できます。"; // 追加の詳細を後で設定

            // ポップアップを表示
            newsOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // 背景スクロールを防止
        });
    });

    // 閉じるボタンの処理
    newsCloseButton.addEventListener('click', function () {
        newsOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // オーバーレイクリックで閉じる
    newsOverlay.addEventListener('click', function (e) {
        if (e.target === newsOverlay) {
            newsOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ESCキーで閉じる
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && newsOverlay.classList.contains('active')) {
            newsOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});


// フッターナビゲーションのスムーズスクロール
document.addEventListener('DOMContentLoaded', function() {
    const footerLinks = document.querySelectorAll('.footer-nav a');
    
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const rect = targetSection.getBoundingClientRect();
                const absoluteTop = window.pageYOffset + rect.top;
                const offset = 0; // 必要に応じてオフセットを調整

                window.scrollTo({
                    top: absoluteTop - offset,
                    behavior: 'smooth'
                });
            }
        });
    });
});
