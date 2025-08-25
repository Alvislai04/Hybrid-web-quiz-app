$(document).ready(function () {
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
        if (window.anime) {
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
        } else {
            modal.style.opacity = 1;
        }
    });

    function closeModal() {
        if (window.anime) {
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
        } else {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    }

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => e.target === modal && closeModal());
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });

    function fetchScoreboard() {
        const partyCode = window.partyCode || $('#scoreboard-list').data('partycode') || $('#player-list').data('partycode');
        const currentPlayer = $('h2').text().replace('Hello, ', '').replace('!', '');

        $.get('/get-scoreboard', { partyCode }, function (data) {
            data.sort((a, b) => b.score - a.score);

            let listHtml = '';
            data.forEach((player, i) => {
                const isCurrent = player.name === currentPlayer;
                const isHost = player.isHost;
                const streak = player.streak || 0;

                let icon = '';
                if (i === 0) icon = '🥇';
                else if (i === 1) icon = '🥈';
                else if (i === 2) icon = '🥉';

                let streakClass = '';
                if (streak >= 5) {
                    streakClass = 'streak-strong';
                    if (isCurrent && window.confetti) {
                        confetti({
                            particleCount: 200,
                            spread: 90,
                            origin: { y: 0.6 },
                        });
                    }
                } else if (streak >= 3) {
                    streakClass = 'streak-highlight';
                }

                listHtml += `
                    <li class="score-entry${isCurrent ? ' current-player' : ''} ${streakClass}">
                        <span class="player-name${streak >= 5 ? ' streak-glow' : ''}">${icon} ${isHost ? '👑 ' : ''}${player.name}</span>
                        <span class="player-score">${player.score} pts</span>
                        <span class="player-streak">${streak >= 1 ? `🔥 x${streak}` : ''}</span>
                    </li>
                `;

            });
            $('#scoreboard-list').html(listHtml);
        }).fail(() => {
            $('#scoreboard-list').html('<li class="score-entry">Failed to load scoreboard</li>');
        });
    }

    function checkGameEnded() {
        const partyCode = new URLSearchParams(window.location.search).get('partyCode');

        if (!partyCode) return;

        fetch(`/check-game-ended?partyCode=${partyCode}`)
            .then(response => response.json())
            .then(data => {
                if (data.gameEnded) {
                    window.location.href = `/win?partyCode=${partyCode}`;
                }
            })
            .catch(error => console.error('Error checking game status:', error));
    }

    fetchScoreboard();
    setInterval(fetchScoreboard, 3000);
    setInterval(checkGameEnded, 2000);
});

function startScanner() {
    if (!window.Html5Qrcode) {
        alert("QR scanner library not loaded!");
        return;
    }

    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        (decodedText) => {
            html5QrCode.stop().then(() => {
                const cardId = decodedText.trim();
                const partyCode = window.partyCode;
                window.location.href = `/card/${cardId}?partyCode=${partyCode}`;

            }).catch(err => {
                console.error("Failed to stop scanner:", err);
            });
        }
    ).catch(err => {
        alert("Unable to start QR scanner: " + err);
    });
}
