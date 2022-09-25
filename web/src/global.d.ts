import "dayjs";

declare module "dayjs" {
  export interface Dayjs {
    toNow: (boolean) => string;
  }
}
