export function hashCode(str: string): number {
  return str.split("").reduce((acc, value) => {
    acc = (acc << 5) - acc + value.charCodeAt(0);

    return acc & acc;
  }, 0);
}
