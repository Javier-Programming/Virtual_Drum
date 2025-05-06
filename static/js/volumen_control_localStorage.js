
// Cargar volúmenes desde localStorage
let padVolumeMap = JSON.parse(localStorage.getItem("padVolumeMap") || "{}");
let masterVolume = parseFloat(localStorage.getItem("masterVolume") || "0.8");

// Función para renderizar los sliders individuales
function renderPadSliders(pads, padVolumeMap) {
  const container = document.getElementById("padVolumes");
  if (!container) return;

  container.innerHTML = ""; // Limpia sliders anteriores

  pads.forEach(padId => {
    const label = document.createElement("label");
    label.textContent = padId;
    label.style.display = "block";
    label.style.marginTop = "10px";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "1";
    slider.step = "0.01";
    slider.value = padVolumeMap[padId] ?? 1;

    slider.oninput = () => {
      padVolumeMap[padId] = parseFloat(slider.value);
      localStorage.setItem("padVolumeMap", JSON.stringify(padVolumeMap));
      console.log("Volumen por pad cambiado:", padId, slider.value);
    };

    label.appendChild(slider);
    container.appendChild(label);
  });
}

// Configurar volumen general
document.addEventListener("DOMContentLoaded", () => {
  const masterSlider = document.getElementById("masterVolume");
  if (masterSlider) {
    masterSlider.value = masterVolume;
    masterSlider.addEventListener("input", () => {
      masterVolume = parseFloat(masterSlider.value);
      localStorage.setItem("masterVolume", masterVolume);
      console.log("Volumen general cambiado:", masterVolume);
    });
  }

  // Asegurar que padSelectorMap esté definido antes de renderizar sliders individuales
  if (typeof padSelectorMap !== "undefined") {
    const padIds = Object.keys(padSelectorMap);
    renderPadSliders(padIds, padVolumeMap);
  } else {
    console.warn("padSelectorMap no está definido.");
  }
});
