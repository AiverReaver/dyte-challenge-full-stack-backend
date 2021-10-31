import { AuthController } from "./controller/AuthController";
import { UrlController } from "./controller/UrlController";
import { Route } from "./interfaces/RouteInterface";
import { verifyToken } from "./middleware/AuthMiddleware";

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
    action: "shorten",
    middlewareArr: [verifyToken]
}, {
    method: "get",
    route: "/:shortId",
    controller: UrlController,
    action: "redirectToActualUrl"
},];