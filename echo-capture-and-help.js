/* echo-capture-and-help.js — vivid pills for Root / With God + digit chips */
(function () {
  function ready(fn){document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn);}
  function $(s,r){return (r||document).querySelector(s);}
  function $all(s,r){return Array.from((r||document).querySelectorAll(s));}

  /* A=1..I=9, J=1..R=9, S=1..Z=8 */
  const LETTER = Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map((c,i)=>[c, (i%9)+1 ]));
  function digitsForWord(w, countSpaces){
    const cleaned = w.toLowerCase().replace(/[^a-z ]+/g,'');
    const chars = countSpaces ? cleaned : cleaned.replace(/\s+/g,'');
    const nums  = chars.split('').map(ch => LETTER[ch]||0).filter(n=>n>0);
    return {nums, sum: nums.reduce((a,b)=>a+b,0)};
  }
  function digitalRoot(n){ n=Math.abs(n|0); while(n>9){ n = (''+n).split('').reduce((a,b)=>a+ +b,0);} return n; }

  const ROOT_NAME = {
    1:'Mercy', 2:'Grace ↔ Mercy', 3:'Faith', 4:'Order', 5:'Teaching',
    6:'Hope', 7:'Glory', 8:'Strength', 9:'Truth'
  };
  const TONE_CLASS = {
    1:'mercy', 2:'grace', 3:'faith', 4:'order', 5:'teaching',
    6:'hope', 7:'glory', 8:'strength', 9:'truth'
  };
  const VERSE_HINT = { 2:'Ephesians 2:8', 3:'Hebrews 11:1' };

  ready(() => {
    const host = document.getElementById('bible-lens-app') || document.getElementById('echo-capture-host');
    if(!host) return;

    /* Kill the two legacy cards to keep the page simple */
    $all('h2,h3').forEach(h=>{
      if(/Names\s*\/\s*Objects|Speak from your heart/i.test(h.textContent||'')){
        const w = h.closest('.sheet, section, .card, .rich-text, .color-scheme');
        if(w) w.style.display = 'none';
      }
    });

    /* Build unified UI (id/class names match the CSS above) */
    const wrap = document.createElement('section');
    wrap.id = 'unified-lens';
    wrap.innerHTML = `
      <div class="unified-card">
        <label class="unified-label" for="ul-text">Type anything</label>
        <textarea id="ul-text" class="unified-input" rows="3"
          placeholder='Try: Mary, Lamp, "Rev 4:1", or share what’s on your heart…'></textarea>

        <div class="unified-row">
          <div class="unified-opt">
            <label><input id="ul-addone" type="checkbox" checked> With God (Add the One)</label>
          </div>
          <div class="unified-opt">
            <label><input id="ul-spaces" type="checkbox"> Count spaces (per-Name lens)</label>
          </div>
          <div class="unified-date"><input id="ul-bday" type="text" inputmode="numeric" placeholder="mm/dd/yyyy" aria-label="Birthday (optional)"></div>
          <button id="ul-go" class="unified-btn" type="button">Go</button>
        </div>

        <details class="unified-help"><summary>What does this do?</summary>
          <p class="muted">Letters map to 1–9 (A=1…Z repeats). We show each word’s sum, its digital root (the “spirit”), and the “Add the One” crown if selected. Meanings:
            <b>1 Mercy</b>, <b>2 Grace ↔ Mercy</b>, <b>3 Faith</b>, <b>4 Order</b>, <b>5 Teaching</b>, <b>6 Hope</b>, <b>7 Glory</b>, <b>8 Strength</b>, <b>9 Truth</b>.
          </p>
        </details>

        <div id="ul-results" class="unified-results" aria-live="polite"></div>
        <div id="ul-scripture" class="unified-scripture"></div>
      </div>
    `;
    host.prepend(wrap);

    const textEl = $('#ul-text', wrap);
    const goBtn  = $('#ul-go',  wrap);

    function pill(n){
      const name = ROOT_NAME[n] || '';
      const tone = TONE_CLASS[n] || 'truth';
      return `<span class="pill tone-${tone}"><b>${n}</b> — ${name}</span>`;
    }
    function digitsRow(nums){
      if(!nums.length) return '';
      return `<div class="dchips">${nums.map(n=>`<span class="dchip">${n}</span>`).join('')}</div>`;
    }

    function bdayRootVal(v){
      const m = (v||'').match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      if(!m) return null;
      const sum = m.slice(1).join('').split('').reduce((a,b)=>a+ +b,0);
      return digitalRoot(sum);
    }

    async function run(){
      const raw = (textEl.value||'').trim();
      const addOne     = $('#ul-addone', wrap).checked;
      const countSpace = $('#ul-spaces', wrap).checked;
      const bday       = $('#ul-bday', wrap).value.trim();

      const tokens = raw
        ? raw.split(/[,]+/).map(s=>s.trim()).filter(Boolean)
             .flatMap(s => s.replace(/[“”"]/g,'"').match(/"[^"]+"|[^"]+/g) || [])
             .map(s => s.replace(/^"|"$|^[‘’']|[‘’']$/g,'').trim())
             .filter(Boolean)
        : [];

      /* Compute rows */
      const rows = tokens.map(tok => {
        const {nums,sum} = digitsForWord(tok, countSpace);
        const root = digitalRoot(sum);
        const with1 = addOne ? digitalRoot(sum+1) : root;
        return {tok, nums, sum, root, with1};
      });

      /* Render grid */
      const res = $('#ul-results', wrap);
      let html = `<h3 class="unified-h3">Lens Result</h3>
      <div class="grid">
        <div class="grid-h">Text (digits)</div><div class="grid-h">Sum</div><div class="grid-h">Root</div><div class="grid-h">With God</div>
        ${
          rows.length ? rows.map(r=>`
            <div class="grid-c"><div>${r.tok}</div>${digitsRow(r.nums)}</div>
            <div class="grid-c"><b>${r.sum}</b></div>
            <div class="grid-c">${pill(r.root)}</div>
            <div class="grid-c">${pill(r.with1)}</div>
          `).join('') : `
            <div class="grid-c" style="grid-column:1/-1">Type a word, name, verse ref, or feeling to see its 1–9 mapping.</div>
          `
        }
      </div>`;

      const br = bdayRootVal(bday);
      if (br){
        html += `<div class="echo-pane" style="margin-top:10px">
          <h4>Birthday root: ${pill(br)} ${VERSE_HINT[br] ? `<span class="muted" style="margin-left:8px">(${VERSE_HINT[br]})</span>`:''}</h4>
        </div>`;
      }

      /* Meaning panes for the first row (keeps page compact) */
      if(rows[0]){
        const r = rows[0];
        const meaning = (n) => {
          switch(n){
            case 2: return { good:'Undeserved favor; patience; beauty; ease.',
                            miss:'Striving for approval, self-criticism, shame loops.',
                            watch:'Receive before you give.' };
            case 3: return { good:'Courage; declaring God’s promises; movement.',
                            miss:'Presumption, impulse, restlessness.',
                            watch:'Listen before you leap.' };
            default: return { good:'Aligned with God — walk in that spirit.',
                              miss:'When mis-aimed, note the drift and return.',
                              watch:'Watch: stay present with Him.'};
          }
        };
        const a = meaning(r.root);
        const b = meaning(r.with1);
        html += `
          <div class="echo-pane" style="margin-top:12px">
            <div class="muted" style="margin-bottom:6px">${pill(r.root)} ${VERSE_HINT[r.root] ? `• ${VERSE_HINT[r.root]}`:''}</div>
            <div style="display:grid;gap:10px;grid-template-columns:1fr 1fr">
              <div class="echo-pane"><h4>When aligned (with God)</h4><div class="muted">${a.good}</div></div>
              <div class="echo-pane"><h4>When mis-aimed</h4><div class="muted">${a.miss}</div><div class="muted"><em>Watch:</em> ${a.watch}</div></div>
            </div>
          </div>
          <div class="echo-pane" style="margin-top:12px">
            <div class="muted" style="margin-bottom:6px">${pill(r.with1)} ${VERSE_HINT[r.with1] ? `• ${VERSE_HINT[r.with1]}`:''}</div>
            <div style="display:grid;gap:10px;grid-template-columns:1fr 1fr">
              <div class="echo-pane"><h4>When aligned (with God)</h4><div class="muted">${b.good}</div></div>
              <div class="echo-pane"><h4>When mis-aimed</h4><div class="muted">${b.miss}</div><div class="muted"><em>Watch:</em> ${b.watch}</div></div>
            </div>
          </div>`;
      }

      res.innerHTML = html;

      /* Scripture engine hand-off (if your button exists on page) */
      const scriptureBox = $('#ul-scripture', wrap);
      const prayBtn = $all('button').find(b=>/respond\s+with\s+scripture/i.test(b.textContent||''));
      if(prayBtn){
        const area = prayBtn.closest('section, .card, .sheet, form, div');
        const ta   = area && $all('textarea,input[type="text"]', area).find(el=>el);
        if(ta){ try{ ta.value = raw; prayBtn.click(); scriptureBox.innerHTML = '<p class="muted">Scroll for Scripture reply below…</p>'; }catch(e){} }
      } else {
        scriptureBox.innerHTML = '<p class="muted">Scripture input not found.</p>';
      }
    }

    goBtn.addEventListener('click', run);
    textEl.addEventListener('keydown', e=>{ if(e.key==='Enter' && (e.ctrlKey||e.metaKey)){ e.preventDefault(); run(); }});
  });
})();
