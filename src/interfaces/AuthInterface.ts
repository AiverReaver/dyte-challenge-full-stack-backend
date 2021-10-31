import { Request } from "express";

export interface AccessToken {
    token: string;
    refresh_token: string;
}
export interface userReqBody {
    username: string;
    password: string
}

export interface AuthInfoRequest extends Request {
    user?: { id: Number, username: string }
}