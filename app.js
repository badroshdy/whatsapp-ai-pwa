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
  'cybersecurity': [
    'https://www.microsoft.com/en-us/security/blog/feed/',
    'https://cloud.google.com/blog/topics/security/rss',
    'https://www.cisa.gov/cisa/alerts.xml',
    'https://www.darkreading.com/rss.xml',
    'https://attack.mitre.org/resources/blog/feed.xml'
  ],
  'future-tech': [
    'https://sloanreview.mit.edu/feed/',
    'https://www.mckinsey.com/featured-insights/mckinsey-technology/rss',
    'https://www.bcg.com/featured-insights/bcg-henderson-institute/rss',
    'https://hbr.org/feed',
    'https://blogs.gartner.com/feed/'
  ],
  'energy': [
    'https://www.weforum.org/agenda/feed',
    'https://www.iea.org/rss/news.xml',
    'https://www.energymonitor.ai/feed',
    'https://www.ogj.com/rss',
    'https://www.reutersagency.com/feed/?best-topics=energy'
  ],
  'future-all': [
    'https://www.fastcompany.com/section/innovation/feed',
    'https://www.weforum.org/agenda/archive/future-of-work/feed',
    'https://www.brookings.edu/feed/',
    'https://www.economist.com/technology-quarterly/rss.xml'
  ]
};

async function fetchRSSFeed(feedUrl){
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=5`;
  try{
    const res = await fetch(apiUrl);
    if(!res.ok) return null;
    const data = await res.json();
    return data.items || [];
  }catch(e){
    console.error('RSS fetch error:', e);
    return null;
  }
}

async function suggestArticle(){
  const topic = document.getElementById('topic').value;
  if(!topic){ alert('Please select a topic first'); return; }

  const btn = event.target;
  const output = document.getElementById('sugOut');
  btn.disabled = true;
  btn.textContent = 'Fetching articles...';
  output.textContent = 'Searching for latest articles...';

  try{
    // Fetch articles from all feeds in the selected topic
    const feeds = RSS_FEEDS[topic];
    const allArticles = [];

    btn.textContent = 'Loading feeds...';
    for(const feedUrl of feeds){
      const items = await fetchRSSFeed(feedUrl);
      if(items && items.length > 0){
        allArticles.push(...items.slice(0, 3)); // Take top 3 from each feed
      }
    }

    if(allArticles.length === 0){
      throw new Error('No articles found. Please try again.');
    }

    btn.textContent = 'Analyzing articles...';

    // Prepare article list for OpenAI
    const articleList = allArticles.map((a, i) =>
      `${i+1}. Title: ${a.title}\n   Link: ${a.link}\n   Published: ${a.pubDate}\n   Preview: ${(a.description || '').replace(/<[^>]*>/g, '').substring(0, 200)}...`
    ).join('\n\n');

    const system = `You are an executive technology advisor. From the list of recent articles provided, select ONE article that would be most valuable for a senior executive.

Then create a WhatsApp-ready message with:
1. First line: 📰 [Article Title]
2. 2-3 bullet point summary (max 40 words each)
3. Executive Commentary: 1-2 sentences with strategic insight from an executive perspective
4. Last line: Read more: [URL]

Keep it professional, insightful, and concise. Focus on strategic implications.`;

    const out = await askOpenAI(system, `Recent articles:\n\n${articleList}\n\nSelect the most relevant article for an executive and provide the formatted summary.`);
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
