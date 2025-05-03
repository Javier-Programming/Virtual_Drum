// Versión mejorada de selector_sonidos_con_archivos_0k.js
// Incluye: guardado en IndexedDB, visual feedback, y botón de restablecer

// Requiere: idb-keyval (https://github.com/jakearchibald/idb-keyval)
// Puedes incluirlo desde CDN:
// <script src="https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/idb-keyval.iife.js"></script>

const { set, get, del } = idbKeyval;

window.customAudioBuffers = {};
const customAudioBuffers = window.customAudioBuffers;

let customSoundMap = JSON.parse(localStorage.getItem("customPadSounds") || "{}");

function updateSelectorVisualState(selectElement, isCustom) {
  if (isCustom) {
    selectElement.classList.add("custom-loaded");
  } else {
    selectElement.classList.remove("custom-loaded");
  }
}

const allSounds = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "Snare", "Lion_1", "Lion_2", "LaserGun", "R8Clap", "Conga",
  "LowBongo", "HiBongo", "Kick_dog", "Digital_Effect_3", "Tom_low",
  "Conga_Low", "Snare_1", "Snare_2", "Snare_3", "Snare_weird",
  "Flauta", "Snare_Gun_1", "Snare_Gun_2", "Timbal", "Kick_thick", "R8_Snare"
];

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

document.addEventListener("DOMContentLoaded", async () => {
  const btn = document.createElement("button");
  btn.id = "toggleSelector";
  btn.innerHTML = "Selector sonidos";
  btn.className = "volumen-toggle-btn";

  document.getElementById("volumen_buttons")?.appendChild(btn);

  const container = document.createElement("div");
  container.id = "selector_sonidos";
  container.classList.add("hidden");
  container.innerHTML = "<h3>Selector de Sonidos</h3><div id='padSelectors'></div>";
  document.body.appendChild(container);

  const grid = document.getElementById("padSelectors");

  await Promise.all(Object.keys(customSoundMap).map(async (padId) => {
    const soundKey = customSoundMap[padId];
    if (soundKey.startsWith("user_")) {
      const arrayBuffer = await get(soundKey);
      if (arrayBuffer) {
        if (arrayBuffer instanceof ArrayBuffer) {
  const bufferForDecode = arrayBuffer.slice(0);
      const buffer = await audioCtx.decodeAudioData(bufferForDecode);
  customAudioBuffers[soundKey] = buffer;
} else {
  console.warn("Dato inválido desde IndexedDB para", soundKey, arrayBuffer);
}
      }
    }
  }));

  Object.keys(padSelectorMap).forEach((padId) => {
    const defaultSound = padSelectorMap[padId];
    const currentSound = customSoundMap[padId] || defaultSound;

    const wrapper = document.createElement("label");
    wrapper.classList.add("selector-wrapper");

    const title = document.createElement("span");
    title.textContent = padId;
    title.style.display = "block";
    wrapper.appendChild(title);

    const select = document.createElement("select");
    allSounds.forEach((sound) => {
      const opt = document.createElement("option");
      opt.value = sound;
      opt.textContent = sound;
      if (sound === currentSound) opt.selected = true;
      select.appendChild(opt);
    });

    updateSelectorVisualState(select, currentSound.startsWith("user_"));

    select.addEventListener("change", () => {
      customSoundMap[padId] = select.value;
      localStorage.setItem("customPadSounds", JSON.stringify(customSoundMap));
      updateSelectorVisualState(select, false);
    });

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".wav,.mp3,.ogg";
    fileInput.style.marginTop = "6px";

    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioCtx.decodeAudioData(arrayBuffer);
      const key = `user_${padId}`;

      customAudioBuffers[key] = buffer;
      customSoundMap[padId] = key;
      await set(key, arrayBuffer);

      localStorage.setItem("customPadSounds", JSON.stringify(customSoundMap));
      updateSelectorVisualState(select, true);
    });

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Restablecer";
    resetBtn.style.marginTop = "6px";

    resetBtn.addEventListener("click", async () => {
      const key = customSoundMap[padId];
      if (key && key.startsWith("user_")) {
        delete customAudioBuffers[key];
        await del(key);
      }
      delete customSoundMap[padId];
      localStorage.setItem("customPadSounds", JSON.stringify(customSoundMap));

      select.value = defaultSound;
      updateSelectorVisualState(select, false);
    });

    wrapper.appendChild(select);
    wrapper.appendChild(fileInput);
    wrapper.appendChild(resetBtn);
    grid.appendChild(wrapper);
  });

  btn.addEventListener("click", () => {
    container.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!container.classList.contains("hidden") && !container.contains(e.target) && e.target !== btn) {
      container.classList.add("hidden");
    }
  });
});

function getCustomPadSound(padId) {
  return customSoundMap[padId] || padSelectorMap[padId];
}

function getAudioBufferForPad(padId) {
  const sound = getCustomPadSound(padId);
  if (sound.startsWith("user_")) {
    return customAudioBuffers[sound] || null;
  } else {
    return audioBuffers[sound] || null;
  }
}
