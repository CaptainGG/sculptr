# Sculptr

**Turn any SVG into an interactive 3D sculpture.**

Sculptr is a browser-based 3D design tool that extrudes SVG paths into fully interactive 3D objects with real-time controls for materials, lighting, animations, and more.

## Features

- **Draw mode** — pixel canvas (24×24) draws directly to 3D
- **Text mode** — type text, choose a font, render in 3D
- **SVG code** — paste or upload any SVG file
- **Materials** — default, plastic, metal, glass, chrome, gold, clay, holographic & more
- **Animations** — float, spin, pulse, wobble, spinFloat, swing
- **Lighting** — full control over position, intensity, shadows
- **Export** — PNG image, WebM video, or auto 3-second capture
- **Embed** — generate `<SVG3D>` React component code for your own projects

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v8+

```bash
npm install -g pnpm
```

### Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building the Desktop App (.exe)

Sculptr can be packaged as a standalone Windows application using Electron.

### Steps

```bash
# 1. Install dependencies (if not already done)
pnpm install

# 2. Build the desktop app (Next.js static export + Electron packaging)
pnpm dist
```

The installer will be output to `dist-electron/`. Run the `.exe` file to install Sculptr on Windows.

> **Note:** The first build may take several minutes. Electron Builder downloads the Electron binary (~90MB) on first run.

### What the build does

1. `next build` with `BUILD_TARGET=electron` — exports the app as static HTML/CSS/JS into `out/`
2. `electron-builder` — packages `out/` + `electron/main.js` into a Windows NSIS installer

## Tech Stack

- [Next.js 15](https://nextjs.org/) — React framework
- [3dsvg](https://www.npmjs.com/package/3dsvg) — SVG-to-3D rendering (Three.js)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) — React renderer for Three.js
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Electron](https://www.electronjs.org/) — desktop packaging

## License

MIT
