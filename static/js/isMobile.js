(function () {
  const currentPage = window.location.pathname.split("/").pop();
  const isMobileScreen = window.innerWidth <= 600;

  if (isMobileScreen && currentPage !== "mobile.html") {
    window.location.replace("mobile.html");
  } else if (!isMobileScreen && currentPage !== "index.html") {
    window.location.replace("index.html");
  }

  // Redirigir también si el usuario cambia el tamaño de la ventana
  window.addEventListener("resize", () => {
    const isNowMobile = window.innerWidth <= 600;
    const pageNow = window.location.pathname.split("/").pop();

    if (isNowMobile && pageNow !== "mobile.html") {
      window.location.replace("mobile.html");
    } else if (!isNowMobile && pageNow !== "index.html") {
      window.location.replace("index.html");
    }
  });
})();
