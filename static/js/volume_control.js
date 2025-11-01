/**
* volume_control.js
* ======================================================================
* Control de volúmenes individuales para la batería virtual
* ======================================================================
*
* Funcionalidades:
* Este script gestiona el volumen general (master) y los volúmenes individuales
* de cada pad, utilizando controles tipo slider en la interfaz. Todos los valores
* se almacenan en localStorage para mantener la configuración entre sesiones.
*
* Requisitos:
*  - Un contenedor con id="padVolumes" para los sliders individuales.
*  - Un input type="range" con id="masterVolume" para el control general.
*  - Una variable global padSelectorMap con los IDs de los pads disponibles.
*
* ======================================================================

// ----------------------------------------------------------------------
// Inicialización de variables de volumen desde localStorage
// ----------------------------------------------------------------------
 */

/**
 * Mapa de volúmenes individuales por pad.
 * Se carga desde localStorage, o se inicializa vacío si no existe.
 * Ejemplo de estructura: { pad_Q: 0.8, pad_W: 0.6, pad_A: 1.0 }
 */
let padVolumeMap = JSON.parse(localStorage.getItem("padVolumeMap") || "{}");

/**
 * Volumen maestro general, con valor por defecto de 0.8 si no existe en localStorage.
 * Este valor afecta globalmente a todos los pads al multiplicarse con su volumen individual.
 */
let masterVolume = parseFloat(localStorage.getItem("masterVolume") || "0.8");

// ----------------------------------------------------------------------
// Función para crear los sliders de volumen individual por pad
// ----------------------------------------------------------------------

/**
 * Crea dinámicamente sliders de volumen para cada pad.
 * Cada slider permite ajustar el volumen de forma independiente,
 * y los cambios se guardan automáticamente en localStorage.
 *
 * @param {string[]} pads - Lista de IDs de pads disponibles.
 * @param {Object} padVolumeMap - Objeto con los volúmenes actuales por pad.
 */
function renderPadSliders(pads, padVolumeMap) {
  const container = document.getElementById("padVolumes");
  if (!container) return; // Si no existe el contenedor, salir sin hacer nada.

  // Limpiar sliders anteriores antes de volver a renderizar
  container.innerHTML = "";

  // Crear un control deslizante (slider) para cada pad
  pads.forEach((padId) => {
    // Etiqueta del pad
    const label = document.createElement("label");
    label.textContent = padId;
    label.style.display = "block";
    label.style.marginTop = "10px";

    // Control deslizante de volumen
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "1";
    slider.step = "0.01";
    slider.value = padVolumeMap[padId] ?? 1; // Valor predeterminado: 1.0

    // Evento de cambio de volumen individual
    slider.oninput = () => {
      padVolumeMap[padId] = parseFloat(slider.value);
      localStorage.setItem("padVolumeMap", JSON.stringify(padVolumeMap));
      // console.log("Volumen por pad cambiado:", padId, slider.value);
    };

    label.appendChild(slider);
    container.appendChild(label);
  });
}

// ----------------------------------------------------------------------
// Configuración del volumen maestro y renderización inicial de sliders
// ----------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Obtener el control de volumen maestro desde el DOM
  const masterSlider = document.getElementById("masterVolume");

  if (masterSlider) {
    // Asignar el valor actual guardado
    masterSlider.value = masterVolume;

    // Evento de cambio del volumen maestro
    masterSlider.addEventListener("input", () => {
      masterVolume = parseFloat(masterSlider.value);
      localStorage.setItem("masterVolume", masterVolume);
      // console.log("Volumen general cambiado:", masterVolume);
    });
  }

  // Renderizar sliders individuales solo si los pads están definidos globalmente
  if (typeof padSelectorMap !== "undefined") {
    const padIds = Object.keys(padSelectorMap);
    renderPadSliders(padIds, padVolumeMap);
  } else {
    // console.warn("padSelectorMap no está definido.");
  }
});
