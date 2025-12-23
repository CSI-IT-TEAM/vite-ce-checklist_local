export function isEqual(obj1: unknown, obj2: unknown): boolean {
  // Nếu giống giá trị primitive => true
  if (obj1 === obj2) return true;

  // Nếu không phải object => false
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1 as object);
  const keys2 = Object.keys(obj2 as object);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    // @ts-ignore: key indexing is safe because we've validated keys
    if (!keys2.includes(key) || !isEqual((obj1 as any)[key], (obj2 as any)[key])) {
      return false;
    }
  }

  return true;
}
