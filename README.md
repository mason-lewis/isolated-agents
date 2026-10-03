# Isolated Agents, Local Communication

A visual exploration by Mason Lewis: 256 isolated AI agents, one pixel each, and one shared picture.

Explore the actual message networks, compare no contact with eight or 24 neighbors, read saved conversations, and try choosing one pixel yourself.

Built with **React, Vite, and TypeScript**. The site runs entirely in the browser with bundled results and no backend or model API calls.

## Develop

Use Node.js 24 LTS.

```sh
npm ci --prefix site
npm run dev --prefix site
```

Edit the React components and styles in `site/src/`.

## Build and publish an update

```sh
npm run build --prefix site
```

This checks TypeScript and writes the production site to `docs/`. Commit both the source changes and rebuilt `docs/` files, then push to `main`. GitHub Pages publishes the `main` branch's `/docs` directory. Relative asset paths support the project URL.

## About the saved results

The site includes 11 final image grids, 8,686 addressed messages from the two communicating house runs, and four complete message/reply exchanges. The displayed results were checked against the original run records before publication. Each addressed recipient counts as one message; moving dots show direction, not measured delivery timing.

Agents received the drawing subject, grid size, and their own coordinate. Each had a private conversation and could not inspect the shared canvas. Neighbor messages were delivered in the next round. The house and Mario challenge displays your chosen pixel over the saved image; the original saved data is unchanged.

Mason Lewis
