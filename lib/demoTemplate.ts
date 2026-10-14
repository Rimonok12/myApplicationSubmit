import type { BusinessData } from "./types";

const esc = (s = "") =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Builds a self-contained, premium demo landing page from the business data.
// Returned as an HTML string — used for the live iframe preview and the downloadable file.
export function buildDemoHtml(b: BusinessData): string {
  const primary = b.primary_color || "#e1141e";
  const accent = b.accent_color || "#f59e0b";
  const services = (b.services || [])
    .map(
      (s, i) => `
      <article class="card reveal" style="transition-delay:${i * 70}ms">
        <span class="card-num">0${i + 1}</span>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.description)}</p>
        ${s.price ? `<span class="price">${esc(s.price)}</span>` : ""}
      </article>`
    )
    .join("");
  const highlights = (b.highlights || [])
    .map((h) => `<li class="reveal">${esc(h)}</li>`)
    .join("");
  const loc = b.location || {};
  const contactRows = [
    loc.phone && ["Phone", loc.phone],
    loc.email && ["Email", loc.email],
    loc.address && ["Address", loc.address],
    loc.hours && ["Hours", loc.hours],
  ]
    .filter(Boolean)
    .map((r) => `<div><dt>${esc((r as string[])[0])}</dt><dd>${esc((r as string[])[1])}</dd></div>`)
    .join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(b.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--p:${primary};--a:${accent};--bg:#0a0a0b;--bg2:#141417;--line:rgba(255,255,255,.1);--txt:#f4f4f5;--mut:#a1a1aa}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--txt);font-family:Inter,system-ui,sans-serif;line-height:1.6;overflow-x:hidden}
.wrap{width:min(1150px,100%-40px);margin-inline:auto}
h1,h2,.display{font-family:Anton,Impact,sans-serif;text-transform:uppercase;font-weight:400;line-height:.95;letter-spacing:.01em}
a{color:inherit;text-decoration:none}
.btn{display:inline-block;background:var(--p);color:#fff;font-weight:700;padding:15px 30px;border-radius:999px;transition:transform .2s,filter .2s}
.btn:hover{transform:translateY(-2px);filter:brightness(1.1)}
nav{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;padding:18px 0;background:rgba(10,10,11,.7);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
nav .wrap{display:flex;align-items:center;justify-content:space-between}
.logo{font-family:Anton,sans-serif;text-transform:uppercase;font-size:1.4rem;letter-spacing:.03em}
.logo b{color:var(--p)}
.hero{position:relative;padding:130px 0 110px;overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse at 75% 15%,color-mix(in srgb,var(--p) 55%,transparent),transparent 55%),radial-gradient(ellipse at 10% 90%,color-mix(in srgb,var(--a) 35%,transparent),transparent 50%)}
.kick{display:inline-flex;align-items:center;gap:10px;color:var(--p);font-weight:700;letter-spacing:.2em;text-transform:uppercase;font-size:.78rem;margin-bottom:20px}
.kick::before{content:"";width:26px;height:2px;background:var(--p)}
.hero h1{font-size:clamp(3rem,9vw,7rem)}
.hero p.sub{max-width:620px;margin:26px 0 36px;font-size:clamp(1.05rem,1.6vw,1.3rem);color:#d4d4d8}
.badges{display:flex;flex-wrap:wrap;gap:12px;margin-top:46px}
.badges span{border:1px solid var(--line);background:rgba(255,255,255,.04);padding:10px 18px;border-radius:999px;font-size:.85rem;font-weight:600}
section{padding:90px 0}
.sec-h{font-size:clamp(2.2rem,5vw,3.6rem);margin-bottom:14px}
.mut{color:var(--mut)}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;margin-top:40px}
.card{position:relative;padding:32px 26px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(180deg,var(--bg2),var(--bg));transition:transform .3s,border-color .3s}
.card:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--p) 60%,transparent)}
.card-num{font-family:Anton,sans-serif;font-size:1.3rem;color:var(--p)}
.card h3{font-size:1.3rem;font-weight:700;margin:8px 0}
.card p{color:var(--mut);font-size:.95rem}
.card .price{display:inline-block;margin-top:14px;font-weight:800;color:var(--a)}
.about{background:var(--bg2)}
.about-grid{display:grid;gap:50px;grid-template-columns:1.2fr 1fr;align-items:center}
.about-grid ul{list-style:none;display:grid;gap:12px;margin-top:10px}
.about-grid li{display:flex;align-items:center;gap:12px;font-weight:600}
.about-grid li::before{content:"✓";display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:color-mix(in srgb,var(--p) 18%,transparent);color:var(--p);font-size:.8rem;flex:none}
.cta{text-align:center;background:linear-gradient(135deg,var(--p),color-mix(in srgb,var(--p) 40%,#000));border-radius:28px;padding:70px 30px;margin:0 auto}
.cta h2{font-size:clamp(2.2rem,5vw,3.6rem);margin-bottom:16px}
.contact{display:flex;flex-wrap:wrap;gap:40px;margin-top:40px}
.contact dt{color:var(--mut);font-size:.8rem;text-transform:uppercase;letter-spacing:.1em}
.contact dd{font-size:1.15rem;font-weight:600}
footer{border-top:1px solid var(--line);padding:40px 0;text-align:center;color:var(--mut);font-size:.9rem}
.reveal{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.reveal.in{opacity:1;transform:none}
@media(max-width:820px){.about-grid{grid-template-columns:1fr}}
</style></head>
<body>
<nav><div class="wrap"><div class="logo">${esc(b.name)}</div><a href="#contact" class="btn" style="padding:10px 22px">Contact</a></div></nav>
<header class="hero"><div class="wrap">
  <p class="kick">${esc(b.type)} · ${esc(b.vibe)}</p>
  <h1>${esc(b.tagline || b.name)}</h1>
  <p class="sub">${esc(b.about)}</p>
  <a href="#contact" class="btn">Get in touch</a>
  <div class="badges">${highlights}</div>
</div></header>

<section><div class="wrap">
  <p class="kick">What we offer</p>
  <h2 class="sec-h">Our ${esc(b.type)} services</h2>
  <div class="cards">${services}</div>
</div></section>

<section class="about"><div class="wrap about-grid">
  <div>
    <p class="kick">Why us</p>
    <h2 class="sec-h reveal">${esc(b.name)}</h2>
    <p class="mut reveal">${esc(b.about)}</p>
  </div>
  <ul>${highlights}</ul>
</div></section>

<section id="contact"><div class="wrap">
  <div class="cta">
    <h2>Visit ${esc(b.name)}</h2>
    <p style="max-width:520px;margin:0 auto 10px;opacity:.92">${esc(b.tagline)}</p>
    ${loc.phone ? `<a href="tel:${esc(loc.phone)}" class="btn" style="background:#fff;color:#000;margin-top:18px">Call ${esc(loc.phone)}</a>` : ""}
    <dl class="contact" style="justify-content:center">${contactRows}</dl>
  </div>
</div></section>

<footer>© ${new Date().getFullYear()} ${esc(b.name)} · Demo website concept</footer>
<script>
const io=new IntersectionObserver((es)=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("in")),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
document.querySelectorAll(".card").forEach(el=>{el.classList.add("reveal");io.observe(el)});
</script>
</body></html>`;
}
