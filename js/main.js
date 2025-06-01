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
const hamburger = document.querySelector('.hamburger');
const mainNav = document.querySelector('.main-nav');
if (hamburger && mainNav) {
    hamburger.addEventListener('click', function() {
        console.log('Hamburger clicked');
        mainNav.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            mainNav.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });
}const hamburger = document.querySelector('.hamburger');
const mainNav = document.querySelector('.main-nav');
if (hamburger && mainNav) {
    hamburger.addEventListener('click', function() {
        console.log('Hamburger clicked');
        mainNav.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            mainNav.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });
}const hamburger = document.querySelector('.hamburger');
const mainNav = document.querySelector('.main-nav');
if (hamburger && mainNav) {
    hamburger.addEventListener('click', function() {
        console.log('Hamburger clicked');
        mainNav.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            mainNav.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });
}const hamburger = document.querySelector('.hamburger');
const mainNav = document.querySelector('.main-nav');
if (hamburger && mainNav) {
    hamburger.addEventListener('click', function() {
        console.log('Hamburger clicked');
        mainNav.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            mainNav.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });
}
