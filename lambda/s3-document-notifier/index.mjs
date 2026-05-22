import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "us-east-1" });
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

export const handler = async (event) => {
    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
        const sizeKb = (record.s3.object.size / 1024).toFixed(2);
        const eventTime = new Date(record.eventTime).toUTCString();

        const fileName = key.split("/").pop();

        const subject = "[MediCare+] Medical Document Uploaded Successfully";

        const body = [
            "==================================================",
            "             MEDICARE+ HEALTH SYSTEM              ",
            "==================================================",
            "A new medical document has been uploaded to the MediCare+ Vault.",
            "",
            "DOCUMENT DETAILS",
            "--------------------------------------------------",
            `File Name:  ${fileName}`,
            `File Size:  ${sizeKb} KB`,
            `Bucket:     ${bucket}`,
            `Uploaded:   ${eventTime}`,
            "--------------------------------------------------",
            "",
            "This file is now securely stored and accessible via",
            "the MediCare+ patient portal under Documents.",
            "",
            "MediCare+ Administration Team",
            "==================================================",
            "This is a system-generated message. Please do not reply."
        ].join("\n");

        await snsClient.send(new PublishCommand({
            TopicArn: SNS_TOPIC_ARN,
            Subject: subject,
            Message: body
        }));

        console.log(`[LAMBDA] S3 upload notification sent for: ${key} (${sizeKb} KB)`);
    }
};
