window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch("https://fo.townizautomation.com/api/jwt", {
          credentials: "include", // send JWT cookie
        });
        if (!res.ok) {
            // If not logged in, redirect to login page
            window.location.href = '/index.html';
            return;
        }
        const data = await res.json();
        document.getElementById('welcome-msg').innerText = `Welcome, ${data.user.role} (ID: ${data.user.id})`;
    } catch {
        window.location.href = '/login.html';
    }
});
  