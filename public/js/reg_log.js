document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.container');
  const registerBtn = document.querySelector('.register-btn');
  const loginBtn = document.querySelector('.login-btn');

  registerBtn.addEventListener('click', function () {
    container.classList.add('active');
  });

  loginBtn.addEventListener('click', function () {
    container.classList.remove('active');
  });
});