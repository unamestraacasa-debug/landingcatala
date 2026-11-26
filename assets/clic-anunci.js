// Quan algú arriba a aprencat.com des d'un anunci (Google o Meta), l'adreça porta el clic
// (gclid, gbraid, wbraid, fbclid) i els UTM. Aquí no es fa cap seguiment ni es desa cap galeta:
// només es guarden mentre la pestanya està oberta i s'afegeixen a l'enllaç cap a l'app,
// perquè l'app pugui lligar el registre amb l'anunci (conversió «Registre»).
(function () {
  var KEYS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var S = 'acat_clic';
  var saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(S) || '{}') || {}; } catch (e) { saved = {}; }
  var q = new URLSearchParams(location.search), nou = false;
  KEYS.forEach(function (k) { var v = q.get(k); if (v) { saved[k] = v.slice(0, 150); nou = true; } });
  if (nou) { try { sessionStorage.setItem(S, JSON.stringify(saved)); } catch (e) { /* navegació privada */ } }
  if (!Object.keys(saved).length) return;
  function afegeix(a) {
    try {
      var u = new URL(a.href);
      if (u.hostname !== 'app.aprencat.com' || /^\/privacitat/.test(u.pathname)) return;
      KEYS.forEach(function (k) { if (saved[k] && !u.searchParams.has(k)) u.searchParams.set(k, saved[k]); });
      a.href = u.toString();
    } catch (e) { /* enllaç no vàlid */ }
  }
  // En el moment del clic: també serveix per als botons que crea el joc de la ruleta.
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a) afegeix(a); }, true);
})();
