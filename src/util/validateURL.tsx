function isValidURL(urlToTest: string): boolean {
  console.log(urlToTest);

  // Check for empty string
  if (!urlToTest.trim()) {
    console.log(false);
    return false;
  }

  // Check for spaces - URLs can't contain spaces
  if (urlToTest.includes(" ")) {
    console.log(false);
    return false;
  }

  let urlToValidate = urlToTest;
  let addedProtocol = false;

  // If no protocol, try adding https://
  if (!/^https?:\/\//.test(urlToTest)) {
    // Don't add protocol to things that already have other protocols
    if (urlToTest.includes("://")) {
      // Has a protocol, but not http/https - check if it's valid but we'll reject non-http(s)
      try {
        const url = new URL(urlToTest);
        // Only allow http and https protocols
        if (url.protocol === "http:" || url.protocol === "https:") {
          console.log(true);
          return true;
        } else {
          console.log(false);
          return false;
        }
      } catch (_) {
        console.log(false);
        return false;
      }
    }

    // Add https:// for domain-like strings
    urlToValidate = `https://${urlToTest}`;
    addedProtocol = true;
    console.log(urlToValidate);
  }

  try {
    const url = new URL(urlToValidate);

    // Only allow http and https protocols
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      console.log(false);
      return false;
    }

    // If we added a protocol, do additional validation
    if (addedProtocol) {
      const hostname = url.hostname;

      // Reject single words without dots (like "just-text")
      if (!hostname.includes(".")) {
        console.log(false);
        return false;
      }

      // Reject localhost
      if (hostname === "localhost") {
        console.log(false);
        return false;
      }

      // Reject IP addresses (simple check)
      if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        console.log(false);
        return false;
      }
    }

    console.log(true);
    return true;
  } catch (_) {
    console.log(false);
    return false;
  }
}
export default isValidURL;
