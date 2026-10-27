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

## Google Scholar numbers (auto-updated)

`.github/workflows/scholar.yml` runs `scripts/update_scholar.py` every Monday: it reads the public
Scholar profile and rewrites the totals (`data-scholar="…"`) and each paper's citation count
(`<li class="item" data-scholar-id="…">`) in `index.html`, then commits only if something changed.
Because a bot commits to `main`, run `git pull` before editing locally.

- Run it by hand: Actions tab → *Update Google Scholar stats* → *Run workflow*, or locally
  `python3 scripts/update_scholar.py [--dry-run]`.
- New paper: copy an `<li class="item">` block and set `data-scholar-id` to the part after the colon
  in its Scholar link (`citation_for_view=GLgF-JMAAAAJ:<id>`). The script lists Scholar papers that
  are missing from the page but never adds them itself.
- If Scholar blocks the GitHub runner (CAPTCHA), the job fails and the page keeps its last numbers;
  the local command still works from a normal network.

## CV (PDF)

`assets/cv.pdf` is generated from `cv/cv.html`: edit the HTML, then run `bash scripts/build_cv.sh`
(headless Chrome, A4) and commit both files. The Scholar workflow does not touch the CV.

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
├── scripts/update_scholar.py        # refresh Scholar numbers in index.html
├── cv/cv.html                       # CV source
├── scripts/build_cv.sh              # cv/cv.html -> assets/cv.pdf
├── .github/workflows/scholar.yml    # runs it weekly
├── assets/
│   ├── photo.jpg   # your headshot (add manually)
│   └── cv.pdf      # your CV (add manually)
└── README.md
```
