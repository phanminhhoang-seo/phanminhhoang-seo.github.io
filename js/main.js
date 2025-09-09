document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize AOS Library
    AOS.init({
        duration: 1000, // Thời gian hiệu ứng mặc định (ms)
        once: true,     // Hiệu ứng chỉ chạy một lần khi cuộn qua
        mirror: false,  // Hiệu ứng không chạy lại khi cuộn lên
    });
    // Thêm đoạn này vào file main.js hiện tại
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('#main-nav');

    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', function() {
            mobileToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        // Close menu when clicking on nav links
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileToggle.contains(event.target) && !mainNav.contains(event.target)) {
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('active');
            }
    

    // Rest of existing code...
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

    // 3. Smooth Scrolling for navigation links (e.g., "Xem dự án của tôi")
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

    // 4. Animation cho các "vòng tròn ngôi sao" (particles)
    function createParticles() {
        const container = document.getElementById('animated-particles');
        if (!container) return; // Đảm bảo container tồn tại

        const numParticles = 30; // Số lượng "ngôi sao" muốn tạo
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            // Kích thước ngẫu nhiên cho mỗi ngôi sao
            const size = Math.random() * 8 + 2; // Từ 2px đến 10px
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            // Vị trí bắt đầu ngẫu nhiên (gần trung tâm)
            const startX = Math.random() * containerWidth * 0.4 + containerWidth * 0.3 - containerWidth / 2;
            const startY = Math.random() * containerHeight * 0.4 + containerHeight * 0.3 - containerHeight / 2;

            // Vị trí kết thúc ngẫu nhiên (rộng hơn)
            const endX = Math.random() * containerWidth * 1.5 - containerWidth / 2 * 0.5; // Xa hơn tâm
            const endY = Math.random() * containerHeight * 1.5 - containerHeight / 2 * 0.5; // Xa hơn tâm

            // Thời gian animation ngẫu nhiên
            const duration = Math.random() * 8 + 4; // Từ 4s đến 12s
            const delay = Math.random() * 5; // Độ trễ ngẫu nhiên để các ngôi sao không bay cùng lúc

            particle.style.setProperty('--start-x', `${startX}px`);
            particle.style.setProperty('--start-y', `${startY}px`);
            particle.style.setProperty('--end-x', `${endX}px`);
            particle.style.setProperty('--end-y', `${endY}px`);
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;

            container.appendChild(particle);
        }
    }

    // Gọi hàm tạo particles khi trang tải xong
    createParticles();

    // Các phần code comment cũ (reveal-item) có thể được giữ nguyên hoặc xóa
    /*
    const revealItems = document.querySelectorAll('.reveal-item');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    revealItems.forEach(item => {
        observer.observe(item);
    });
    */
});
