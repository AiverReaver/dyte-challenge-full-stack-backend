import { Request, Response, NextFunction } from "express";

export type MiddlewareType = (
    req: Request,
    res: Response,
    next: NextFunction
) => void;