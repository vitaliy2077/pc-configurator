const a = document.querySelector(".loginadm");
const b = document.querySelector(".passadm");
const c = document.querySelector(".login");
const d = document.querySelector(".error-toast");

function login() {
    if (a.value === "admin" && b.value === "admin") {
        c.style.transition = "opacity 0.5s ease";
        c.style.opacity = "0";
        setTimeout(() => c.style.display = "none", 500);
    } else {
        d.style.display = "block";
        a.style.borderColor = "#ff4d4d";
        b.style.borderColor = "#ff4d4d";
        
        a.onclick = () => { a.style.borderColor = "transparent"; d.style.display = "none"; };
        b.onclick = () => { b.style.borderColor = "transparent"; d.style.display = "none"; };
    }
}