/**
 * sound_selector.js
 * ===============================================================================
 * Permite al usuario personalizar los sonidos de cada pad de una batería virtual.
 * ===============================================================================
 * 
 * Funcionalidades:
 *  - Cargar sonidos personalizados desde archivos locales (MP3, WAV, OGG).
 *  - Guardar los sonidos personalizados en IndexedDB (persistentes).
 *  - Recordar la configuración en localStorage.
 *  - Mostrar feedback visual cuando un pad tiene un sonido personalizado.
 *  - Restablecer sonidos a su valor por defecto.
 *
 * Requisitos:
 *  - idb-keyval (https://github.com/jakearchibald/idb-keyval)
 *  - CDN sugerido:
 *  - <script src="https://cdn.jsdelivr.net/npm/idb-keyval@3.0.0/dist/idb-keyval-iife.js"></script>
 */

// Importación de funciones desde idb-keyval (IndexedDB simplificada)
const { set, get, del } = idbKeyval;

// Mapa global de buffers de audio personalizados (decodificados en AudioBuffer)
window.customAudioBuffers = {};
const customAudioBuffers = window.customAudioBuffers;

// Carga el mapa de sonidos personalizados desde localStorage
let customSoundMap = JSON.parse(
  localStorage.getItem("customPadSounds") || "{}"
);

/**
 * Actualiza el estado visual del selector dependiendo si usa un sonido personalizado.
 * @param {HTMLSelectElement} selectElement - Elemento select del pad.
 * @param {boolean} isCustom - Indica si el sonido es personalizado.
 */
function updateSelectorVisualState(selectElement, isCustom) {
  if (isCustom) {
    selectElement.classList.add("custom-loaded");
  } else {
    selectElement.classList.remove("custom-loaded");
  }
}

/**
 * Lista completa de sonidos disponibles por defecto.
 */
