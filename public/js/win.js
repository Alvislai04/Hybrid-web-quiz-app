$(document).ready(function () {
  if (window.confetti) {
    confetti({
      particleCount: 300,
      spread: 120,
      origin: { y: 0.6 },
    });
  }

  const partyCode = window.partyCode;

  $.get('/get-scoreboard', { partyCode }, function (data) {
    data.sort((a, b) => b.score - a.score);
    let listHtml = '';

    data.forEach((player, index) => {
      let icon = '';
      if (index === 0) icon = '🥇';
      else if (index === 1) icon = '🥈';
      else if (index === 2) icon = '🥉';

      listHtml += `
        <li>
          <span>${icon} ${player.name}</span>
          <span>${player.score} pts</span>
        </li>
      `;
    });

    $('#final-scoreboard').html(listHtml);
  });
});
