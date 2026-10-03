# Location Display Contract

No backend contract changes are required.

The React nearby-reports component receives the existing transient detected location and displays:

```text
Latitude: <five decimal places>
Longitude: <five decimal places>
```

The nearby lookup continues using the original full-precision coordinate values. No formatted values
are included in API requests, API responses, browser storage, or logs.
