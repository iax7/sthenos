# Sthenos

Sthenos is a lightweight experimental web UI playground. The repository currently contains a minimal HTML/CSS/JS setup intended for rapid prototyping without a build step.

[Live Site](https://iax7.github.io/sthenos/)

## Features

- Pure static assets (no framework lock‑in)
- Simple structure (`index.html`, `assets/styles.css`, `assets/app.js`)
- MIT License for flexible reuse

## Project Structure

```text
.
├── index.html              # Main HTML entry point
├── assets/
│   ├── styles.css          # Global styles
│   ├── app.js              # Main script
│   └── cooper.js           # Additional JS module
├── LICENSE                 # MIT License
└── README.md               # This file
```

## Getting Started

Open `index.html` directly in your browser:

1. Clone the repository.
2. Double‑click `index.html` (or serve via a simple static server for local development).

## Development

Because there is no bundler, you can just edit files and refresh.
However, it is recommended to use a local server in order to avoid CORS issues: `npx serve .`

## License

This project is licensed under the MIT License – see the `LICENSE` file for details.

## Acknowledgments

If you use Sthenos in a project or experiment, feel free to share feedback or ideas.
