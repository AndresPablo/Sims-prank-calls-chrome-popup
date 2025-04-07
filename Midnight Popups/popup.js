document.addEventListener('DOMContentLoaded', function() {
  const emojiEl = document.getElementById('emoji');
  const tituloEl = document.getElementById('titulo');
  const mensajeEl = document.getElementById('mensaje');
  const inputContainer = document.getElementById('input-container');
  const userInput = document.getElementById('user-input');
  const buttonContainer = document.getElementById('button-container');
  
  let mensajes = [];

  // Función para reproducir sonido
  function reproducirSonido(nombreSonido = 'default.mp3') {
    try {
      const audio = new Audio(chrome.runtime.getURL(nombreSonido));
      audio.play().catch(e => console.error("Error al reproducir sonido:", e));
    } catch (e) {
      console.error("Error cargando sonido:", e);
      // Reproducir sonido por defecto si hay error
      if (nombreSonido !== 'default.mp3') {
        reproducirSonido('default.mp3');
      }
    }
  }

  // Resto de tus funciones existentes...
  function generarAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + parseInt(min);
  }

  function procesarTexto(texto) {
    if (!texto) return texto;
    
    let resultado = texto.replace(/{{min=(\d+) max=(\d+)}}/g, (match, min, max) => {
      return generarAleatorio(min, max);
    });
    
    resultado = resultado.replace(/{{random}}/g, generarAleatorio(1, 100));
    
    return resultado;
  }

  async function cargarMensajes() {
    try {
      const response = await fetch(chrome.runtime.getURL('mensajes.json'));
      mensajes = await response.json();
      
      chrome.storage.local.get(['playSound'], function(result) {
        if (result.playSound) {
          mostrarMensajeAleatorio();
          chrome.storage.local.set({ playSound: false });
        }
      });
      
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      mensajes = [{
        emoji: '❌',
        titulo: 'Error',
        texto: 'No se pudieron cargar los mensajes',
        sonido: 'default.mp3',
        input: '',
        botones: [{ texto: "Cerrar", accion: "cerrar" }]
      }];
      mostrarMensajeAleatorio();
    }
  }

  function crearBotones(botonesConfig) {
    buttonContainer.innerHTML = '';
    
    botonesConfig.forEach(botonConfig => {
      const boton = document.createElement('button');
      boton.textContent = botonConfig.texto;
      boton.className = 'boton-accion skew';
      
      boton.addEventListener('click', () => {
        switch(botonConfig.accion) {
          case 'nuevo_mensaje':
            mostrarMensajeAleatorio();
            break;
          case 'cerrar':
            window.close();
            break;
          case 'copiar':
            navigator.clipboard.writeText(mensajeEl.textContent);
            break;
          default:
            mostrarMensajeAleatorio();
        }
      });
      
      buttonContainer.appendChild(boton);
    });
  }

  function mostrarMensajeAleatorio() {
    if (mensajes.length === 0) return;
    
    const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];
    
    // Procesar y mostrar mensaje
    emojiEl.textContent = mensaje.emoji;
    tituloEl.textContent = procesarTexto(mensaje.titulo);
    mensajeEl.textContent = procesarTexto(mensaje.texto);
    
    // Reproducir sonido específico o el default
    const sonido = mensaje.sonido || 'default.mp3';
    reproducirSonido(sonido);
    
    // Configurar input
    if (mensaje.input && mensaje.input.trim() !== '') {
      inputContainer.style.display = 'block';
      userInput.placeholder = mensaje.input;
      userInput.value = '';
      userInput.focus();
    } else {
      inputContainer.style.display = 'none';
    }
    
    // Configurar botones
    const botones = mensaje.botones || [
      { texto: "OK", accion: mensaje.input ? "nuevo_mensaje" : "cerrar" }
    ];
    crearBotones(botones);
  }

  // Inicializar
  cargarMensajes();
});