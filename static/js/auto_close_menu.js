document.addEventListener("DOMContentLoaded", function () {
  const panel = document.getElementById("volumen_controles");
  const toggle = document.getElementById("toggleVolumen");

  if (!panel || !toggle) return;

  toggle.addEventListener("click", () => {
    panel.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    const isClickInside = panel.contains(e.target) || toggle.contains(e.target);
    if (!isClickInside && !panel.classList.contains("hidden")) {
      panel.classList.add("hidden");
    }
  });
});
