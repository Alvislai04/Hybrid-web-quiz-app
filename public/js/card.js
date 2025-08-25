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

  const radios = document.querySelectorAll('input[type="radio"][name="answer"]');
  const submitBtn = document.querySelector('button[type="submit"]');
  const form = document.getElementById("quiz-form");
  const resultBox = document.getElementById("result-message");
  const successSound = document.getElementById("success-sound");
  const errorSound = document.getElementById("error-sound");

  let hasSubmittedAnswer = false;

  submitBtn.disabled = true;

  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      submitBtn.disabled = false;
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hasSubmittedAnswer = true;

    const selectedAnswer = document.querySelector('input[name="answer"]:checked').value;
    const cardId = window.location.pathname.split("/card/")[1];

    const body = new URLSearchParams();
    body.append('answer', selectedAnswer);
    body.append('playerID', playerID);

    try {
      const response = await fetch(`/answer?id=${cardId}`, {
        method: "POST",
        body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const result = await response.json();

      resultBox.innerHTML = '';
      resultBox.style.marginTop = "20px";
      resultBox.style.fontSize = "1.4rem";
      resultBox.style.fontWeight = "bold";
      resultBox.style.textAlign = "center";

      if (result.redirect) {
        resultBox.innerHTML = "🏆 You won the game!";
        resultBox.style.color = "#00ff99";
        if (successSound) successSound.play();
        triggerConfetti();
        redirectToWinner(result.redirect);
        return;
      }

      if (result.correct) {
        resultBox.innerHTML = "🎉 Correct! Good Job!";
        resultBox.style.color = "#00ff99";
        if (successSound) successSound.play();
        triggerConfetti();
      } else {
        resultBox.innerHTML = `❌ Incorrect. Try again next time.<br><span class="correct-answer-text">Correct Answer: ${result.correctAnswer}</span>`;
        resultBox.style.color = "#ff5555";
        if (errorSound) errorSound.play();
      }

      radios.forEach(r => r.disabled = true);
      submitBtn.disabled = true;

      startCountdown(`/start?partyCode=${partyCode}`);

    } catch (err) {
      console.error("Error submitting answer:", err);
      resultBox.innerHTML = "⚠️ Error. Please try again.";
      resultBox.style.color = "#ffa500";
    }
  });

  const checkScoreInterval = setInterval(async () => {
    if (!hasSubmittedAnswer) return;

    try {
      const response = await fetch(`/check-score?playerID=${playerID}`);
      const data = await response.json();

      if (data.score >= 200) {
        if (resultBox.innerText.includes("Correct") || resultBox.innerText.includes("Incorrect")) return;

        clearInterval(checkScoreInterval);
        if (successSound) successSound.play();
        triggerConfetti();

        resultBox.innerHTML = "🏆 You reached 200 points!";
        resultBox.style.color = "#00ff99";
        resultBox.style.fontSize = "1.4rem";
        resultBox.style.fontWeight = "bold";
        resultBox.style.textAlign = "center";

        startCountdown(`/win?partyCode=${partyCode}`);
      }

    } catch (error) {
      console.error("Error checking score:", error);
    }
  }, 3000);

  function startCountdown(targetUrl) {
    let countdown = 3;

    const countdownElement = document.createElement("div");
    countdownElement.style.marginTop = "10px";
    countdownElement.style.color = "#ffffff";
    countdownElement.style.fontSize = "1.1rem";
    countdownElement.id = "countdown-text";
    countdownElement.innerText = `Redirecting in ${countdown}...`;

    const spinner = document.createElement("div");
    spinner.className = "redirect-spinner";

    resultBox.appendChild(countdownElement);
    resultBox.appendChild(spinner);

    const interval = setInterval(() => {
      countdown--;
      countdownElement.innerText = `Redirecting in ${countdown}...`;
      if (countdown === 0) {
        clearInterval(interval);
        document.querySelector(".content-box").classList.add("fade-out");
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 1000);
      }
    }, 1000);
  }

  function redirectToWinner(url) {
    startCountdown(url);
  }

  function triggerConfetti() {
    if (window.confetti) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }
});
