document.getElementById('menu-icon').addEventListener('click', function () { 
    var menu = document.getElementById('menulist');
    if (menu.style.display === 'none') { 
        menu.style.display = 'block';
    } else { 
        menu.style.display = 'none';
    } 
});