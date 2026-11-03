/* Galetes de publicitat de Meta a aprencat.com (mateix criteri que app.aprencat.com).
 * Mentre PIXEL_ID estigui buit, aquest fitxer no fa res.
 * Sense consentiment no es desa cap identificador: només es manté el paràmetre
 * de l'anunci a l'enllaç cap a l'app perquè allà es pugui preguntar el mateix. */
(() => {
  const PIXEL_ID = ""; // Identificador del conjunt de dades de Meta (només xifres).
  if (!/^\d{5,20}$/.test(PIXEL_ID)) return;

  const DAY = 86400, DOMAIN = /(^|\.)aprencat\.com$/.test(location.hostname) ? ";domain=.aprencat.com" : "";
  const AD_KEYS = ["fbclid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const read = name => { for (const p of document.cookie.split(";")) { const [k, ...v] = p.trim().split("="); if (k === name) return decodeURIComponent(v.join("=")); } return null; };
  const write = (name, value, days) => { document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${days * DAY};samesite=lax;secure${DOMAIN}`; };
  const drop = name => { document.cookie = `${name}=;path=/;max-age=0${DOMAIN}`; document.cookie = `${name}=;path=/;max-age=0`; };
  const params = new URLSearchParams(location.search);
  const ad = {}; AD_KEYS.forEach(k => { const v = params.get(k); if (v) ad[k] = v.slice(0, 500); });

  function persist() {
    if (ad.fbclid && /^[A-Za-z0-9_-]{10,500}$/.test(ad.fbclid) && !read("_fbc")) write("_fbc", `fb.1.${Date.now()}.${ad.fbclid}`, 90);
    const utm = {}; AD_KEYS.slice(1).forEach(k => { if (ad[k]) utm[k] = ad[k].slice(0, 100); });
    if (Object.keys(utm).length && !read("acat_utm")) write("acat_utm", JSON.stringify(utm), 90);
  }
  let loaded = false;
  function loadPixel() {
    if (loaded) return; loaded = true;
    /* Codi estàndard del píxel de Meta. */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", PIXEL_ID); fbq("track", "PageView");
  }
  function choose(choice) {
    write("acat_cookies", choice, 180);
    if (choice === "ads") { persist(); loadPixel(); } else { ["_fbc", "_fbp", "acat_utm"].forEach(drop); }
    document.getElementById("acat-cookies")?.remove();
  }

  // Els enllaços cap a l'app conserven el paràmetre de l'anunci (també els que es creen en clicar un pla).
  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest('a[href^="https://app.aprencat.com"]');
    if (!a) return;
    const url = new URL(a.href);
    if (url.pathname.startsWith("/privacitat/")) return;
    Object.entries(ad).forEach(([k, v]) => { if (!url.searchParams.has(k)) url.searchParams.set(k, v); });
    a.href = url.href;
  }, true);

  const choice = read("acat_cookies");
  if (choice === "ads") { persist(); loadPixel(); return; }
  if (choice === "none") return;

  const T = {
    ca: ["Fem servir galetes de Meta per mesurar els nostres anuncis i saber si t’has registrat o has comprat després de veure’ls. Són opcionals.", "Accepto", "No, gràcies", "Privacitat"],
    es: ["Usamos cookies de Meta para medir nuestros anuncios y saber si te has registrado o has comprado después de verlos. Son opcionales.", "Acepto", "No, gracias", "Privacidad"],
    en: ["We use Meta cookies to measure our ads and know whether you signed up or bought after seeing them. They are optional.", "Accept", "No, thanks", "Privacy"],
    fr: ["Nous utilisons des cookies de Meta pour mesurer nos publicités et savoir si vous vous êtes inscrit ou avez acheté après les avoir vues. Ils sont facultatifs.", "J’accepte", "Non, merci", "Confidentialité"],
    pt: ["Usamos cookies da Meta para medir os nossos anúncios e saber se te registaste ou compraste depois de os veres. São opcionais.", "Aceito", "Não, obrigado", "Privacidade"],
    ru: ["Мы используем файлы cookie Meta, чтобы оценивать нашу рекламу и узнавать, зарегистрировались ли вы или совершили покупку после её просмотра. Они необязательны.", "Принять", "Нет, спасибо", "Конфиденциальность"],
    zh: ["我们使用 Meta 的 Cookie 来衡量广告效果，了解您看到广告后是否注册或购买。这些 Cookie 是可选的。", "接受", "不用了，谢谢", "隐私"],
  };
  let lang = (document.documentElement.lang || "es").slice(0, 2);
  try { lang = localStorage.getItem("acat_lang") || lang; } catch (e) { /* Sense emmagatzematge. */ }
  const [body, accept, reject, more] = Object.hasOwn(T, lang) ? T[lang] : T.es;

  const box = document.createElement("aside");
  box.id = "acat-cookies"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", more); box.lang = lang;
  box.style.cssText = "position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:620px;margin:0 auto;background:#fff;color:#141a2e;border:1px solid #e2e3ec;border-radius:18px;padding:18px 20px;box-shadow:0 12px 40px #0b2d6b33;font:14px/1.6 Sora,system-ui,sans-serif";
  const p = document.createElement("p"); p.style.margin = "0 0 14px"; p.textContent = body + " ";
  const link = document.createElement("a"); link.href = "/privacidad/"; link.textContent = more; link.style.cssText = "color:#0B2D6B;text-decoration:underline"; p.appendChild(link);
  const row = document.createElement("div"); row.style.cssText = "display:flex;gap:10px;flex-wrap:wrap";
  const button = (label, primary, value) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.style.cssText = `flex:1 1 140px;min-height:44px;border-radius:13px;font:600 14px Sora,system-ui,sans-serif;cursor:pointer;${primary ? "background:#0B2D6B;color:#fff;border:0" : "background:#edf1fa;color:#0B2D6B;border:1px solid #e2e3ec"}`; b.addEventListener("click", () => choose(value)); return b; };
  row.append(button(reject, false, "none"), button(accept, true, "ads"));
  box.append(p, row);
  document.body.appendChild(box);
})();
