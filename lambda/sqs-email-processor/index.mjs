import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "us-east-1" });
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

export const handler = async (event) => {
    for (const record of event.Records) {
        const data = JSON.parse(record.body);

        const subject = `[MediCare+] Appointment Update: ${data.Status} - ${data.PatientName}`;

        const body = [
            "==================================================",
            "             MEDICARE+ HEALTH SYSTEM              ",
            "==================================================",
            `Dear ${data.PatientName},`,
            "",
            "This is an automated notification regarding your appointment status.",
            "",
            "APPOINTMENT SUMMARY",
            "--------------------------------------------------",
            `Current Status:  ${data.Status.toUpperCase()}`,
            `Update Details:  ${data.MessageBody}`,
            "--------------------------------------------------",
            "",
            "If you have any questions or did not request this update,",
            "please contact our administration office immediately.",
            "",
            "Thank you for choosing MediCare+.",
            "",
            "Best Regards,",
            "MediCare+ Administration Team",
            "==================================================",
            "This is a system-generated message. Please do not reply."
        ].join("\n");

        await snsClient.send(new PublishCommand({
            TopicArn: SNS_TOPIC_ARN,
            Subject: subject,
            Message: body
        }));

        console.log(`[LAMBDA] Email notification sent for: ${data.PatientName} (${data.Status})`);
    }
};
