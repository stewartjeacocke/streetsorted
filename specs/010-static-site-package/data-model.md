# Data Model: Independently Deployable Static Site Package

## Static-site build input

| Field | Type | Validation | Purpose |
|---|---|---|---|
| `publicServerBaseUrl` | absolute HTTPS or HTTP URL | No credentials, query string, fragment, or trailing slash | Public origin used to render links from the landing page to dynamic server pages. |
| `councils` | ordered collection of public council profiles | Each profile has a unique identifier, display name, support flag, and public council destination URL | Supplies the landing-page council directory. |
| `sourceRevision` | non-empty revision identifier | Supplied through the required public `SOURCE_REVISION` build input | Identifies the source revision represented by a release artifact. |

The build input is public. It MUST NOT contain API keys, bearer tokens, session values, passwords, or
server-only configuration.

## Public council profile

| Field | Type | Validation | Purpose |
|---|---|---|---|
| `id` | string | Unique within the directory | Stable identity shared by the server and static-site content. |
| `displayName` | string | Non-empty | Visitor-facing council name. |
| `anonymousSubmissionAvailable` | boolean | Required | Determines the public support statement shown on the landing page. |
| `councilSubmissionUrl` | absolute URL | Public URL | Visitor-facing council destination. |

## Release manifest

| Field | Type | Validation | Purpose |
|---|---|---|---|
| `artifactType` | enum: `static-site`, `server` | Required | Distinguishes independently deployable artifacts. |
| `sourceRevision` | string | Matches the build input | Associates the artifact with a source revision. |

### Lifecycle

1. A release environment supplies `PUBLIC_SERVER_BASE_URL`, `SOURCE_REVISION`, and public static-site input.
2. The static-site builder renders `index.html`, copies only public assets, writes the static-site manifest,
   and validates the output directory.
3. A failed validation removes or withholds the incomplete static-site output.
4. The server build writes its server manifest independently; it does not generate the static-site package.
5. Operators publish either artifact without requiring the other artifact to be rebuilt or deployed.
