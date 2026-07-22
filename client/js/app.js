const healthCheckButton = document.querySelector('#healthCheckButton');
const statusMessage = document.querySelector('#statusMessage');

async function checkServerHealth() {
  healthCheckButton.disabled = true;
  statusMessage.textContent = 'Checking server...';

  try {
    const response = await fetch('/api/health');
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Server health check failed.');
    }

    statusMessage.textContent = data.message;
  } catch (error) {
    console.error('Health check error:', error);
    statusMessage.textContent = 'Unable to connect to the server.';
  } finally {
    healthCheckButton.disabled = false;
  }
}

healthCheckButton?.addEventListener('click', checkServerHealth);
