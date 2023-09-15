import { v4 as uuidv4 } from 'uuid';

export interface ResponsePayload {
    id: string;
    timestamp: string;
    apiVersion: Version;
    status: ResponseStatus;
    message: string;
    data?: any;
}

export enum ResponseStatus {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
    CREATED = 'CREATED',
    ERROR = 'ERROR',
    TIMEOUT = 'TIMEOUT',
    WRONG_FORMAT = 'WRONG_FORMAT',
    NO_PERMISSIONS = 'NO_PERMISSIONS',
    UNAUTHORIZE = 'UNAUTHORIZE',
    FORBIDDENT = 'FORBIDDENT',
    LIMITREQUEST = 'LIMITREQUEST',
    NOT_FOUND = 'NOT_FOUND',
}

export enum Version {
    V1 = 'v0.0.1'
}

export const ResponseBase = (status: ResponseStatus, message: string, data?: any) => {
    const _response: ResponsePayload = {
        id: uuidv4(),
        timestamp: Date.now().toString(),
        apiVersion: Version.V1,
        status: status,
        message: message,
        data: data
    };
    return _response;
}


