document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
  const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
  const themeToggleText = document.getElementById('theme-toggle-text');
  const root = document.documentElement;

  function updateThemeUI(isDark) {
    root.classList.toggle('dark', isDark);
    localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
    if (themeToggleDarkIcon) themeToggleDarkIcon.classList.toggle('hidden', isDark);
    if (themeToggleLightIcon) themeToggleLightIcon.classList.toggle('hidden', !isDark);
    if (themeToggleText) themeToggleText.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0f172a' : '#f9fafb');
  }

  const savedTheme = localStorage.getItem('color-theme');
  const initialDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  updateThemeUI(initialDark);

  themeToggleBtn?.addEventListener('click', () => {
    updateThemeUI(!root.classList.contains('dark'));
  });

  // Cerrar el menú móvil al seleccionar una sección.
  document.querySelectorAll('#navbar-sticky a').forEach(link => {
    link.addEventListener('click', () => {
      const navbar = document.getElementById('navbar-sticky');
      if (navbar && window.innerWidth < 768) {
        navbar.classList.add('hidden');
      }
    });
  });

  // Evita que el loader quede visible si una animación o recurso externo falla.
  hideLoader();
  window.addEventListener('load', hideLoader, { once: true });
  setTimeout(hideLoader, 1200);

  // ==========================================
  // RESEÑAS APROBADAS
  // ==========================================
  // Para agregar una reseña nueva:
  // 1. Verificá que sea real.
  // 2. Contá con autorización para publicarla.
  // 3. Copiá el formato de abajo y cambiá los datos.
  // 4. Guardá el archivo y publicá los cambios.
  // ==========================================
  const approvedReviews = [
    // Nueva reseña:
    // {
    //   name: "Nombre del cliente",
    //   role: "Cargo · Empresa",
    //   rating: 5,
    //   comment: "Comentario real del cliente.",
    //   date: "2026-09-10"
    // }
  ];
  renderReviews(approvedReviews);
});

function hideLoader() {
  const loader = document.getElementById('loader-wrapper');
  if (!loader || loader.dataset.hidden === 'true') return;
  loader.dataset.hidden = 'true';
  loader.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => { loader.style.display = 'none'; }, 500);
}


function renderReviews(reviews) {
  const container = document.getElementById('reviews-list');
  if (!container || !Array.isArray(reviews) || reviews.length === 0) return;

  container.replaceChildren();

  reviews.forEach(review => {
    const article = document.createElement('article');
    article.className = 'review-card';

    const rating = Math.min(5, Math.max(1, Number(review.rating) || 1));

    const stars = document.createElement('div');
    stars.className = 'review-stars';
    stars.setAttribute('aria-label', `${rating} de 5 estrellas`);
    stars.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    const quote = document.createElement('blockquote');
    quote.textContent = `“${review.comment}”`;

    const author = document.createElement('p');
    author.className = 'review-author';
    author.textContent = review.name;

    article.append(stars, quote, author);
    if (review.role) {
      const role = document.createElement('span');
      role.className = 'review-role';
      role.textContent = review.role;
      author.append(' · ', role);
    }

    container.appendChild(article);
  });
}
