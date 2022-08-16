export function prom(message: string): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => resolve(message), 10000);
  })
}