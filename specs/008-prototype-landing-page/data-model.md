# Data Model: Prototype Landing Page

## Overview

This feature introduces no persistent data, resident account data, form fields, session state, or
new domain entities. It produces one deterministic public document from fixed presentation content.

## Build Artifact: Landing Document

| Field              | Description                                                      | Validation / Invariant                                                                                                              |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Source template    | Handlebars page template containing the landing-page content     | Stored with private view templates; must invoke the shared `layout` partial.                                                        |
| Layout partial     | Existing shared document layout                                  | Supplies the document structure, page heading, stylesheet reference, and language metadata.                                         |
| Template context   | Fixed title and any fixed display strings required by the layout | Contains no resident-provided or request-specific values.                                                                           |
| Generated document | Final HTML written as the public root document                   | Must be a complete HTML document, include the established page container and stylesheet, and include a primary anchor to `/report`. |
| Public location    | `index.html` in the generated public asset directory             | Must be accessible at `/` through the configured static-asset middleware.                                                           |

## Relationships and Lifecycle

```text
index.hbs + layout.hbs + fixed build context
                  │
                  ▼
       build-time Handlebars render
                  │
                  ▼
       public/index.html (final HTML)
                  │
                  ▼
        GET / via static-asset middleware
                  │
                  ▼
             resident follows /report
```

- The source template and layout are inputs to the build and remain private server-view assets.
- The generated `index.html` is the only landing-page representation published in public assets.
- The generated page creates no report draft. A draft is created only when a resident follows the
  existing `/report` entry point.
