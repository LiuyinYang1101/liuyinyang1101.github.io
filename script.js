// Publication type filter
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    document.querySelectorAll(".pub-item").forEach(item => {
      item.classList.toggle("hidden",
        filter !== "all" && item.dataset.type !== filter
      );
    });
  });
});

// Sticky nav: highlight active section
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = a.getAttribute("href") === "#" + e.target.id
          ? "var(--color-accent)"
          : "";
      });
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });

sections.forEach(s => observer.observe(s));
