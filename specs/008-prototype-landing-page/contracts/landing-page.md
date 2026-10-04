# Landing Page UI and Delivery Contract

## Public URL

| Request                                            | Expected result                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `GET /` with generated public assets configured    | `200 OK` HTML document for the Street Sorted landing page.                                                   |
| `GET /` without generated public assets configured | Outside this feature's runtime contract; existing application fallback behavior may apply in isolated tests. |

## Document Contract

The document served at `/` MUST:

- be a complete HTML document with the same language declaration, viewport metadata, `Street Sorted`
  product heading, `.page` main container, and `/report.css` stylesheet reference as current report
  pages;
- use a page title that identifies the landing purpose and Street Sorted;
- describe Street Sorted as a fly-tipping reporting prototype in plain language;
- explain the three high-level stages: provide a location, check nearby reports, and add report
  details when no nearby report matches;
- tell residents that a location and description are requested during the journey;
- contain one clearly distinguished primary link to `/report` that starts the existing reporting
  journey; when styles are available, the link uses a dedicated primary-action treatment consistent
  with the established page presentation, while its purpose remains clear from its text and document
  order without styles;
- contain no required scripts, form submission, resident-specific values, report confirmation, or
  live-service guarantee.

## Build Artifact Contract

The asset build MUST:

- render the private `index.hbs` Handlebars source with the shared layout to final HTML at build time;
- write the result as the public `index.html` artifact;
- make `index.html` available in the production static-asset directory and the generated directory
  used by local development;
- not copy the private `index.hbs` Handlebars source into public assets;
- not emit a Handlebars JavaScript template or require any client-side template runtime for this
  page.
