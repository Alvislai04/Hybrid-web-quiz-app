$(document).ready(function() {
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

  const partyCode = $('#player-list').data('partycode');

  function fetchPlayers() {
    $.ajax({
      url: '/get-players',
      method: 'GET',
      data: { partyCode: partyCode },
      success: function(data) {
        let playersList = '';
        data.forEach(player => {
          playersList += `
            <li>
              <span class="player-icon">🎮</span>
              ${player.name} 
              ${player.isHost ? '<span class="host-badge">👑 Host</span>' : ''}
            </li>`;
        });
        $('#player-list').html(playersList);

        if (data.length >= 2) {
          $('#start-btn').removeAttr('disabled');
        } else {
          $('#start-btn').attr('disabled', 'disabled');
        }
      },
      error: function(xhr, status, error) {
        console.error('Error fetching players:', error);
      }
    });
  }
  
  function checkPartyStatus() {
    $.ajax({
      url: '/check-party',
      method: 'GET',
      data: { partyCode: partyCode },
      success: function(data) {
        if (!data.exists) {
          alert('The host has deleted the party. You will be returned to the menu.');
          window.location.href = '/menu';
        }
      },
      error: function(err) {
        console.error('Failed to check party status:', err);
      }
    });
  }

  function checkGameStarted() {
    $.ajax({
      url: '/check-game-started',
      method: 'GET',
      data: { partyCode: partyCode },
      success: function(data) {
        if (data.hasStarted) {
          window.location.href = `/start?partyCode=${partyCode}&isHost=false`;
        }
      },
      error: function(err) {
        console.error('Failed to check game status:', err);
      }
    });
  }

  fetchPlayers();
  setInterval(fetchPlayers, 2000);
  setInterval(checkPartyStatus, 3000);
  setInterval(checkGameStarted, 2000);
});

$('#delete-party-btn').on('click', function(e) {
  const confirmed = confirm("Are you sure you want to delete this party?");
  if (!confirmed) {
    e.preventDefault();
  }
});

$('#leave-party-btn').on('click', function(e) {
  const confirmed = confirm("Are you sure you want to leave this party?");
  if (!confirmed) {
    e.preventDefault();
  }
});

$('.start-btn').on('click', function(e) {
  if ($(this).is('[disabled]')) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
});
