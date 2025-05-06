$(function () {
  "use strict";

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  let audioCtx;
  const audioBuffers = {};
  window.audioBuffers = audioBuffers;

  if (typeof masterVolume === "undefined") {
    window.masterVolume = 0.8;
  }
  if (typeof padVolumeMap === "undefined") {
    window.padVolumeMap = {};
  }

  async function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      window.audioCtx = audioCtx;
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

    await Promise.all(
      soundNames.map(async (name) => {
        try {
          const response = await fetch(`./static/sounds/${name}.ogg`);
          if (!response.ok) {
            console.error(
              "[ERROR] No se pudo cargar",
              name,
              response.statusText
            );
            return;
          }
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          audioBuffers[name] = audioBuffer;
          console.log("[DEBUG] Sonido cargado:", name);
        } catch (e) {
          console.error("[ERROR] Falló al cargar", name, e);
        }
      })
    );
    console.log("[DEBUG] Audio buffers cargados.");
  }

  function getAudioBufferForPad(padId) {
    if (typeof getCustomPadSound === "function") {
      const sound = getCustomPadSound(padId);
      if (sound && sound.startsWith("user_")) {
        return window.customAudioBuffers
          ? window.customAudioBuffers[sound]
          : null;
      } else {
        return audioBuffers[sound] || null;
      }
    } else {
      return audioBuffers[padId] || null;
    }
  }

  function playSound(padId) {
    const soundName =
      typeof getCustomPadSound === "function"
        ? getCustomPadSound(padId)
        : padId;
    if (!soundName) return;
    if (!audioCtx) {
      console.warn("[WARN] AudioContext no inicializado.");
      return;
    }

    const buffer = getAudioBufferForPad(padId);
    if (!buffer) {
      console.warn("[WARN] No se encontró buffer para", soundName);
      return;
    }

    const individual = padVolumeMap[padId] ?? 1;
    console.log("[DEBUG] padId:", padId);
    console.log("[DEBUG] individual volume:", individual);
    console.log("[DEBUG] master volume:", masterVolume);
    const finalVolume = Math.min(1.0, individual * masterVolume);
    console.log("[DEBUG] final volume:", finalVolume);
    console.log("Volumen aplicado:", finalVolume);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(finalVolume, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode);
    source.start(0);
  }

  initAudio();

  const padIds = Object.keys(
    typeof padSelectorMap !== "undefined" ? padSelectorMap : {}
  );

  // Asociamos eventos táctiles y de mouse con respuesta inmediata
  padIds.forEach((padId) => {
    const $pad = $(`#${padId}`);

    const trigger = (e) => {
      if (e.cancelable) e.preventDefault();
      playSound(padId);

      $pad.addClass("key_state_active");
      clearTimeout($pad.data("tm"));
      const tm = setTimeout(() => {
        $pad.removeClass("key_state_active");
      }, 100);
      $pad.data("tm", tm);
    };

    // Esta lógica evita que un pad dispare el sonido varias veces en móviles.
    // En dispositivos táctiles, tanto "touchstart" como "mousedown" pueden activarse,
    // causando reproducción múltiple del sonido.
    // Usamos "touchstart" exclusivamente en móviles, y "mousedown" en escritorio.
    // Además, usamos e.preventDefault() para cancelar el click fantasma que algunos navegadores generan después del touch.
    if (isMobile) {
      $pad.on("touchstart", function (e) {
        if (e.cancelable) e.preventDefault();
        trigger(e);
      });
    } else {
      $pad.on("mousedown", trigger);
    }
  });

  $(document.body).on("keypress", function (e) {
    const keyChar = e.key.toUpperCase();
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
      clearTimeout($pad.data("tm")); // importante: cada pad tiene su propio timeout
      const tm = setTimeout(() => {
        $pad.removeClass("key_state_active");
      }, 100);
      $pad.data("tm", tm);
    }
  });

  // Soporte para "slide to trigger" en pads numéricos (móvil)
  let lastTouchedPad = null;

  function triggerPad(padElement) {
    const padId = padElement.id;
    if (padId !== lastTouchedPad) {
      lastTouchedPad = padId;
      playSound(padId);
      $(padElement).addClass("key_state_active");
      clearTimeout($(padElement).data("tm"));
      const tm = setTimeout(() => {
        $(padElement).removeClass("key_state_active");
      }, 100);
      $(padElement).data("tm", tm);
    }
  }

  $(".button_num").on("touchstart", function (e) {
    lastTouchedPad = null;
    triggerPad(this);
  });

  $(".contenedor_num").on("touchmove", function (e) {
    const touch = e.originalEvent.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.classList.contains("button_num")) {
      triggerPad(target);
    }
  });

  $(".contenedor_num").on("touchend", () => {
    lastTouchedPad = null;
  });
});
