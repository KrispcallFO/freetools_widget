Promise.all([
    fetch('sidebar.html').then(res => res.text()),
    fetch('header.html').then(res => res.text())
]).then(([sidebarHtml, headerHtml]) => {
    document.getElementById('sidebar-container').innerHTML = sidebarHtml;
    document.getElementById('header-container').innerHTML = headerHtml;
}).catch(err => {
    console.error('Failed to load sidebar or header:', err);
});
  