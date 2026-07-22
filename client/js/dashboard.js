const sessionToken = localStorage.getItem('sessionToken');
const storedUser = localStorage.getItem('userInfo');

if (!sessionToken || !storedUser) {
  window.location.href = '/login.html';
}

let user;

try {
  user = JSON.parse(storedUser);
} catch {
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('userInfo');
  window.location.href = '/login.html';
}

const userName = document.querySelector('#userName');
const userUsername = document.querySelector('#userUsername');
const userRole = document.querySelector('#userRole');
const userRoleCard = document.querySelector('#userRoleCard');
const dashboardMessage = document.querySelector('#dashboardMessage');
const logoutButton = document.querySelector('#logoutButton');

if (user) {
  userName.textContent = user.fullName || user.username;
  userUsername.textContent = user.username;
  userRole.textContent = user.role;
  userRoleCard.textContent = user.role;
}

logoutButton?.addEventListener('click', async () => {
  logoutButton.disabled = true;
  dashboardMessage.textContent = 'Signing out...';

  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionToken}`
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userInfo');
    window.location.href = '/login.html';
  }
});
