import { AuthController } from "./controller/AuthController";
import { UrlController } from "./controller/UrlController";
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
    method: "post",
    route: "/url/shorten",
    controller: UrlController,
    action: "shorten"
}, {
    method: "get",
    route: "/:shortId",
    controller: UrlController,
    action: "redirectToActualUrl"
},];