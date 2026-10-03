import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

export function createTargetClient(baseURL: string) {
  const jar = new CookieJar();
  const client = wrapper(
    axios.create({
      baseURL,
      jar,
      withCredentials: true,
      timeout: 12_000,
      validateStatus: () => true,
      maxRedirects: 0,
      headers: { 'Accept-Language': 'en-GB' },
    }),
  );
  return { client, jar };
}
