const loginForm = document.querySelector('#loginForm');
const signupForm = document.querySelector('#signupForm');

async function submitJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

function setMessage(element, message) {
  if (element) {
    element.textContent = message;
  }
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const messageElement = document.querySelector('#loginMessage');
  const button = loginForm.querySelector('button[type="submit"]');
  const formData = new FormData(loginForm);

  button.disabled = true;
  setMessage(messageElement, 'Signing in...');

  try {
    const data = await submitJson('/api/auth/login', {
      username: formData.get('username'),
      password: formData.get('password')
    });

    localStorage.setItem('sessionToken', data.session.token);
    localStorage.setItem('userInfo', JSON.stringify(data.user));

    setMessage(messageElement, 'Login successful. Redirecting...');
    window.location.href = '/dashboard.html';
  } catch (error) {
    setMessage(messageElement, error.message);
  } finally {
    button.disabled = false;
  }
});

signupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const messageElement = document.querySelector('#signupMessage');
  const button = signupForm.querySelector('button[type="submit"]');
  const formData = new FormData(signupForm);
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (password !== confirmPassword) {
    setMessage(messageElement, 'Passwords do not match.');
    return;
  }

  button.disabled = true;
  setMessage(messageElement, 'Creating account...');

  try {
    await submitJson('/api/auth/signup', {
      fullName: formData.get('fullName'),
      username: formData.get('username'),
      password
    });

    setMessage(messageElement, 'Account created. Redirecting to login...');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 800);
  } catch (error) {
    setMessage(messageElement, error.message);
  } finally {
    button.disabled = false;
  }
});
