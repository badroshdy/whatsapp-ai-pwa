function save(){
  const v = document.getElementById('k').value.trim();
  if(!v.startsWith('sk-')){ alert('Key must start with sk-'); return; }
  localStorage.setItem('whatsappAI_key', v);
  document.getElementById('msg').textContent = '✅ Key saved. You can close this tab.';
}
