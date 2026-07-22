const token = localStorage.getItem('sessionToken');
const tableBody = document.querySelector('#usersTableBody');
const adminMessage = document.querySelector('#adminMessage');
const logoutButton = document.querySelector('#logoutButton');

if (!token) {
  window.location.href = '/login.html';
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

function renderUsers(users) {
  tableBody.innerHTML = '';

  users.forEach((user) => {
    const row = document.createElement('tr');
    const statusClass = user.isActive ? 'status-active' : 'status-inactive';
    const statusText = user.isActive ? 'Active' : 'Inactive';

    row.innerHTML = `
      <td>${escapeHtml(user.fullName)}</td>
      <td>${escapeHtml(user.username)}</td>
      <td>
        <select data-role-id="${user.id}" aria-label="Role for ${escapeHtml(user.username)}">
          ${['Admin', 'Editor', 'User'].map((role) => `
            <option value="${role}" ${role === user.role ? 'selected' : ''}>${role}</option>
          `).join('')}
        </select>
      </td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td>
        <button class="admin-action" data-status-id="${user.id}" data-active="${user.isActive}">
          ${user.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

async function loadUsers() {
  adminMessage.textContent = 'Loading users...';

  try {
    const data = await apiRequest('/api/admin/users');
    renderUsers(data.users);
    adminMessage.textContent = `${data.users.length} user(s) loaded.`;
  } catch (error) {
    adminMessage.textContent = error.message;

    if (error.message.includes('permission') || error.message.includes('Authentication')) {
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    }
  }
}

tableBody?.addEventListener('change', async (event) => {
  const select = event.target.closest('[data-role-id]');

  if (!select) return;

  try {
    await apiRequest(`/api/admin/users/${select.dataset.roleId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: select.value })
    });

    adminMessage.textContent = 'User role updated successfully.';
    await loadUsers();
  } catch (error) {
    adminMessage.textContent = error.message;
  }
});

tableBody?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-status-id]');

  if (!button) return;

  const currentStatus = button.dataset.active === 'true';

  try {
    await apiRequest(`/api/admin/users/${button.dataset.statusId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !currentStatus })
    });

    adminMessage.textContent = 'User status updated successfully.';
    await loadUsers();
  } catch (error) {
    adminMessage.textContent = error.message;
  }
});

logoutButton?.addEventListener('click', async () => {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
  } finally {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userInfo');
    window.location.href = '/login.html';
  }
});

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

loadUsers();
