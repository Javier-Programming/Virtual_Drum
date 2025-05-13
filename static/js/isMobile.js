// (function () {
//   const getCurrentPage = () => window.location.pathname.split("/").pop();
//   const isMobileScreen = () => window.innerWidth <= 600;

//   const redirectIfNeeded = () => {
//     const currentPage = getCurrentPage();

//     if (isMobileScreen() && currentPage !== "/mobile.html") {
//       window.location.replace("/mobile.html");
//     } else if (!isMobileScreen() && currentPage !== "") {
//       window.location.replace("/");
//     }
//   };

//   redirectIfNeeded();

//   window.addEventListener("resize", () => {
//     redirectIfNeeded();
//   });
// })();

(function () {
  const isMobileScreen = window.innerWidth <= 600;
  const currentPath = window.location.pathname;

  if (isMobileScreen && !currentPath.endsWith("/mobile")) {
    window.location.replace("/mobile"); // 👈 sin .html
  } else if (!isMobileScreen && currentPath !== "/") {
    window.location.replace("/");
  }

  window.addEventListener("resize", () => {
    const isNowMobile = window.innerWidth <= 600;
    const pageNow = window.location.pathname;

    if (isNowMobile && !pageNow.endsWith("/mobile")) {
      window.location.replace("/mobile"); // 👈 sin .html
    } else if (!isNowMobile && pageNow !== "/") {
      window.location.replace("/");
    }
  });
})();
