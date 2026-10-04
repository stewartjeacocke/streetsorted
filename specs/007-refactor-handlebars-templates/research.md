# Research: Handlebars Report-View Refactor

## Decision: Use the `handlebars` package, version `^4.7.9`, directly from the existing Express application

**Rationale**: The application already owns small view functions and sends their returned HTML through
Express. Using Handlebars directly keeps routing, response handling, sessions, and deployment unchanged
while replacing only the presentation layer. It avoids adding a second Express view-engine abstraction for
a single report flow.

**Alternatives considered**:

- `express-handlebars`: Rejected because the application does not need Express view-engine lookup,
  response helpers, or its additional configuration layer.
- A client-side Handlebars bundle: Rejected because the constitution requires server-rendered HTML and
  JavaScript must not be required for resident flows.
- Retaining TypeScript template strings: Rejected because it does not meet the requested reusable-template
  refactor.

## Decision: Load, compile, and register templates once at process startup; render synchronously from a cache

**Rationale**: The current view API is synchronous. Caching compiled templates preserves that API shape,
prevents per-request filesystem reads and compilation, and surfaces missing or invalid deployment assets
at startup rather than during a resident request.

**Alternatives considered**:

- Read and compile templates on every render: Rejected due to unnecessary request-time I/O and parsing.
- Precompile templates into generated TypeScript: Rejected because it adds a generated-code workflow that
  is unnecessary for the small server-rendered view set.
- Asynchronous rendering: Rejected because it would require a broader route and test refactor without
  user-facing benefit.

## Decision: Use a Handlebars partial-block layout plus shared partials

**Rationale**: A partial-block layout declares the document shell once while allowing each report page to
supply its own semantic section. A shared error-summary partial eliminates repeated validation markup;
page templates keep forms and state-specific controls readable.

**Alternatives considered**:

- Repeat the document shell in every page template: Rejected because it violates the shared-layout
  requirement.
- Render page content to an HTML string and inject it into a layout with unescaped interpolation: Rejected
  because it weakens the separation between trusted template structure and dynamic values.
- Use a single state-heavy template for every page: Rejected because it obscures page-specific forms and
  makes state coverage harder to review.

## Decision: Rely on Handlebars' default HTML escaping; allow unescaped output nowhere

**Rationale**: All resident and upstream-service values must remain text when they contain HTML-like
characters. Templates will use ordinary `{{value}}` interpolation only; no triple-stash expressions or
helpers that return untrusted HTML will be introduced.

**Alternatives considered**:

- Keep a manual HTML-escape helper alongside template escaping: Rejected because duplicated escaping
  responsibilities are error-prone and unnecessary.
- Permit raw HTML for selected dynamic fields: Rejected because report descriptions, service messages,
  and references are not trusted markup.

## Decision: Keep TypeScript page-rendering functions as route-facing adapters backed by explicit view models

**Rationale**: Routes and their public behavior remain unchanged. Each function maps existing domain/session
objects to a small, template-specific view model, including preformatted coordinates and the nearby-result
discriminant. Templates receive presentation data rather than domain objects with optional fields.

**Alternatives considered**:

- Pass request/session/domain objects directly to templates: Rejected because it couples templates to
  internal models and makes safe null handling ambiguous.
- Move page-state decisions into templates: Rejected because decisions such as result-state branching
  belong in TypeScript and would make templates harder to test.

## Decision: Copy `.hbs` files into the server distribution during the existing asset-build step

**Rationale**: Development execution resolves templates beside source modules, while production executes
compiled JavaScript from `dist/server`. The build must preserve the same relative `views/templates`
directory in `dist/server` so the renderer has one module-relative lookup strategy in both environments.

**Alternatives considered**:

- Load templates from the source tree in production: Rejected because source files are not a deployment
  runtime dependency.
- Embed templates in the static public directory: Rejected because view templates are server assets and
  must not be published as browser-accessible files.
- Require deployment tooling to copy templates separately: Rejected because the repository build command
  should create a complete deployable artifact.
