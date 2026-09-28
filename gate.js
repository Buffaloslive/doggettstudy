// Doggett Study — lightweight password gate. Client-side only: keeps search engines and
// casual visitors out, not a determined snooper (view-source shows the hash, not the
// password, but it's still just a hash check in the browser). Remembers the device once
// unlocked (localStorage), so Will/Katie don't retype it every visit.
(function () {
  var HASH = "d973ddf";
  var KEY = "doggettstudy_unlocked";
  if (localStorage.getItem(KEY) === "1") return;

  // Plain djb2 hash, not cryptographic — works on http and https alike (unlike
  // crypto.subtle, which needs a secure context and silently fails on plain http).
  function hash(msg) {
    var h = 5381;
    for (var i = 0; i < msg.length; i++) h = ((h * 33) ^ msg.charCodeAt(i)) >>> 0;
    return h.toString(16);
  }

  function init() {
    var overlay = document.createElement("div");
    overlay.id = "gateOverlay";
    overlay.innerHTML =
      '<style>' +
      '#gateOverlay { position:fixed; inset:0; background:#0b1f3a; color:#fff; display:flex;' +
      ' align-items:center; justify-content:center; z-index:99999; font:17px -apple-system,"Segoe UI",sans-serif; }' +
      '#gateOverlay .box { text-align:center; padding:20px; }' +
      '#gateOverlay .lock { font-size:34px; margin-bottom:6px; }' +
      '#gateOverlay .title { font-weight:900; font-size:20px; margin-bottom:18px; }' +
      '#gateOverlay input { font-size:22px; padding:12px 14px; border-radius:10px; border:0; text-align:center;' +
      ' letter-spacing:.12em; text-transform:uppercase; width:160px; }' +
      '#gateOverlay button { margin-left:8px; font-size:17px; padding:12px 20px; border-radius:10px; border:0;' +
      ' background:#c8102e; color:#fff; font-weight:800; cursor:pointer; }' +
      '#gateOverlay .err { color:#ffb3b3; margin-top:12px; font-size:14px; visibility:hidden; font-weight:700; }' +
      '</style>' +
      '<div class="box">' +
      '<div class="lock">&#128274;</div>' +
      '<div class="title">Doggett Study</div>' +
      '<form id="gateForm">' +
      '<input id="gatePw" autocomplete="off" autocapitalize="characters" placeholder="Password" maxlength="20">' +
      '<button type="submit">Go</button>' +
      '</form>' +
      '<div class="err" id="gateErr">Nope, try again!</div>' +
      '</div>';
    document.body.appendChild(overlay);
    document.getElementById("gatePw").focus();
    document.getElementById("gateForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var val = document.getElementById("gatePw").value.trim().toUpperCase();
      if (hash(val) === HASH) {
        localStorage.setItem(KEY, "1");
        overlay.remove();
      } else {
        document.getElementById("gateErr").style.visibility = "visible";
        document.getElementById("gatePw").value = "";
        document.getElementById("gatePw").focus();
      }
    });
  }

  if (document.body) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
