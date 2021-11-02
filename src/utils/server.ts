import { Express } from 'express';
import * as express from 'express';
import { Request, Response } from "express";
import * as cors from 'cors'
import * as useragent from 'express-useragent'
import { Routes } from '../routes';

export async function createServer(): Promise<Express> {
    const app = express();
    app.use(cors())
    app.use(express.json());
    app.use(useragent.express())


    Routes.forEach(route => {


        const middlewareFn = route.middlewareArr ? (req: Request, res: Response, next: express.NextFunction) => {
            route.middlewareArr.forEach(middleware => {
                try {
                    middleware(req, res, next)

                } catch (err) {
                    let error = err;
                    if (!(error instanceof Error)) {
                        error = new Error("something went wrong")
                    }
                    res.status(500).send({ message: error.message })
                }
            })

        } : (req: Request, res: Response, next: express.NextFunction) => {
            next();
        }

        (app as any)[route.method](route.route, middlewareFn, (req: Request, res: Response, next: Function) => {

            console.log(route.route)

            const result = (new (route.controller as any))[route.action](req, res, next);
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)
                    .catch((err) => res.status(500).send({ error: "Something Went Wrong", err }));

            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });

    return app;
}