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
    });

    document.getElementById("enter-code").addEventListener("click", () => {
        const partyCode = prompt("Enter party code:");
        if (partyCode) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/join-game';

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'partyCode';
            input.value = partyCode.toUpperCase();

            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        }
    });

    const scanQRBtn = document.getElementById("scan-qr");
    const qrScanner = document.getElementById("qrScanner");
    const video = document.getElementById("videoElement");
    let stream;

    scanQRBtn.addEventListener("click", async () => {
        qrScanner.style.display = "block";

        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = stream;
            video.setAttribute("playsinline", true);
            video.play();
            scanQRCode(video);
        } catch (err) {
            console.error("Camera error:", err);
        }
    });

    function scanQRCode(video) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const checkQRCode = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

                const code = jsQR(imageData.data, canvas.width, canvas.height);
                if (code) {
                    stopStream();
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = '/join-game';

                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'partyCode';
                    input.value = code.data;

                    form.appendChild(input);
                    document.body.appendChild(form);
                    form.submit();
                    return;
                }
            }
            requestAnimationFrame(checkQRCode);
        };

        checkQRCode();
    }

    function stopStream() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
});