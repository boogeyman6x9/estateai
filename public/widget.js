(function () {
  "use strict";

  var BUBBLE_SIZE = { width: 88, height: 88 };
  var PANEL_SIZE = { width: 400, height: 620 };
  var MARGIN = 24;

  var currentScript = document.currentScript;
  if (!currentScript) return;

  var agencyId = currentScript.getAttribute("data-agency-id");
  if (!agencyId) {
    console.error("[EstateAI widget] missing data-agency-id attribute on the script tag");
    return;
  }

  var origin = new URL(currentScript.src).origin;

  function panelSize() {
    return {
      width: Math.min(PANEL_SIZE.width, window.innerWidth - MARGIN * 2),
      height: Math.min(PANEL_SIZE.height, window.innerHeight - MARGIN * 2),
    };
  }

  function init() {
    var iframe = document.createElement("iframe");
    iframe.src = origin + "/widget/" + encodeURIComponent(agencyId);
    iframe.title = "Chat";
    iframe.setAttribute("scrolling", "no");
    iframe.style.position = "fixed";
    iframe.style.bottom = MARGIN + "px";
    iframe.style.right = MARGIN + "px";
    iframe.style.width = BUBBLE_SIZE.width + "px";
    iframe.style.height = BUBBLE_SIZE.height + "px";
    iframe.style.border = "none";
    iframe.style.background = "transparent";
    iframe.style.zIndex = "2147483000";
    iframe.style.colorScheme = "light";
    iframe.style.transition = "width 0.15s ease, height 0.15s ease";
    document.body.appendChild(iframe);

    window.addEventListener("message", function (event) {
      if (event.origin !== origin) return;
      var data = event.data;
      if (!data || data.type !== "estateai:widget-resize") return;

      if (data.open) {
        var size = panelSize();
        iframe.style.width = size.width + "px";
        iframe.style.height = size.height + "px";
      } else {
        iframe.style.width = BUBBLE_SIZE.width + "px";
        iframe.style.height = BUBBLE_SIZE.height + "px";
      }
    });
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
