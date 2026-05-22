// ===================================================
//  Liuyin Yang — Researcher Profile
// ===================================================

// Project filter
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    document.querySelectorAll(".project").forEach(item => {
      const show = filter === "all" || item.dataset.type === filter;
      item.classList.toggle("hidden", !show);
    });
  });
});

// Active section in nav
(() => {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.forEach(a => {
            a.classList.toggle(
              "active",
              a.getAttribute("href") === "#" + e.target.id
            );
          });
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );

  sections.forEach(s => observer.observe(s));
})();
