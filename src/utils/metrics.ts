// Fonction pour envoyer les métriques au backend
const sendMetric = async (metricName, value, labels = {}) => {
  try {
    await fetch('/api/metrics/custom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ metricName, value, labels })
    });
  } catch (error) {
    console.warn('Failed to send metric:', error);
  }
};

// Tracker les sessions actives
export const trackUserSession = {
  start: (userId) => {
    sendMetric('user_session_start', 1, { userId });
    // Heartbeat toutes les 30 secondes
    const heartbeat = setInterval(() => {
      sendMetric('user_heartbeat', 1, { userId });
    }, 30000);

    sessionStorage.setItem('metrics_heartbeat', heartbeat);
  },

  end: (userId) => {
    sendMetric('user_session_end', 1, { userId });
    const heartbeat = sessionStorage.getItem('metrics_heartbeat');
    if (heartbeat) {
      clearInterval(heartbeat);
      sessionStorage.removeItem('metrics_heartbeat');
    }
  }
};

// Tracker les actions utilisateur
export const trackUserAction = (action, eventId = null) => {
  sendMetric('user_action', 1, { action, eventId });
};
