document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize AOS Library
    AOS.init({
        duration: 1000, // Thời gian hiệu ứng mặc định (ms)
        once: true,     // Hiệu ứng chỉ chạy một lần khi cuộn qua
        mirror: false,  // Hiệu ứng không chạy lại khi cuộn lên
    });

    // 2. Typed.js Effect for Hero Title
    const typedStrings = [
        "Phan Minh Hoàng", // Tên của bạn
        "một nhà phát triển web",
        "một chuyên gia SEO",
        "một người sáng tạo kỹ thuật số"
    ];

    if (document.querySelector('.typing-animation')) {
        new Typed('.typing-animation', {
            strings: typedStrings,
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
            e.preventDefault(); // Ngăn chặn hành vi mặc định của link

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth' // Cuộn mượt
                });
            }
        });
    });

    // Lưu ý: Hiệu ứng reveal-item thủ công không còn cần thiết nếu bạn dùng AOS cho mọi thứ.
    // Nếu bạn muốn giữ lại hiệu ứng reveal-item cho một số phần tử không dùng AOS,
    // hãy bỏ comment đoạn code dưới đây và thêm class 'reveal-item' thủ công.
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
// 4. Mobile Menu Toggle
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;

    // Create a new div element for the overlay
    const mobileMenuOverlay = document.createElement('div');
    mobileMenuOverlay.classList.add('mobile-menu-overlay');
    document.body.appendChild(mobileMenuOverlay); // Append it to the body

    function toggleMobileMenu() {
        mainNav.classList.toggle('is-active');
        hamburgerMenu.classList.toggle('is-active'); // Optional: change icon if needed
        body.classList.toggle('menu-open'); // To disable scroll and show overlay
    }

    // Toggle menu when hamburger is clicked
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', toggleMobileMenu);
    }

    // Close menu when a navigation link is clicked
    document.querySelectorAll('#main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('is-active')) {
                toggleMobileMenu(); // Close menu if it's open
            }
        });
    });

    // Close menu when clicking outside (on the overlay)
    mobileMenuOverlay.addEventListener('click', () => {
        if (mainNav.classList.contains('is-active')) {
            toggleMobileMenu(); // Close menu if it's open
        }
    });

    // Optional: Close menu if window is resized above mobile breakpoint (e.g., desktop view)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mainNav.classList.contains('is-active')) {
            toggleMobileMenu();
        }
    });
