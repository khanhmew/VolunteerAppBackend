export interface ReportDTO {
    _id: string,
    content: string,
    img: Array<String>,
    orgId: string, 
    orgAvt?: string,
    orgFullname?: string,
    dateReport: Date,
    userSendId: string,
    userSendAvatar?: string,
    userSendFullname?: string,
    userSendPhone?: string
}
