import { getRepository } from "typeorm";
import { Request, Response } from "express";
import * as bcrypt from 'bcrypt';
import * as JsonWebToken from 'jsonwebtoken'
import { User } from "../entity/User";
import { AccessToken, userReqBody } from "../interfaces/AuthInterface";

export class AuthController {

    private userRepository = getRepository(User);

    async register(request: Request, response: Response) {
        try {

            const { username, password } = request.body as userReqBody

            const isUserExist = await this.userRepository.findOne({ username })

            if (isUserExist) {
                response.status(400).send({ message: "User already exist" })
            }

            this.verifyRequestBody(request, response);
            const salt = await bcrypt.genSalt(10);

            const hashPassword = await bcrypt.hash(password, salt);

            const user = this.userRepository.create({ username, password: hashPassword });

            const savedUser = await this.userRepository.save(user);

            response.status(201).send({ message: "User registered", data: { id: savedUser.id, username: savedUser.username } })
        } catch (err) {
            throw err
        }
    }

    async login(request: Request, response: Response) {
        try {
            const { username, password } = request.body;

            this.verifyRequestBody(request, response);

            const user = await this.userRepository.findOne({ username })

            if (user) {
                const validPassword = await bcrypt.compare(password, user.password)
                const token: AccessToken = this.generateJWT({ id: user.id, username: user.username })

                if (validPassword) {
                    response.status(200).send({ message: "User login", data: { ...token, username: user.username } })
                } else {
                    response.status(400).send({ message: "Either username or password is wrong" })
                }

            } else {
                response.status(400).send({ message: "User does not exist" })
            }
        } catch (err) {
            throw err
        }

    }

    private verifyRequestBody(req: Request, res: Response) {
        const { username, password } = req.body
        if (!username || !password) {
            res.status(400).send({ error: "username and password is required" })
        }
    }

    private generateJWT(user: {}): AccessToken {

        let token = JsonWebToken.sign({ ...user }, process.env.JWT_SECRET, {
            expiresIn: "20d",
            algorithm: "HS256",
        });

        let refresh_token = JsonWebToken.sign(
            { ...user },
            process.env.JWT_REFRESH_SECRET!,
            { algorithm: "HS256" }
        );

        return { token, refresh_token };

    }

}