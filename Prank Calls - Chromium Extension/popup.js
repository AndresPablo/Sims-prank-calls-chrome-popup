document.addEventListener('DOMContentLoaded', function() {
  const emojiEl = document.getElementById('emoji');
  const tituloEl = document.getElementById('titulo');
  const mensajeEl = document.getElementById('mensaje');
  const inputContainer = document.getElementById('input-container');
  const userInput = document.getElementById('user-input');
  const nuevoBtn = document.getElementById('nuevo-mensaje');
  const cerrarBtn = document.getElementById('cerrar');
  
  let mensajes = [];

  // Cargar mensajes desde el archivo JSON
  async function cargarMensajes() {
    try {
      const response = await fetch(chrome.runtime.getURL('mensajes.json'));
      mensajes = await response.json();
      mostrarMensajeAleatorio();
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      // Mensajes de respaldo si falla la carga
      mensajes = [{
        emoji: '❌',
        titulo: 'Error',
        texto: 'No se pudieron cargar los mensajes'
      }];
      mostrarMensajeAleatorio();
    }
  }

  // Mostrar mensaje aleatorio
  function mostrarMensajeAleatorio() {
    if (mensajes.length === 0) return;
    
    const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];
    
    emojiEl.textContent = mensaje.emoji;
    tituloEl.textContent = mensaje.titulo;
    
    if (mensaje.texto.includes('[INPUT]')) {
      const textoBase = mensaje.texto.replace('[INPUT]', '');
      mensajeEl.textContent = textoBase;
      inputContainer.style.display = 'block';
      userInput.value = '';
      userInput.focus();
    } else {
      mensajeEl.textContent = mensaje.texto;
      inputContainer.style.display = 'none';
    }
  }

  // Event listeners
  nuevoBtn.addEventListener('click', mostrarMensajeAleatorio);
  cerrarBtn.addEventListener('click', () => window.close());
  
  // Inicializar
  cargarMensajes();
});