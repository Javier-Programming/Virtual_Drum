(function () {
  const getCurrentPage = () => window.location.pathname.split("/").pop();
  const isMobileScreen = () => window.innerWidth <= 600;

  const redirectIfNeeded = () => {
    const currentPage = getCurrentPage();

    if (isMobileScreen() && currentPage !== "/mobile.html") {
      window.location.replace("/mobile.html");
    } else if (!isMobileScreen() && currentPage !== "") {
      window.location.replace("/");
    }
  };

  redirectIfNeeded();

  window.addEventListener("resize", () => {
    redirectIfNeeded();
  });
})();
