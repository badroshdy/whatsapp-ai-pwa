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

// ---------- feature 3 ----------
const RSS_FEEDS = {
  'cybersecurity': {
    title: 'Cybersecurity & Digital Trust',
    sources: [
      'Microsoft Security Blog: https://www.microsoft.com/en-us/security/blog/',
      'Google Cloud Security Blog: https://cloud.google.com/blog/topics/security',
      'CISA Alerts: https://www.cisa.gov/news-events/cybersecurity-advisories',
      'Dark Reading News: https://www.darkreading.com/',
      'MITRE ATT&CK Blog: https://attack.mitre.org/resources/blog/'
    ]
  },
  'future-tech': {
    title: 'Future Technology & Strategy',
    sources: [
      'MIT Sloan Technology: https://sloanreview.mit.edu/topic/technology/',
      'McKinsey Technology Insights: https://www.mckinsey.com/capabilities/mckinsey-digital/how-we-help-clients',
      'BCG Henderson Institute: https://www.bcg.com/capabilities/bcg-henderson-institute/default',
      'Harvard Business Review Technology: https://hbr.org/topic/subject/technology',
      'Gartner Blog Network: https://blogs.gartner.com/'
    ]
  },
  'energy': {
    title: 'Energy, Sustainability & Industrial Innovation',
    sources: [
      'World Economic Forum – Energy: https://www.weforum.org/agenda/archive/energy/',
      'International Energy Agency: https://www.iea.org/news',
      'Energy Monitor: https://www.energymonitor.ai/',
      'Oil & Gas Journal: https://www.ogj.com/',
      'Reuters Energy: https://www.reuters.com/business/energy/'
    ]
  },
  'future-all': {
    title: 'Future of Everything & Cross-Discipline',
    sources: [
      'Fast Company Innovation: https://www.fastcompany.com/section/innovation',
      'WEF Future of Work: https://www.weforum.org/agenda/archive/future-of-work/',
      'Brookings TechStream: https://www.brookings.edu/articles/topic/technology-innovation/',
      'The Economist Technology: https://www.economist.com/science-and-technology'
    ]
  }
};

async function suggestArticle(){
  const topic = document.getElementById('topic').value;
  if(!topic){ alert('Please select a topic first'); return; }

  const btn = event.target;
  const output = document.getElementById('sugOut');
  btn.disabled = true;
  btn.textContent = 'Analyzing articles...';
  output.textContent = 'Searching for latest articles...';

  try{
    const topicData = RSS_FEEDS[topic];
    const sourcesList = topicData.sources.join('\n');

    const system = `You are a Vice President advisor with deep expertise in technology and business strategy. Your role is to curate valuable content for senior executives.

TASK:
1. Visit the following sources and find ONE recent, high-impact article (published within the last 7 days if possible):

${sourcesList}

2. Select the article that would be most strategically valuable for a VP/C-level executive
3. Create a WhatsApp-ready message in this exact format:

📰 [Article Title - keep it concise, max 8 words]

Summary:
• [Key point 1 - max 40 words]
• [Key point 2 - max 40 words]
• [Key point 3 if needed - max 40 words]

VP Commentary: [1-2 sentences with strategic insight on why this matters for executive decision-making, business implications, or competitive advantage]

Read more: [Full URL]

IMPORTANT:
- Focus on strategic implications, not technical details
- Prioritize recent, breaking developments
- Choose content that affects C-suite decisions
- Keep the tone professional and insightful
- Ensure the URL is the actual article link, not the feed URL`;

    const userPrompt = `Topic: ${topicData.title}\n\nPlease find and summarize the most relevant recent article from the provided sources.`;

    const out = await askOpenAI(system, userPrompt);
    output.textContent = out;
    await navigator.clipboard.writeText(out);
    alert('✅ Article suggestion copied to clipboard!');
  }catch(e){
    output.textContent = 'Error: ' + e.message;
    alert('Error: ' + e.message);
  }finally{
    btn.disabled = false;
    btn.textContent = 'Get Suggested Article';
  }
}

// ---------- PWA ----------
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js');
}
