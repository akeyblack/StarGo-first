export function prom(smth: unknown, time?: number): Promise<unknown> {
  return new Promise(resolve => {
    setTimeout(() => resolve(smth), time ? time : 10000);
  })
}