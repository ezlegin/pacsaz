type QueryValue = string | undefined | null;

export function updateQueryParam(
  searchParams: URLSearchParams,
  router: { push: (url: string) => void },
  key: string,
  value?: QueryValue
) {
  const params = new URLSearchParams(searchParams.toString());

  if (value == null || value === "") {
    params.delete(key);
  } else {
    params.set(key, value);
  }

  router.push(`?${params.toString()}`);
}
