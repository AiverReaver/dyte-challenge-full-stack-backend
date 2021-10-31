import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { Url } from "../entity/Url";
import * as validUrl from 'valid-url'
import { nanoid } from 'nanoid'

export class UrlController {

    private urlRepository = getRepository(Url);
    private baseURL;

    constructor() {
        this.baseURL = `${process.env.BASE_URL}:${process.env.PORT || 3000}/`
    }

    async shorten(request: Request, response: Response): Promise<any> {
        try {
            const { actualUrl } = request.body

            const isValidUrl = validUrl.isUri(actualUrl)
            if (!isValidUrl) {
                response.status(400).send({ message: "Invalid Url" })
            }

            if (isValidUrl) {
                const url = await this.urlRepository.findOne({ actualUrl })

                if (url) {
                    return url
                } else {
                    const shortId = nanoid(7)
                    const shortUrl = this.baseURL + shortId

                    const newUrl = this.urlRepository.create({ actualUrl, shortUrl, shortId })

                    return response.status(201).send(await this.urlRepository.save(newUrl))
                }
            }
        } catch (err) {
            throw err
        }
    }

    async redirectToActualUrl(request: Request, response: Response) {
        try {
            const { shortId } = request.params

            const url = await this.urlRepository.findOne({ shortId });

            if (url) {
                url.visitors += 1
                this.urlRepository.save(url)

                return response.redirect(url.actualUrl)
            }

            return response.status(404).json({ message: "Invalid Url" })
        } catch (err) {
            throw err
        }
    }



}