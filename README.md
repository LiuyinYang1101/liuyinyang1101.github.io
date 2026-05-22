# Researcher Profile Page

A clean, responsive personal academic profile page designed for GitHub Pages.

## Sections

| Section | Description |
|---------|-------------|
| **About / Intro** | Photo, title, research interests, contact |
| **CV** | Education, experience, skills, PDF download |
| **Projects** | Filterable list of research projects (BCI / Foundation Models / Signal Processing) |
| **Awards** | Honors and scholarships |
| **Links** | Email, Scholar, GitHub, LinkedIn, ORCID, Lab |

## How to Run Locally

```bash
# No build step needed — pure HTML/CSS/JS
# Open with any local server, e.g.:
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Push this repo to GitHub as `<yourusername>.github.io`  
   (or any repo → Settings → Pages → Deploy from branch `main`, root `/`)
2. Your profile will be live at `https://<yourusername>.github.io`

## Customise

| What | Where |
|------|-------|
| Name, title, bio | `index.html` → `#about` section |
| Photo | Replace `assets/photo.jpg` (150×150 px recommended) |
| CV PDF | Place your CV at `assets/cv.pdf` |
| Education / experience | `index.html` → `#cv` section |
| Projects | `index.html` → `#projects` — copy/paste `<li class="pub-item">` blocks |
| Awards | `index.html` → `#awards` section |
| Social links | `index.html` → `#links` section — update `href` and handle text |
| Colors / fonts | `style.css` → `:root` CSS custom properties |

## File Structure

```
researcher-profile/
├── index.html      # all content
├── style.css       # design system + layout
├── script.js       # filter + active-nav highlight
├── assets/
│   ├── photo.jpg   # your headshot (add manually)
│   └── cv.pdf      # your CV (add manually)
└── README.md
```
