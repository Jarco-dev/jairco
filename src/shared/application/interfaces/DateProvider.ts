export interface DateProvider {
  now(): Date;
  addSeconds(seconds: number, from?: Date): Date;
}
