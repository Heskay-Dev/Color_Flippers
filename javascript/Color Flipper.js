  // Utility functions
  function randInt(max=256){ return Math.floor(Math.random()*max); }
  function toHex(n){ return n.toString(16).padStart(2,'0').toUpperCase(); }
  function rgbToHex(r,g,b){ return '#' + toHex(r)+toHex(g)+toHex(b); }
  function hexToRgb(hex){
    const h = hex.replace('#','');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  function rgbToHsl(r,g,b){
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h, s, l=(max+min)/2;
    if(max===min){ h=s=0; } else {
      const d = max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h = (g-b)/d + (g<b?6:0); break;
        case g: h = (b-r)/d + 2; break;
        case b: h = (r-g)/d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
  }

  // DOM
  const flipBtn = document.getElementById('flipBtn');
  const swatch = document.getElementById('swatch');
  const hexVal = document.getElementById('hexVal');
  const rgbVal = document.getElementById('rgbVal');
  const hslVal = document.getElementById('hslVal');
  const copyBtn = document.getElementById('copyBtn');
  const historyEl = document.getElementById('history');
  const lockBtn = document.getElementById('lockBtn');
  const randomizeShade = document.getElementById('randomizeShade');

  let locked = false;
  let history = [];

  function applyColor(hex){
    const [r,g,b] = hexToRgb(hex);
    const hsl = rgbToHsl(r,g,b);
    // set background smoothly
    document.body.style.background = hex;
    // adjust text color for contrast
    const luminance = (0.299*r + 0.587*g + 0.114*b);
    const textColor = luminance < 140 ? '#E6EEF8' : '#0b1220';
    document.body.style.color = textColor;
    // update UI
    swatch.style.background = hex;
    swatch.textContent = hex;
    hexVal.textContent = `HEX: ${hex}`;
    rgbVal.textContent = `RGB: ${r}, ${g}, ${b}`;
    hslVal.textContent = `HSL: ${hsl[0]}°, ${hsl[1]}%, ${hsl[2]}%`;

    // push to history
    addToHistory(hex);
  }

  function addToHistory(hex){
    if(history[0] === hex) return;
    history.unshift(hex);
    if(history.length > 8) history.pop();
    renderHistory();
  }

  function renderHistory(){
    historyEl.innerHTML = '';
    history.forEach(h => {
      const div = document.createElement('div');
      div.className = 'hist-item';
      div.style.background = h;
      div.title = h;
      div.setAttribute('role','button');
      div.setAttribute('aria-label','Apply color ' + h);
      div.addEventListener('click', () => applyColor(h));
      historyEl.appendChild(div);
    });
  }

  function randomColor(){
    const r = randInt(256), g = randInt(256), b = randInt(256);
    return rgbToHex(r,g,b);
  }

  function generate(){
    if(locked) return;
    const hex = randomColor();
    applyColor(hex);
  }

  flipBtn.addEventListener('click', generate);

  copyBtn.addEventListener('click', async () => {
    const hex = hexVal.textContent.replace('HEX: ','');
    try{
      await navigator.clipboard.writeText(hex);
      copyBtn.textContent = 'Copied!';
      setTimeout(()=> copyBtn.textContent = 'Copy HEX', 1200);
    }catch(e){
      copyBtn.textContent = 'Copy Failed';
      setTimeout(()=> copyBtn.textContent = 'Copy HEX', 1200);
    }
  });

  lockBtn.addEventListener('click', () => {
    locked = !locked;
    lockBtn.setAttribute('aria-pressed', String(locked));
    lockBtn.textContent = locked ? '🔓 Locked' : '🔒 Lock';
    lockBtn.style.opacity = locked ? '0.7' : '1';
  });

  randomizeShade.addEventListener('click', () => {
    // take current color and slightly vary its lightness
    const hex = hexVal.textContent.replace('HEX: ','') || '#FFFFFF';
    const [r,g,b] = hexToRgb(hex);
    // random factor between -30 and +30
    const factor = (Math.random()-0.5)*60;
    const newR = Math.min(255, Math.max(0, Math.round(r + factor)));
    const newG = Math.min(255, Math.max(0, Math.round(g + factor)));
    const newB = Math.min(255, Math.max(0, Math.round(b + factor)));
    const newHex = rgbToHex(newR,newG,newB);
    applyColor(newHex);
  });

  // initialize with a pleasant palette color
  const initial = '#007BFF';
  applyColor(initial);
