document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const message = document.getElementById("message");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const validEmail = "admin@example.com";
    const validPassword = "admin123";

    if (email === validEmail && password === validPassword) {
      message.textContent = "Login successful! Redirecting...";
      message.style.color = "green";

      sessionStorage.setItem("isLoggedIn", "true");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } else {
      message.textContent = "Invalid email or password.";
      message.style.color = "red";
    }
  });
});
