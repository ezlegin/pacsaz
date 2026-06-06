export function pagination(page: string, pageSize: number) {
  return {
    skip: (+page || 1) * pageSize - pageSize,
    take: pageSize,
  };
}
