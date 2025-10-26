/* echo-overlay.js — always-gate + scrollable + title + configurable Gift URL */
(function(){
  const LETTER_URL = (window.echoConfig && window.echoConfig.letterUrl) || null;
  const GIFT_URL   = (window.echoConfig && window.echoConfig.giftUrl)   || "/collections/all";

  function ready(fn){ document.readyState!=="loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }

  function injectCss(){
    if (document.getElementById("echo-ov-css")) return;
    const s = document.createElement("style");
    s.id = "echo-ov-css";
    s.textContent = `
      .echo-ov{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,.55);backdrop-filter:blur(4px)}
      .echo-ov .sheet{
        width:min(940px,92vw);max-height:92svh;overflow:auto;-webkit-overflow-scrolling:touch;
        margin:16px;background:#0f1418;color:#e6edf3;border:1px solid #213043;border-radius:18px;
        box-shadow:0 10px 30px rgba(0,0,0,.45);padding:22px;display:block
      }
      .echo-ov .sheet h1,.echo-ov .sheet h2{margin:.2em 0 .6em;font-weight:800}
      .echo-ov .sheet p{margin:.6em 0;line-height:1.6}
      .echo-ov .actions{position:sticky;bottom:0;z-index:1;display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;padding-top:12px;
        background:linear-gradient(180deg, rgba(15,20,24,0) 0, #0f1418 22px)}
      .echo-ov .btn{background:#42b6ff;color:#06202f;border:0;border-radius:10px;padding:12px 16px;font-weight:800;cursor:pointer;
        text-decoration:none;display:inline-block}
      .echo-ov .btn.secondary{background:#0d1620;color:#42b6ff;border:1px solid #213043}
      html.echo-locked, body.echo-locked { overflow:hidden!important; height:100%!important; }
      body.echo-locked > *:not(.echo-ov) { pointer-events:none!important; }
      @media (max-width:540px){ .echo-ov .sheet{border-radius:14px;padding:16px} .echo-ov .btn{padding:12px 14px;font-size:16px} }
    `;
    document.head.appendChild(s);
  }
  function lock(){ document.documentElement.classList.add("echo-locked"); document.body.classList.add("echo-locked"); }
  function unlock(){ document.documentElement.classList.remove("echo-locked"); document.body.classList.remove("echo-locked"); }

  async function fetchLetter(){
    if(!LETTER_URL) return "";
    try{ const r = await fetch(LETTER_URL, {cache:"no-store"}); return r.ok ? await r.text() : ""; }
    catch(e){ return ""; }
  }

  ready(async ()=>{
    // Only run on pages where the snippet is rendered
    if(!document.getElementById("echo-capture-host")) return;

    injectCss(); lock();

    const wrap = document.createElement("div");
    wrap.className = "echo-ov";
    wrap.setAttribute("role","dialog");
    wrap.setAttribute("aria-modal","true");

    const inner = document.createElement("div");
    inner.className = "sheet";

    const title = `<h2 style="margin-top:0">Shane’s Conversation With God</h2>`;
    const body  = await fetchLetter();

    inner.innerHTML = `
      ${title}
      ${body || "<p>(Add your full letter to <code>opening-letter.html</code> in Assets.)</p>"}
      <div class="actions">
        <a class="btn secondary" href="${GIFT_URL}">Gift / Provision</a>
        <button id="echo-continue" class="btn">Begin</button>
      </div>
    `;

    wrap.appendChild(inner);
    document.body.appendChild(wrap);

    // Close ONLY via Begin (keeps it a true gate)
    inner.querySelector("#echo-continue").addEventListener("click", ()=>{
      unlock(); wrap.remove();
    }, {once:true});

    // iOS smooth scroll
    inner.addEventListener("touchmove", ()=>{}, {passive:true});

    // Focus the Begin button
    const first = inner.querySelector("#echo-continue"); if(first && first.focus) first.focus();
  });
})();
