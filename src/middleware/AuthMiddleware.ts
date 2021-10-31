import { NextFunction, Request, Response } from "express";
import * as jsonWenToken from 'jsonwebtoken';
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import { AuthInfoRequest } from "../interfaces/AuthInterface";

export const verifyToken = async (request: AuthInfoRequest, response: Response, next: NextFunction) => {
    try {

        let token = request.headers.token;
        if (!token) {
            return response.status(401).send({ message: "unauthorised" })
        }

        const decodedToken = jsonWenToken.verify(token, process.env.JWT_SECRET)


        request.user = await getRepository(User).findOne({ id: decodedToken.id })

        next()
    } catch (err) {
        return response.status(401).send({ message: "expired or invalid token" })
    }

}