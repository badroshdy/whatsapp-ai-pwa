// ---------- helpers ----------
const LS_KEY = 'whatsappAI_key';
function haveKey(){ return !!localStorage.getItem(LS_KEY); }
function getKey(){ return localStorage.getItem(LS_KEY); }

// ---------- status ----------
document.getElementById('ks').textContent = haveKey() ? 'Key stored locally' : 'No key – tap link to add';

// ---------- OpenAI call ----------
async function askOpenAI(systemPrompt, userPrompt){
  const key = getKey();
  if(!key){ alert('Save your OpenAI key first'); throw new Error('no key'); }
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      {role:'system', content: systemPrompt},
      {role:'user',   content: userPrompt}
    ],
    temperature: 0.5
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });
  if(!res.ok){
    const txt = await res.text();
    throw new Error(txt);
  }
  const json = await res.json();
  return json.choices[0].message.content.trim();
}

// ---------- feature 1 ----------
async function summarise(){
  const txt = document.getElementById('chat').value;
  if(!txt){ alert('Paste messages first'); return; }

  const btn = event.target;
  const output = document.getElementById('sumOut');
  btn.disabled = true;
  btn.textContent = 'Processing...';
  output.textContent = 'Analyzing messages...';

  const system = `You are an executive assistant. Provide:

Summary (2-3 bullets, max 40 words each):
• point A
• point B

Reply: short, polite suggested answer.`;
  try{
    const out = await askOpenAI(system, txt);
    output.textContent = out;
    await navigator.clipboard.writeText(out);
    alert('✅ Copied to clipboard!');
  }catch(e){
    output.textContent = 'Error: ' + e.message;
    alert('Error: '+e.message);
  }finally{
    btn.disabled = false;
    btn.textContent = 'Summarise & suggest reply';
  }
}

// ---------- feature 2 ----------
async function articleToPost(){
  const url = document.getElementById('url').value.trim();
  if(!url){ alert('Enter article URL'); return; }

  const btn = event.target;
  const output = document.getElementById('artOut');
  btn.disabled = true;
  btn.textContent = 'Processing...';
  output.textContent = 'Creating WhatsApp post...';

  const system = `You receive a web article. Return a WhatsApp-ready message:
- First line: 🔗 Title (max 8 words)
- Second line: 60-word summary
- Third line: Read more: <url>
Emoji allowed. Keep friendly & concise.`;
  try{
    const out = await askOpenAI(system, `URL: ${url}`);
    output.textContent = out;
    await navigator.clipboard.writeText(out);
    alert('✅ WhatsApp post copied!');
  }catch(e){
    output.textContent = 'Error: ' + e.message;
    alert('Error: '+e.message);
  }finally{
    btn.disabled = false;
    btn.textContent = 'Create WhatsApp post';
  }
}

// ---------- PWA ----------
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js');
}
