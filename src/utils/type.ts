export interface responseType<T> {
  code: number | string;
  msg: string;
  data: T;
}
