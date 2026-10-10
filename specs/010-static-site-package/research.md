# Research: Independently Deployable Static Site Package

## Decision: Build the static site as a separate filesystem artifact

The build will produce `dist/static-site/` independently of `dist/server/`. The static artifact will
contain only deployable public files; the server artifact will contain only the compiled server runtime
and its required private templates.

**Rationale:** The existing `build:assets` step puts the generated landing page under `dist/server/public`,
which makes the landing page inseparable from the Node.js deployment. Separate output roots allow a static
host and the server container to be created, versioned, and released independently.

**Alternatives considered:**

- Keep `dist/server/public` and copy it after the server build: rejected because static publishing still
  depends on producing the server artifact.
- Create a second runtime service for the landing page: rejected by the constitution; a static directory
  is a release artifact, not a runtime process.

## Decision: Render dynamic-server links at static-site build time

The static-site build will require a public `PUBLIC_SERVER_BASE_URL` value and render the report-start
link as an absolute URL rooted at that value. The value must be an absolute URL, omit a trailing slash, and
must not include credentials, query strings, or fragments.

**Rationale:** Rendering the ordinary anchor in `index.html` preserves navigation with JavaScript disabled
and supports deployments where the static host and Node.js server have different origins. The URL is public
release configuration, not a credential.

**Alternatives considered:**

- Relative `/report` links: rejected because they point to the static host when origins differ.
- A client-side runtime configuration fetch: rejected because essential navigation must work without
  JavaScript.
- A fixed production URL committed to source: rejected because it prevents environment-specific deployments.

## Decision: Split public content inputs from server-only configuration

The static-site builder will consume only public landing-page inputs: the public server base URL and the
public council directory fields needed to render the page. Secret-bearing configuration and server adapters
remain unavailable to the static builder. The existing public council profiles will be factored so both
builds can use the same public profile data without importing server configuration.

**Rationale:** The current asset builder imports `loadConfig()` and the server council directory. That
coupling risks pulling server-only values into the static release path. A public-only input boundary makes
package integrity checks meaningful and avoids divergent council content.

**Alternatives considered:**

- Continue importing the full server configuration: rejected because it unnecessarily exposes the static
  build to secrets and server-only dependencies.
- Duplicate the council list for the static build: rejected because it creates content drift.

## Decision: Add deterministic artifact metadata and integrity validation

Each artifact will include a public release manifest identifying its artifact type and source revision. The
static-site build will validate its output before success: an `index.html` entry document, all locally
referenced public assets, the release manifest, a valid absolute report URL, and the absence of templates,
server source, private configuration, and credential-like values.

**Rationale:** A manifest makes artifacts distinguishable from the same source revision, while validation
prevents publishing partial or sensitive packages.

**Alternatives considered:**

- Artifact name only: rejected because names can be changed or lost during publishing.
- Validate only in deployment documentation: rejected because failures must stop package creation before
  publication.