const allSounds = [
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

/**
 * Mapa que relaciona cada pad (tecla o botón) con su sonido por defecto.
 */
const padSelectorMap = {
  pad_1: "1",
  pad_2: "2",
  pad_3: "3",
  pad_4: "4",
  pad_5: "5",
  pad_6: "6",
  pad_7: "7",
  pad_8: "8",
  pad_9: "9",
  pad_0: "10",
  pad_Q: "Snare",
  pad_W: "Lion_1",
  pad_E: "Lion_2",
  pad_R: "LaserGun",
  pad_T: "R8Clap",
  pad_Y: "Conga",
  pad_U: "LowBongo",
  pad_I: "HiBongo",
  pad_O: "Kick_dog",
  pad_P: "Digital_Effect_3",
  pad_A: "Tom_low",
  pad_S: "Conga_Low",
  pad_D: "Snare_1",
  pad_F: "Snare_1",
  pad_G: "Snare_2",
  pad_H: "Snare_2",
  pad_J: "Snare_3",
  pad_K: "Snare_3",
  pad_L: "Snare_weird",
  pad_Ñ: "Flauta",
  pad_Z: "Snare_Gun_2",
  pad_X: "Snare_Gun_1",
  pad_C: "Timbal",
  pad_V: "Timbal",
  pad_ESPACIO: "Kick_thick",
  pad_B: "R8_Snare",
  pad_N: "LowBongo",
  pad_M: "HiBongo",
};
window.padSelectorMap = padSelectorMap;

/**
 * Inicialización principal del selector de sonidos.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const btn = document.getElementById("toggleSelector"); // Botón para mostrar/ocultar el panel
  const grid = document.getElementById("padSelectors"); // Contenedor de selectores
  const container = document.getElementById("selector_sonidos"); // Panel principal

  // --- 1 Cargar los sonidos personalizados desde IndexedDB ---
  await Promise.all(
    Object.keys(customSoundMap).map(async (padId) => {
      const soundKey = customSoundMap[padId];
      if (soundKey.startsWith("user_")) {
        const arrayBuffer = await get(soundKey);
        if (arrayBuffer instanceof ArrayBuffer) {
          const buffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
          customAudioBuffers[soundKey] = buffer;
        } else {
          // console.warn(
          //   "Dato inválido desde IndexedDB para",
          //   soundKey,
          //   arrayBuffer
          // );
        }
      }
    })
  );

  // --- 2 Crear dinámicamente el selector de sonidos por cada pad ---
  Object.keys(padSelectorMap).forEach((padId) => {
    const defaultSound = padSelectorMap[padId];
    const currentSound = customSoundMap[padId] || defaultSound;

    // Contenedor principal del selector
    const wrapper = document.createElement("label");
    wrapper.classList.add("selector-wrapper");

    // Título del pad (por ejemplo "pad_Q")
    const title = document.createElement("span");
    title.textContent = padId;
    title.style.display = "block";
    wrapper.appendChild(title);

    // --- Selector de sonidos predefinidos ---
    const select = document.createElement("select");
    allSounds.forEach((sound) => {
      const opt = document.createElement("option");
      opt.value = sound;
      opt.textContent = sound;
      if (sound === currentSound) opt.selected = true;
      select.appendChild(opt);
    });
    updateSelectorVisualState(select, currentSound.startsWith("user_"));

    // Al cambiar el valor del selector, se guarda en localStorage
    select.addEventListener("change", () => {
      customSoundMap[padId] = select.value;
      localStorage.setItem("customPadSounds", JSON.stringify(customSoundMap));
      updateSelectorVisualState(select, false);
    });

    // --- Input para cargar un archivo de sonido personalizado ---
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".wav,.mp3,.ogg";
    fileInput.style.marginTop = "6px";

    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const arrayBuffer = await file.arrayBuffer();
      // const attachedArrayBuffer = arrayBuffer.slice(0); // Copia completa
      const buffer = await audioCtx.decodeAudioData(arrayBuffer);
      const key = `user_${padId}`;

      // Guardar en memoria y en IndexedDB
      customAudioBuffers[key] = buffer;
      customSoundMap[padId] = key;
      await set(key, arrayBuffer);

      // Guardar referencia en localStorage
      localStorage.setItem("customPadSounds", JSON.stringify(customSoundMap));
      updateSelectorVisualState(select, true);
    });

    // --- Botón para restablecer sonido por defecto ---
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Restablecer";
    resetBtn.style.marginTop = "6px";

    resetBtn.addEventListener("click", async () => {
      const key = customSoundMap[padId];
      if (key && key.startsWith("user_")) {
        delete customAudioBuffers[key];
        await del(key); // Elimina de IndexedDB
      }
      delete customSoundMap[padId];
      localStorage.setItem("customPadSounds", JSON.stringify(customSoundMap));

      // Restaurar el sonido por defecto
      select.value = defaultSound;
      updateSelectorVisualState(select, false);
      fileInput.value = ""; // Limpiar el nombre del archivo seleccionado en el input
    });

    // Añadir todos los elementos al contenedor
    wrapper.appendChild(select);
    wrapper.appendChild(fileInput);
    wrapper.appendChild(resetBtn);
    grid.appendChild(wrapper);
  });

  // --- 3 Mostrar/Ocultar el panel de selectores ---
  btn.addEventListener("click", () => {
    container.classList.toggle("hidden");
  });

  // Cerrar el panel si se hace clic fuera
  document.addEventListener("click", (e) => {
    if (
      !container.classList.contains("hidden") &&
      !container.contains(e.target) &&
      e.target !== btn
    ) {
      container.classList.add("hidden");
    }
  });
});

/**
 * Devuelve el nombre o clave del sonido actual de un pad.
 * @param {string} padId - ID del pad (por ejemplo "pad_Q").
 * @returns {string} Nombre del sonido (por defecto o personalizado).
 */
function getCustomPadSound(padId) {
  return customSoundMap[padId] || padSelectorMap[padId];
}

/**
 * Obtiene el AudioBuffer asociado a un pad.
 * @param {string} padId - ID del pad.
 * @returns {AudioBuffer|null} El buffer del sonido (personalizado o por defecto).
 */
function getAudioBufferForPad(padId) {
  const sound = getCustomPadSound(padId);
  if (sound.startsWith("user_")) {
    return customAudioBuffers[sound] || null;
  } else {
    return audioBuffers[sound] || null;
  }
}
