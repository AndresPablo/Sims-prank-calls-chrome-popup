document.addEventListener('DOMContentLoaded', function() {
  const emojiEl = document.getElementById('emoji');
  const tituloEl = document.getElementById('titulo');
  const mensajeEl = document.getElementById('mensaje');
  const inputContainer = document.getElementById('input-container');
  const userInput = document.getElementById('user-input');
  const buttonContainer = document.getElementById('button-container');
  
  let mensajes = [];

  // Función para generar números aleatorios
  function generarAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + parseInt(min);
  }

  // Procesar texto con placeholders
  function procesarTexto(texto) {
    if (!texto) return texto;
    
    // Reemplazar números aleatorios
    let resultado = texto.replace(/{{min=(\d+) max=(\d+)}}/g, (match, min, max) => {
      return generarAleatorio(min, max);
    });
    
    // Reemplazar {{random}} por un número entre 1 y 100
    resultado = resultado.replace(/{{random}}/g, generarAleatorio(1, 100));
    
    return resultado;
  }

  async function cargarMensajes() {
    try {
      const response = await fetch(chrome.runtime.getURL('mensajes.json'));
      mensajes = await response.json();
      mostrarMensajeAleatorio();
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      mensajes = [{
        emoji: '❌',
        titulo: 'Error',
        texto: 'No se pudieron cargar los mensajes',
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
    
    // Procesar título y texto
    emojiEl.textContent = mensaje.emoji;
    tituloEl.textContent = procesarTexto(mensaje.titulo);
    mensajeEl.textContent = procesarTexto(mensaje.texto);
    
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