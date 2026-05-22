import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "us-east-1" });
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

export const handler = async (event) => {
    const body = JSON.parse(event.body || "{}");

    const subject = body.subject || "[MediCare+] Notification";
    const patientName = body.patientName || "Patient";
    const message = body.message || "You have a new notification from MediCare+.";

    const emailBody = [
        "==================================================",
        "             MEDICARE+ HEALTH SYSTEM              ",
        "==================================================",
        `Dear ${patientName},`,
        "",
        message,
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
        Message: emailBody
    }));

    console.log(`[LAMBDA] API Gateway notification sent: ${subject}`);

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true, message: "Notification sent via Lambda." })
    };
};
