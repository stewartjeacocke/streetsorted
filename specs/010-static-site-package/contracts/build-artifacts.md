# Build Artifact Contract

## Purpose

This contract defines the release-facing commands and output directories for independently deployable
Street Sorted server and static-site artifacts. It does not define a network API.

## Commands

| Command | Required release input | Output | Must not require |
|---|---|---|---|
| `npm run build:static-site` | Public `PUBLIC_SERVER_BASE_URL` and `SOURCE_REVISION` | `dist/static-site/` | Compiled server output, a running server, or server credentials |
| `npm run build:server` | `SOURCE_REVISION` and normal server build inputs | `dist/server/` | A static-site package |
| `npm run build` | Inputs for both independent artifacts | Both outputs | Deployment of either artifact |

A failed command MUST exit non-zero and MUST NOT make an invalid artifact available for publication.

## Static-site artifact layout

```text
dist/static-site/
├── index.html
├── report.css
├── AGENTS.md                 # rendered with public server URLs
├── release.json
└── [other public assets referenced by index.html]
```

`index.html` is the static-host entry document. Its report-start anchor uses the configured public dynamic
server base URL followed by `/report`. Essential navigation is ordinary HTML and works without JavaScript. `AGENTS.md`, when retained in the
static package, is rendered with the same public server base URL so its server endpoint guidance does not
point to the static host.

The artifact MUST NOT contain server code, Handlebars templates, server configuration files, secrets, or
credentials.

## Server artifact layout

```text
dist/server/
├── server.js
├── [compiled runtime modules]
├── views/templates/
├── public/                   # assets for dynamic report pages
│   ├── location-helper.js
│   └── report.css
└── release.json
```

The server artifact contains the dynamic report application, its private runtime templates, and only the
public assets required by dynamic report pages. It does not contain the static landing-page entry document
or depend on `dist/static-site/` for its build or deployment.

## Release manifest

Both `dist/static-site/release.json` and `dist/server/release.json` contain the following public shape:

```json
{
  "artifactType": "static-site",
  "sourceRevision": "<source revision>"
}
```

For the server artifact, `artifactType` is `server`. Consumers must use `artifactType` plus
`sourceRevision` to identify the artifact; deployment file names alone are not sufficient.
