// ---------- Default Sources ----------
const DEFAULT_SOURCES = {
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

const LS_SOURCES_KEY = 'whatsappAI_sources';
let currentTopic = 'cybersecurity';
let sources = {};

// ---------- Initialize ----------
function init(){
  loadSources();
  switchTopic('cybersecurity');
}

function loadSources(){
  const stored = localStorage.getItem(LS_SOURCES_KEY);
  if(stored){
    try{
      sources = JSON.parse(stored);
    }catch(e){
      sources = JSON.parse(JSON.stringify(DEFAULT_SOURCES));
    }
  }else{
    sources = JSON.parse(JSON.stringify(DEFAULT_SOURCES));
  }
}

function saveSources(){
  localStorage.setItem(LS_SOURCES_KEY, JSON.stringify(sources));
}

// ---------- Topic Switching ----------
function switchTopic(topic){
  currentTopic = topic;

  // Update tab buttons
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach((tab, idx) => {
    const topics = ['cybersecurity', 'future-tech', 'energy', 'future-all'];
    if(topics[idx] === topic){
      tab.classList.add('active');
    }else{
      tab.classList.remove('active');
    }
  });

  // Update display
  document.getElementById('topicTitle').textContent = sources[topic].title;
  renderSources();
}

// ---------- Render Sources ----------
function renderSources(){
  const container = document.getElementById('sourcesList');
  const topicSources = sources[currentTopic].sources;

  if(topicSources.length === 0){
    container.innerHTML = '<p style="color: #666; text-align: center; padding: 1rem;">No sources added yet.</p>';
    return;
  }

  container.innerHTML = topicSources.map((source, idx) => {
    const parts = source.split(': ');
    const name = parts[0] || 'Unnamed';
    const url = parts[1] || '';

    return `
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <strong style="display: block; color: #075e54; margin-bottom: 0.25rem;">${name}</strong>
          <a href="${url}" target="_blank" rel="noopener" style="font-size: 0.9rem; word-break: break-all;">${url}</a>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="editSource(${idx})" style="padding: 0.5rem 1rem; width: auto; margin: 0; background: linear-gradient(135deg, #1976d2 0%, #2196f3 100%);">Edit</button>
          <button onclick="deleteSource(${idx})" style="padding: 0.5rem 1rem; width: auto; margin: 0; background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%);">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

// ---------- Add Source ----------
function addSource(){
  const name = document.getElementById('newSourceName').value.trim();
  const url = document.getElementById('newSourceUrl').value.trim();

  if(!name){
    alert('Please enter a source name');
    return;
  }

  if(!url || !url.startsWith('http')){
    alert('Please enter a valid URL starting with http:// or https://');
    return;
  }

  sources[currentTopic].sources.push(`${name}: ${url}`);
  saveSources();
  renderSources();

  // Clear inputs
  document.getElementById('newSourceName').value = '';
  document.getElementById('newSourceUrl').value = '';

  alert('✅ Source added successfully!');
}

// ---------- Edit Source ----------
function editSource(idx){
  const source = sources[currentTopic].sources[idx];
  const parts = source.split(': ');
  const name = parts[0] || '';
  const url = parts[1] || '';

  const newName = prompt('Edit source name:', name);
  if(newName === null) return; // Cancelled

  const newUrl = prompt('Edit source URL:', url);
  if(newUrl === null) return; // Cancelled

  if(!newName.trim()){
    alert('Source name cannot be empty');
    return;
  }

  if(!newUrl.trim() || !newUrl.startsWith('http')){
    alert('Please enter a valid URL starting with http:// or https://');
    return;
  }

  sources[currentTopic].sources[idx] = `${newName.trim()}: ${newUrl.trim()}`;
  saveSources();
  renderSources();
  alert('✅ Source updated successfully!');
}

// ---------- Delete Source ----------
function deleteSource(idx){
  const source = sources[currentTopic].sources[idx];
  const parts = source.split(': ');
  const name = parts[0] || 'this source';

  if(!confirm(`Delete "${name}"?`)){
    return;
  }

  sources[currentTopic].sources.splice(idx, 1);
  saveSources();
  renderSources();
  alert('✅ Source deleted successfully!');
}

// ---------- Reset to Defaults ----------
function resetToDefaults(){
  if(!confirm('Reset all sources to defaults? This will erase your custom sources.')){
    return;
  }

  sources = JSON.parse(JSON.stringify(DEFAULT_SOURCES));
  saveSources();
  renderSources();
  alert('✅ Sources reset to defaults!');
}

// ---------- Export Sources ----------
function exportSources(){
  const json = JSON.stringify(sources, null, 2);
  const blob = new Blob([json], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'whatsapp-ai-sources.json';
  a.click();
  URL.revokeObjectURL(url);
  alert('✅ Sources exported successfully!');
}

// ---------- Initialize on load ----------
init();
