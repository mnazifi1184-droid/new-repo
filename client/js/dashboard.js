const sessionToken = localStorage.getItem('sessionToken');

if (!sessionToken) {
  window.location.href = '/login.html';
}

const userName = document.querySelector('#userName');
const userUsername = document.querySelector('#userUsername');
const userRole = document.querySelector('#userRole');
const userRoleCard = document.querySelector('#userRoleCard');
const dashboardMessage = document.querySelector('#dashboardMessage');
const logoutButton = document.querySelector('#logoutButton');

async function loadCurrentUser() {
  try {
    const response = await fetch('/api/users/me', {
      headers: {
        Authorization: `Bearer ${sessionToken}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Session is invalid.');
    }

    const user = data.user;

    localStorage.setItem('userInfo', JSON.stringify(user));
    userName.textContent = user.fullName || user.username;
    userUsername.textContent = user.username;
    userRole.textContent = user.role;
    userRoleCard.textContent = user.role;
  } catch (error) {
    console.error('Current user error:', error);
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userInfo');
    window.location.href = '/login.html';
  }
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

loadCurrentUser();
