// Configuración para testing
const TEST_MODE = false;
const TEST_HOUR = new Date().getHours(); // Hora actual
const TEST_MINUTE = new Date().getMinutes() + 1; // 1 minuto en el futuro

// Función para obtener la próxima hora programada
function getNextScheduledTime() {
  const now = new Date();
  
  if (TEST_MODE) {
    // Para testing: programar para la hora y minuto especificados
    let target = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      TEST_HOUR,
      TEST_MINUTE,
      0,
      0
    );
    
    return target.getTime();
  } else {
    // Comportamiento normal: medianoche
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );
    return midnight.getTime();
  }
}

// Función para mostrar notificación
function showNotification() {
  try {
    chrome.notifications.create('midnightNotification', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: TEST_MODE ? '¡Mensaje de Prueba!' : '¡Es medianoche!',
      message: 'Tienes un nuevo mensaje'
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('Error al crear notificación:', chrome.runtime.lastError);
      }
    });
  } catch (e) {
    console.error('Error en notificación:', e);
  }
}

// Configurar alarma
function setupAlarm() {
  chrome.alarms.create('customAlarm', {
    when: getNextScheduledTime(),
    periodInMinutes: TEST_MODE ? 0.1 : 1440 // 6 segundos para testing
  });
  console.log('Alarma configurada');
}

// Escuchar alarmas
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'customAlarm') {
    const today = new Date().toDateString();
    const { lastExecution } = await chrome.storage.local.get('lastExecution');
    
    if (lastExecution !== today) {
      showNotification();
      chrome.storage.local.set({ 
        playSound: true,
        lastExecution: today 
      });
      
      chrome.action.openPopup().catch(e => console.log('No se pudo abrir popup automáticamente'));
    }
    
    if (TEST_MODE) setupAlarm();
  }
});

// Inicialización
chrome.runtime.onInstalled.addListener(setupAlarm);
chrome.runtime.onStartup.addListener(setupAlarm);
setupAlarm();