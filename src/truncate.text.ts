
export const truncate = (str: string, length: number) =>
  str.length > length ? str.slice(0, length) : str;