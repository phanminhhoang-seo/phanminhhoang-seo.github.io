document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize AOS Library
    AOS.init({
        duration: 1000, // Thời gian hiệu ứng mặc định (ms)
        once: true,     // Hiệu ứng chỉ chạy một lần khi cuộn qua
        mirror: false,  // Hiệu ứng không chạy lại khi cuộn lên
    });

    // 2. Typed.js Effect for Hero Title
    // Chuỗi tiếng Việt
    const typedStringsVi = [
        "Phan Minh Hoàng",
        "một chuyên gia SEO",
        "một chuyên gia tối ưu hóa tìm kiếm",
        "một người sáng tạo kỹ thuật số"
    ];
    // Chuỗi tiếng Anh
    const typedStringsEn = [
        "Phan Minh Hoang",
        "an SEO specialist",
        "a search optimization expert",
        "a digital creator"
    ];

    let currentTypedStrings;
    // Kiểm tra ngôn ngữ hiện tại của trang (dựa vào lang attribute trên thẻ html)
    if (document.documentElement.lang === 'vi') {
        currentTypedStrings = typedStringsVi;
    } else {
        currentTypedStrings = typedStringsEn;
    }

    // Initialize Typed.js nếu element tồn tại
    if (document.querySelector('.typing-animation')) {
        new Typed('.typing-animation', {
            strings: currentTypedStrings, // SỬ DỤNG CHUỖI NGÔN NGỮ ĐƯỢC CHỌN
            typeSpeed: 70, // Tốc độ gõ chữ
            backSpeed: 40, // Tốc độ xóa chữ
            loop: true,    // Lặp lại vô hạn
            showCursor: true,
            cursorChar: '|', // Ký tự con trỏ
        });
    }

    // 3. Mobile Menu Toggle - FIXED VERSION
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileToggle && mainNav) {
        // Toggle menu khi click hamburger
        mobileToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Đóng menu khi click vào link
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', function() {
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });

        // Đóng menu khi click ra ngoài (optional)
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !mainNav.contains(e.target)) {
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });

        // Đóng menu khi resize window (để tránh bug khi xoay máy)
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // 4. Smooth Scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Chỉ thực hiện smooth scroll nếu link nằm trên cùng trang
            if (this.pathname === window.location.pathname) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const headerOffset = document.querySelector('.global-header').offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20; // Thêm 20px padding

                    window.scrollTo({
                         top: offsetPosition,
                         behavior: "smooth"
                    });
                }
            }
            // Nếu là link ra trang khác (như blog.html), cứ để trình duyệt xử lý bình thường
        });
    });

    // 5. Animation cho các "dòng nước chảy" (water waves)
    function createWaterWaves() {
        const container = document.getElementById('animated-particles');
        if (!container) return; // Đảm bảo container tồn tại

        const numWaves = 15; // Số lượng dòng nước
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        for (let i = 0; i < numWaves; i++) {
            const waterWave = document.createElement('div');
            waterWave.classList.add('water-wave');

            // Kích thước ngẫu nhiên cho mỗi dòng nước
            const width = Math.random() * 60 + 30; // Từ 30px đến 90px
            const height = Math.random() * 40 + 20; // Từ 20px đến 60px
            waterWave.style.width = `${width}px`;
            waterWave.style.height = `${height}px`;

            // Vị trí bắt đầu ngẫu nhiên
            const startX = Math.random() * containerWidth - width / 2;
            const startY = Math.random() * containerHeight - height / 2;
            
            // Tạo path chảy ngẫu nhiên
            const flowDistance = Math.random() * 150 + 50; // Khoảng cách chảy
            const flowDirection = Math.random() * 360; // Hướng chảy ngẫu nhiên

            waterWave.style.left = `${startX}px`;
            waterWave.style.top = `${startY}px`;

            // Thời gian animation ngẫu nhiên
            const duration = Math.random() * 8 + 6; // Từ 6s đến 14s
            const delay = Math.random() * 3; // Độ trễ ngẫu nhiên

            // Set CSS custom properties cho animation
            waterWave.style.setProperty('--flow-distance', `${flowDistance}px`);
            waterWave.style.setProperty('--flow-direction', `${flowDirection}deg`);
            waterWave.style.animationDuration = `${duration}s`;
            waterWave.style.animationDelay = `${delay}s`;

            // Thêm opacity ngẫu nhiên
            const opacity = Math.random() * 0.4 + 0.2; // Từ 0.2 đến 0.6
            waterWave.style.opacity = opacity;

            container.appendChild(waterWave);
        }
    }

    // Gọi hàm tạo water waves khi trang tải xong
    createWaterWaves();

    // 6. Simple resize handler để đóng menu khi chuyển về desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            const mainNav = document.querySelector('.main-nav');
            if (mobileToggle && mainNav) {
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        }
    });

    // 7. Add CSS for water waves animation if not exists
    if (!document.querySelector('#water-wave-styles')) {
        const style = document.createElement('style');
        style.id = 'water-wave-styles';
        style.textContent = `
            .water-wave {
                position: absolute;
                background: linear-gradient(45deg, 
                    rgba(100, 149, 237, 0.6), 
                    rgba(135, 206, 235, 0.4),
                    rgba(70, 130, 180, 0.5));
                border-radius: 30% 70% 40% 60%;
                animation: waveFlow infinite ease-in-out;
                pointer-events: none;
                filter: blur(1px);
                box-shadow: 0 0 20px rgba(135, 206, 235, 0.3);
            }
            
            @keyframes waveFlow {
                0% { 
                    transform: translateX(0px) translateY(0px) rotate(0deg) scale(1);
                    border-radius: 30% 70% 40% 60%;
                    opacity: 0.3;
                }
                25% {
                    transform: translateX(20px) translateY(-10px) rotate(45deg) scale(1.1);
                    border-radius: 60% 40% 70% 30%;
                    opacity: 0.6;
                }
                50% { 
                    transform: translateX(var(--flow-distance, 50px)) translateY(-20px) rotate(90deg) scale(1.3);
                    border-radius: 40% 60% 30% 70%;
                    opacity: 0.4;
                }
                75% {
                    transform: translateX(30px) translateY(-5px) rotate(135deg) scale(1.1);
                    border-radius: 70% 30% 60% 40%;
                    opacity: 0.5;
                }
                100% { 
                    transform: translateX(0px) translateY(0px) rotate(180deg) scale(1);
                    border-radius: 30% 70% 40% 60%;
                    opacity: 0.3;
                }
            }

            /* Thêm hiệu ứng đặc biệt cho mệnh Thủy */
            .water-wave:nth-child(3n) {
                background: linear-gradient(135deg, 
                    rgba(30, 144, 255, 0.5),
                    rgba(0, 191, 255, 0.3),
                    rgba(173, 216, 230, 0.4));
                animation-direction: reverse;
            }

            .water-wave:nth-child(5n) {
                background: linear-gradient(225deg, 
                    rgba(72, 209, 204, 0.4),
                    rgba(64, 224, 208, 0.3),
                    rgba(175, 238, 238, 0.3));
                animation-duration: 12s !important;
            }

            .water-wave:hover {
                animation-play-state: paused;
                transform: scale(1.5) !important;
                opacity: 0.8 !important;
            }
        `;
        document.head.appendChild(style);
    }

    console.log('Portfolio website loaded successfully!');
});
