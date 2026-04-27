# Sculptr

![Sculptr Demo](public/sculptr-demo.gif)

**Turn SVGs, text, sketches, and imported 3D assets into interactive scenes.**

Sculptr is a browser-based 3D design tool that extrudes SVG paths into fully interactive 3D objects, and can now inspect GLB/GLTF/OBJ model assets with real-time controls for materials, textures, lighting, animations, backgrounds, and exports.

## Features

- **Draw mode** - pixel canvas (24x24) draws directly to 3D
- **Text mode** - type text, choose a font, and render it in 3D
- **SVG code** - paste SVG markup directly
- **Upload SVG** - drag and drop or browse to load an `.svg` file
- **3D Asset mode** - import `.glb`, single-file `.gltf`, or `.obj` models for local inspection
- **Settings** - tune object color, depth, smoothness, zoom, background color, material, texture, animation, interaction, and lighting
- **Materials** - default, plastic, metal, glass, rubber, chrome, gold, clay, emissive, and holographic presets
- **Model materials** - preserve original model materials or apply Sculptr color, texture, and material overrides
- **Textures** - control image URL, repeat, rotation, and offset
- **Animations** - float, spin, pulse, wobble, spinFloat, and swing
- **Export** - capture a PNG image, WebM video, or automatic 3-second recording
- **Embed** - generate `<SVG3D>` React component code for your own projects

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v8+

```bash
npm install -g pnpm
```

### Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Checks

```bash
pnpm check
```

### Production Build

```bash
pnpm build
```

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [3dsvg](https://www.npmjs.com/package/3dsvg) - SVG-to-3D rendering
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [Tailwind CSS](https://tailwindcss.com/) - styling
- [Electron](https://www.electronjs.org/) - desktop shell support

## License

MIT
