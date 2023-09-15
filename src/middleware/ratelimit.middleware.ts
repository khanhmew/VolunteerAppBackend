import { Request, Response } from "express";
import { ResponseBase, ResponseStatus } from "../shared/response/response.payload";
import { rateLimit } from "express-rate-limit";

const handleRateLimit = (req: Request, res: Response) => {
    const _response = ResponseBase(
        ResponseStatus.LIMITREQUEST,
        'Too many requests - try request again after 15 minutes',
    )
    return res.status(429).json(_response);
}
export const RateLimit = (retryPerMinutes: number, maxRequest: number) => {
    return rateLimit({
        windowMs: retryPerMinutes * 60 * 1000, // 15 minutes
        max: maxRequest, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
        handler: (req, res) => { handleRateLimit(req, res); }
    })
}