/**
 * volume_dynamic.js
 * ======================================================================
 * Control principal de la batería virtual (drumpad) usando Web Audio API.
 * ======================================================================
 *
 * Funcionalidades:
 *  - Inicializa el contexto de audio y precarga sonidos por defecto.
 *  - Reproduce sonidos con control de volumen individual y maestro.
 *  - Integra sonidos personalizados cargados desde IndexedDB (vía selector_sonidos.js).
 *  - Gestiona interacción táctil y de teclado (tanto móvil como escritorio).
 *  - Soporta gestos táctiles tipo “slide to trigger” en pads numéricos.
 *
 * Requisitos:
 *  - jQuery
 */

$(function () {
  "use strict";

  // --------------------------------------------------------
  // Detección de entorno
  // --------------------------------------------------------
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Contexto de audio y buffers
  let audioCtx;
  const audioBuffers = {}; // Contiene los sonidos por defecto decodificados
  window.audioBuffers = audioBuffers; // Exportado globalmente

  // Valores globales de volumen
  if (typeof masterVolume === "undefined") window.masterVolume = 0.8; // Volumen maestro
  if (typeof padVolumeMap === "undefined") window.padVolumeMap = {}; // Volumen por pad

  // --------------------------------------------------------
  // Inicialización del sistema de audio
  // --------------------------------------------------------
  /**
   * Inicializa el contexto de audio y carga los sonidos base (por defecto).
   * Decodifica archivos .ogg y los almacena en memoria.
   */
  async function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      window.audioCtx = audioCtx; // Referencia global
    }

    const soundNames = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "Snare",
      "Lion_1",
      "Lion_2",
      "LaserGun",
      "R8Clap",
      "Conga",
      "LowBongo",
      "HiBongo",
      "Kick_dog",
      "Digital_Effect_3",
      "Tom_low",
      "Conga_Low",
      "Snare_1",
      "Snare_2",
      "Snare_3",
      "Snare_weird",
      "Flauta",
      "Snare_Gun_1",
      "Snare_Gun_2",
      "Timbal",
      "Kick_thick",
      "R8_Snare",
    ];

    // Carga y decodifica todos los sonidos por defecto
    await Promise.all(
      soundNames.map(async (name) => {
        try {
          const response = await fetch(`./static/sounds/${name}.ogg`);
          if (!response.ok) return; // Ignora si no existe el archivo

          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          audioBuffers[name] = audioBuffer;
        } catch (e) {
          // En caso de error, simplemente se omite el sonido
        }
      })
    );
  }

  // --------------------------------------------------------
  // Obtención de buffer de audio (por defecto o personalizado)
  // --------------------------------------------------------
  /**
   * Devuelve el AudioBuffer correspondiente a un pad.
   * Si existen sonidos personalizados, los prioriza.
   * @param {string} padId - ID del pad (por ejemplo, "pad_Q")
   * @returns {AudioBuffer|null}
   */
  function getAudioBufferForPad(padId) {
    if (typeof getCustomPadSound === "function") {
      const sound = getCustomPadSound(padId);
      if (sound && sound.startsWith("user_")) {
        // Devuelve el buffer de IndexedDB (sonido personalizado)
        return window.customAudioBuffers
          ? window.customAudioBuffers[sound]
          : null;
      } else {
        return audioBuffers[sound] || null;
      }
    } else {
      // Si no existe selector_sonidos, usa el sonido base
      return audioBuffers[padId] || null;
    }
  }

  // --------------------------------------------------------
  // Reproducción de sonidos
  // --------------------------------------------------------
  /**
   * Reproduce un sonido asociado a un pad.
   * Aplica el volumen maestro y el volumen individual del pad.
   * @param {string} padId - ID del pad
   */
  function playSound(padId) {
    const soundName =
      typeof getCustomPadSound === "function"
        ? getCustomPadSound(padId)
        : padId;
    if (!soundName || !audioCtx) return;

    const buffer = getAudioBufferForPad(padId);
    if (!buffer) return;

    // Calcula volumen final
    const individual = padVolumeMap[padId] ?? 1;
    const finalVolume = Math.min(1.0, individual * masterVolume);

    // Nodo de ganancia (control de volumen)
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(finalVolume, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);

    // Nodo fuente de audio
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode);
    source.start(0);
  }

  // Inicializa los sonidos al cargar
  initAudio();

  // --------------------------------------------------------
  // Asociar eventos a cada pad (click/touch)
  // --------------------------------------------------------
  const padIds = Object.keys(
    typeof padSelectorMap !== "undefined" ? padSelectorMap : {}
  );

  padIds.forEach((padId) => {
    const $pad = $(`#${padId}`);

    /**
     * Ejecuta la acción principal del pad (reproducir + animación)
     */
    const trigger = (e) => {
      if (e.cancelable) e.preventDefault();
      playSound(padId);

      $pad.addClass("key_state_active");
      clearTimeout($pad.data("tm"));
      const tm = setTimeout(() => $pad.removeClass("key_state_active"), 100);
      $pad.data("tm", tm);
    };

    // En móviles solo usamos touchstart (evita doble disparo con click)
    if (isMobile) {
      $pad.on("touchstart", function (e) {
        if (e.cancelable) e.preventDefault();
        trigger(e);
      });
    } else {
      $pad.on("mousedown", trigger);
    }
  });

  // --------------------------------------------------------
  // Control por teclado
  // --------------------------------------------------------
  $(document.body).on("keypress", function (e) {
    const keyChar = e.key.toUpperCase();

    // Mapeo entre tecla y pad correspondiente
    const keyCodeMap = {
      1: "pad_1",
      2: "pad_2",
      3: "pad_3",
      4: "pad_4",
      5: "pad_5",
      6: "pad_6",
      7: "pad_7",
      8: "pad_8",
      9: "pad_9",
      0: "pad_0",
      Q: "pad_Q",
      W: "pad_W",
      E: "pad_E",
      R: "pad_R",
      T: "pad_T",
      Y: "pad_Y",
      U: "pad_U",
      I: "pad_I",
      O: "pad_O",
      P: "pad_P",
      A: "pad_A",
      S: "pad_S",
      D: "pad_D",
      F: "pad_F",
      G: "pad_G",
      H: "pad_H",
      J: "pad_J",
      K: "pad_K",
      L: "pad_L",
      Ñ: "pad_Ñ",
      Z: "pad_Z",
      X: "pad_X",
      C: "pad_C",
      V: "pad_V",
      " ": "pad_ESPACIO",
      B: "pad_B",
      N: "pad_N",
      M: "pad_M",
    };

    const padId = keyCodeMap[keyChar];
    if (padId) {
      playSound(padId);
      const $pad = $(`#${padId}`);
      $pad.addClass("key_state_active");
      clearTimeout($pad.data("tm"));
      const tm = setTimeout(() => $pad.removeClass("key_state_active"), 100);
      $pad.data("tm", tm);
    }
  });

  // --------------------------------------------------------
  // “Slide to trigger” (modo táctil en pads numéricos)
  // --------------------------------------------------------
  let lastTouchedPad = null;

  /**
   * Activa un pad solo si es diferente al último tocado (para evitar repetición).
   * @param {HTMLElement} padElement - Elemento HTML del pad
   */
  function triggerPad(padElement) {
    const padId = padElement.id;
    if (padId !== lastTouchedPad) {
      lastTouchedPad = padId;
      playSound(padId);
      $(padElement).addClass("key_state_active");
      clearTimeout($(padElement).data("tm"));
      const tm = setTimeout(
        () => $(padElement).removeClass("key_state_active"),
        100
      );
      $(padElement).data("tm", tm);
    }
  }

  // Al iniciar el toque en un pad numérico
  $(".button_num").on("touchstart", function () {
    lastTouchedPad = null;
    triggerPad(this);
  });

  // Al deslizar el dedo sobre los pads numéricos
  $(".contenedor_num").on("touchmove", function (e) {
    const touch = e.originalEvent.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.classList.contains("button_num")) {
      triggerPad(target);
    }
  });

  // Al terminar el gesto
  $(".contenedor_num").on("touchend", () => {
    lastTouchedPad = null;
  });
});
