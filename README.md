# Formify Hackathon

A modern form builder and analytics dashboard built for the Formify hackathon. The project focuses on a clean landing page, smooth scroll experience, and a glassmorphism UI with animated statistics and feature cards.

## Live Demo

If you are running this locally, open `html.html` in your browser or use a simple local server (for example with VS Code Live Server).

## Features

- **Hero Landing Page** with call‑to‑action buttons
- **Smooth Scrolling** between sections
- **Glassmorphism UI** with soft blur and glowing accents
- **Platform Statistics** cards with animated lights
- **Powerful Features** grid highlighting key capabilities
- **Showcase / Testimonials / CTA** sections
- **Authentication Views** (Sign up, Login) in the same single page
- **Dashboard / Builder Views** wired via JavaScript routing
- **Toast Notifications** for user feedback
- **AOS Scroll Animations** (Animate On Scroll) for sections and cards

## Tech Stack

- **HTML5** – structure and multiple views in a single file (`html.html`)
- **CSS3** – custom design system, glassmorphism, animations (`css.css`)
- **JavaScript (Vanilla)** – simple router, interactions, toast logic (`js.js`)
- **AOS Library** – scroll‑based animations (via CDN)

## Project Structure

```text
formify-hackthon/
├── html.html   # Main HTML file (landing, auth, dashboard, builder, etc.)
├── css.css     # All styles: layout, glassmorphism, animations, responsive tweaks
├── js.js       # Navigation / routing, interactions, toast handling
└── .git/       # Git repository metadata
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/ibrahem98k/formify-hackthon.git
   cd formify-hackthon
   ```

2. **Open the project**
   - Open the folder in your editor (VS Code recommended).
   - Open `html.html` in your browser, or start a simple local server.

3. **Edit / Customize**
   - Update content in `html.html` (texts, sections, cards).
   - Adjust styling and animations in `css.css`.
   - Extend behavior / routing in `js.js`.

## Updating the GitHub Repository

After making changes locally:

1. **Check status**
   ```bash
   git status
   ```

2. **Stage your changes**
   ```bash
   git add .
   ```

3. **Commit with a clear message**
   ```bash
   git commit -m "Improve UI glassmorphism and stats animations"
   ```

4. **Push to GitHub**
   ```bash
   git push origin main
   ```

> If your default branch is called `master` instead of `main`, replace `main` with `master` in the last command.

## Notes

- This project is optimized for a hackathon demo: all views live inside a single HTML file for simplicity.
- Animations and glass effects may look slightly different across browsers depending on support for `backdrop-filter`.
