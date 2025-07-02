export function toHttpsUrl(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url.replace(/^http:\/\//i, "https://");
}
