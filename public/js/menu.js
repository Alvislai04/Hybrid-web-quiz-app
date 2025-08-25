document.addEventListener("DOMContentLoaded", () => {
    const bubbles = document.querySelectorAll(".bubble");
    bubbles.forEach(bubble => {
        bubble.style.left = `${Math.random() * 100}vw`;
        bubble.style.width = `${Math.random() * 40 + 20}px`;
        bubble.style.height = bubble.style.width;
        bubble.style.animationDuration = `${Math.random() * 10 + 15}s`;
        bubble.style.opacity = Math.random() * 0.5 + 0.2;
        bubble.style.setProperty('--x-pos', `${Math.random() * 100 - 50}px`);
    });

    const howToPlayLink = document.querySelector(".how-to-play-link");
    const modal = document.getElementById("how-to-play-modal");
    const modalClose = document.querySelector(".modal-close");

    howToPlayLink.addEventListener("click", (e) => {
        e.preventDefault();
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";

        anime({
            targets: modal,
            opacity: [0, 1],
            duration: 300,
            easing: 'easeInOutQuad'
        });

        anime({
            targets: modal.querySelector('.modal-content'),
            scale: [0.9, 1],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutBack'
        });
    });

    function closeModal() {
        anime({
            targets: modal,
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInOutQuad',
            complete: () => {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });
    }

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => e.target === modal && closeModal());

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });

    const title = document.querySelector("h1");
    if (title) {
        title.addEventListener("mouseover", () => {
            anime({
                targets: title,
                color: "#ffd700",
                scale: 1.05,
                duration: 300,
                easing: 'easeInOutQuad'
            });
        });

        title.addEventListener("mouseout", () => {
            anime({
                targets: title,
                color: "#fff",
                scale: 1,
                duration: 300
            });
        });
    }

    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(button => {
        button.addEventListener("mouseenter", () => {
            anime({
                targets: button,
                scale: 1.05,
                backgroundColor: '#ffffff',
                color: '#111d5e',
                duration: 200,
                easing: 'easeOutQuad'
            });
        });

        button.addEventListener("mouseleave", () => {
            anime({
                targets: button,
                scale: 1,
                backgroundColor: '#ffd700',
                color: '#111d5e',
                duration: 200
            });
        });

        button.addEventListener("click", (e) => {
            e.preventDefault();

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            button.appendChild(ripple);

            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            setTimeout(() => ripple.remove(), 600);

            setTimeout(() => {
                if (button.id === "new-game") {
                    window.location.href = "/new-game";
                } else if (button.id === "join-party") {
                    window.location.href = "/join-party";
                } else if (button.textContent.trim() === "View History") {
                    window.location.href = "/history";
                }
            }, 200);
        });
    });

    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("mouseenter", () => {
            anime({
                targets: logoutBtn,
                scale: 1.05,
                duration: 200
            });
        });

        logoutBtn.addEventListener("mouseleave", () => {
            anime({
                targets: logoutBtn,
                scale: 1,
                duration: 200
            });
        });

        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
        });
    }

    const username = localStorage.getItem('username') || 'Player';
    const welcomeElement = document.querySelector('.welcome-banner p');
    if (welcomeElement) {
        anime({
            targets: welcomeElement,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            easing: 'easeOutQuad',
            delay: 300
        });
    }
});
