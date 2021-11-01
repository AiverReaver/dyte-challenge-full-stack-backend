import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { Url } from "../entity/Url";
import * as validUrl from 'valid-url'
import { nanoid } from 'nanoid'
import { AuthInfoRequest } from "../interfaces/AuthInterface";
import { User } from "../entity/User";

export class UrlController {

    private urlRepository = getRepository(Url);
    private baseURL;

    constructor() {
        this.baseURL = `${process.env.BASE_URL}/`
    }

    async all(request: AuthInfoRequest, response: Response) {
        try {
            const urls = await this.urlRepository.find({ user: request.user })

            response.status(200).send({ data: urls, message: "urls fetched" })
        } catch (err) {
            throw err
        }

    }

    async shorten(request: AuthInfoRequest, response: Response): Promise<any> {
        try {
            const { actualUrl } = request.body

            const isValidUrl = validUrl.isUri(actualUrl)
            if (!isValidUrl) {
                response.status(400).send({ message: "Invalid Url" })
            }

            if (isValidUrl) {
                const url = await this.urlRepository.findOne({ actualUrl })

                if (url) {
                    response.status(201).send({ message: "url shorten", data: url })
                } else {
                    const shortId = nanoid(7)
                    const shortUrl = this.baseURL + shortId

                    const newUrl = this.urlRepository.create({ actualUrl, shortUrl, shortId, user: request.user })
                    const savedUrl = await this.urlRepository.save(newUrl)

                    response.status(201).send({ message: "url shorten", data: savedUrl })
                }
            }
        } catch (err) {
            throw err
        }
    }

    async deleteUrl(request: AuthInfoRequest, response: Response) {
        try {
            const { shortId } = request.params;

            const url = await this.urlRepository.findOne({ shortId }, { relations: ['user'] });
            if (url) {

                if (url.user.id === request.user.id) {
                    await this.urlRepository.delete({ shortId });
                    response.send({ message: "deleted Successfully" })
                } else {
                    response.status(400).send({ message: "unauthoried" })
                }
            } else {
                response.status(404).send({ message: "Url not found" })
            }

        } catch (err) {
            response.send({ message: err.message })
        }
    }

    async redirectToActualUrl(request: Request, response: Response) {
        try {
            const { shortId } = request.params
            const { isUnique } = request.query

            const url = await this.urlRepository.findOne({ shortId });

            if (url) {

                if (!!parseInt(isUnique as string)) {
                    url.visitors += 1
                }

                url.views += 1
                this.urlRepository.save(url)

                return response.status(200).send({ data: url.actualUrl, message: "long url" })
            }

            return response.status(404).json({ message: "Invalid Url" })
        } catch (err) {
            throw err
        }
    }

}