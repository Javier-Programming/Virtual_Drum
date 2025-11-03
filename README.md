# Virtual Drum Machine

Una batería virtual interactiva desarrollada con **JavaScript**, **HTML**, **CSS** y la **Web Audio API**, diseñada para funcionar en computadoras y dispositivos móviles con **baja latencia y control total del audio**.  
Permite tocar con el teclado, el ratón o el tacto, ajustar volúmenes individualmente y cambiar los sonidos de cada pad.

---

## Características principales

- **Reproducción precisa con Web Audio API**  
  Cada pad genera su propio `AudioBufferSourceNode` y `GainNode` para controlar el volumen dinámicamente sin cortes ni solapamientos.

- **Control de volumen maestro e individual**  
  - Control general de volumen (`masterVolume`) que afecta todos los pads.  
  - Sliders individuales para cada pad con valores persistentes en `localStorage`.

- **Selector de sonidos personalizable**  
  Cada pad puede asignarse a un sonido distinto desde un menú selector, con posibilidad de cargar sonidos personalizados desde archivos locales.

- **Configuraciones persistentes**  
  Todos los volúmenes y asignaciones de sonido se guardan automáticamente en `localStorage`, manteniendo la configuración entre sesiones.

- **Soporte completo para móvil y escritorio**  
  - Detección automática de dispositivos táctiles.  
  - Disposición de pads adaptada:  
    - **Escritorio:** vista horizontal tipo teclado.  
    - **Móvil:** distribución **vertical tipo QWERTY**.

- **Optimización de latencia**  
  Los sonidos se precargan en `AudioBuffer` al inicio, garantizando una respuesta inmediata al tocar cualquier pad.

- **Compatible como PWA (Progressive Web App)**  
  Instalación directa en dispositivos móviles o de escritorio, con uso offline opcional.



---

## Funcionamiento general

### Inicialización del audio

El archivo `bateria.js`:
- Crea el contexto de audio (`AudioContext`).
- Precarga todos los sonidos definidos.
- Asocia eventos de teclado, mouse y táctiles a los pads.
- Gestiona animaciones visuales (`key_state_active`) al presionar.

### Control de volumen

El archivo `volumen.js`:
- Crea los sliders dinámicamente según los pads definidos en `padSelectorMap`.
- Guarda automáticamente los valores en `localStorage`.
- Controla tanto el volumen general (`masterVolume`) como los volúmenes por pad (`padVolumeMap`).

### Selector de sonidos

El archivo `selector_de_sonidos.js`:
- Permite cambiar los sonidos predefinidos o cargar nuevos archivos locales.
- Actualiza dinámicamente los buffers de audio sin recargar la página.

---

## Controles

| Tipo de entrada | Acción |
|-----------------|--------|
| **Teclado (PC)** | Cada tecla (Q, W, E, A, S, D, etc.) activa un pad. |
| **Click / Toque** | Pulsa directamente sobre el pad en pantalla. |
| **Slide táctil (móvil)** | Permite deslizar el dedo por los pads numéricos para activarlos en secuencia. |

---

## Tecnologías utilizadas

- **HTML5** – Estructura base de la interfaz.  
- **CSS3 / Bootstrap** – Estilos y diseño adaptable.  
- **JavaScript (ES6+)** – Lógica principal y gestión de eventos.  
- **Web Audio API** – Reproducción, mezcla y control de volumen.  
- **jQuery** – Manipulación de DOM y eventos simplificada.  
- **PWA** – Instalación y ejecución offline.

---

## Persistencia de datos

- `localStorage.masterVolume` → Guarda el volumen maestro.  
- `localStorage.padVolumeMap` → Guarda los volúmenes individuales.  
- `localStorage.padSoundMap` → Guarda las asignaciones de sonido por pad.

---

## Instalación local

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/tuusuario/bateria-virtual.git](https://github.com/Javier-Programming/Virtual_Drum.git)
   cd Virtual_Drum-main
