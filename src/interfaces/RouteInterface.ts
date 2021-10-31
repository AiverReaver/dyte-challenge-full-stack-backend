
import { MiddlewareType } from "../types/MiddlewareType";

export interface Route {
  method: string,
  route: string,
  controller: any,
  action: string,
  middlewareArr?: MiddlewareType[]
}