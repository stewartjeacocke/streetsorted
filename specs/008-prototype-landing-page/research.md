# Research: Prototype Landing Page

## Decision 1: Render the landing Handlebars template to a static HTML document during asset build

**Decision**: Add an `index.hbs` Handlebars template that uses the existing `layout` partial, then
render it with its fixed content during `build:assets`. Write the resulting document to the public
asset output as `index.html`. The build output contains final HTML only; it does not contain a
precompiled Handlebars JavaScript module or require a browser Handlebars runtime.

**Rationale**: The landing page has fixed introductory content and a fixed link into `/report`, so it
does not require request-specific state. Rendering once during the asset build satisfies the
requirement for a Handlebars-authored page while serving the fastest, simplest artifact at the root
address. It also keeps the landing page within the existing single deployable and lets Express's
existing static-asset middleware serve it.

**Alternatives considered**:

- Render the page from a new Express route on every request: rejected because it does not meet the
  request to compile the landing template to HTML at build time.
- Run Handlebars in the browser or emit a precompiled JavaScript template: rejected because the
  requested deliverable is HTML rather than JavaScript and the page must work without JavaScript.
- Hand-write a separate `index.html`: rejected because it would duplicate the existing shared layout
  and make the landing page inconsistent with the report pages.

## Decision 2: Reuse the current shared page layout and stylesheet unchanged

**Decision**: Author `index.hbs` as a page that invokes the existing Handlebars `layout`
partial and use existing semantic elements, the `.page` container, the Street Sorted heading, and
`/report.css`.

**Rationale**: The layout already defines the site document structure, responsive viewport metadata,
English-language declaration, product heading, and stylesheet link. Reusing it gives the root page
the same presentation and accessible document hierarchy as the existing report pages without a new
design system or client application.

**Alternatives considered**:

- Introduce a separate landing-page layout or stylesheet: rejected because it would undermine the
  requirement to match existing pages and add maintenance surface.
- Put landing markup in an unstructured static file: rejected because it would bypass the existing
  shared layout.

## Decision 3: Make development startup generate the same public asset set before serving it

**Decision**: Have the development server run the existing asset-build function before it starts and
serve the generated public asset directory, while production continues to serve the asset directory
created by `npm run build`.

**Rationale**: The current development server serves `src/server/public` directly, whereas the
landing document is generated into build output. Generating assets at startup makes `/` behave the
same in development and production without committing generated HTML into source assets.

**Alternatives considered**:

- Commit a generated `src/server/public/index.html`: rejected because it creates a derived artifact
  that can drift from its Handlebars source.
- Exclude the landing page from development behavior: rejected because developers need to validate
  the same root entry point locally.
- Add a second process or service solely to produce assets: rejected by the single-deployable
  principle and unnecessary for one build step.

## Decision 4: Verify both the generated artifact and the served root-page contract

**Decision**: Extend server-side tests to confirm that the asset build writes final `index.html` to
the public output, does not publish the Handlebars source, and that an application configured to
serve those assets returns the expected semantic root page and `/report` call to action. Retain the
existing browser progressive-enhancement suite as the no-JavaScript baseline for the report journey.

**Rationale**: Artifact assertions prove build-time rendering rather than only page appearance;
request-level assertions prove the actual root URL is exposed correctly. The page contains no
script-dependent action, so validating its ordinary anchor plus the existing no-JavaScript journey
covers the progressive-enhancement constraint.

**Alternatives considered**:

- Test only the template-rendering helper: rejected because it would not establish that the public
  build artifact is served at `/`.
- Test only an HTTP response: rejected because a dynamically rendered response could pass while
  violating the static-HTML build requirement.
