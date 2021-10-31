import { AuthController } from "./controller/AuthController";
import { UserController } from "./controller/UserController";
import { Route } from "./interfaces/RouteInterface";

export const Routes: Route[] = [{
    method: "post",
    route: "/register",
    controller: AuthController,
    action: "register"
}, {
    method: "post",
    route: "/login",
    controller: AuthController,
    action: "login",
}, {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "one"
}, {
    method: "post",
    route: "/users",
    controller: UserController,
    action: "save"
}, {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "remove"
}];