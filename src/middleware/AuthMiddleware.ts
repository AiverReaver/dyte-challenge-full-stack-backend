import { NextFunction, Request, Response } from "express";
import * as jsonWenToken from 'jsonwebtoken';
import { AuthInfoRequest } from "../interfaces/AuthInterface";

export const verifyToken = (request: AuthInfoRequest, response: Response, next: NextFunction) => {
    try {

        let token = request.headers.token;
        if (!token) {
            return response.status(401).send({ message: "unauthorised" })
        }

        const decodedToken = jsonWenToken.verify(token, process.env.JWT_SECRET)

        request.user = decodedToken

        next()
    } catch (err) {
        return response.status(401).send({ message: "expired or invalid token" })
    }

}