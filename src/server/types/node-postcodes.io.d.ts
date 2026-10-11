declare module 'node-postcodes.io' {
  type LookupResult = { status: number; result?: unknown; error?: string };
  const postcodes: {
    lookup(postcode: string): Promise<LookupResult>;
    geo(
      latitude: number,
      longitude: number,
      options?: Record<string, unknown>,
    ): Promise<LookupResult>;
  };
  export default postcodes;
}
