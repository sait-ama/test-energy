export const validateUrlDomain = (url: string, domains?: readonly string[] | null) => {
  if (!domains) return true;

  return domains.some((domain) => {
    const hostname = new URL(url).hostname.toLowerCase();

    return hostname.endsWith(domain.toLowerCase());
  });
};
