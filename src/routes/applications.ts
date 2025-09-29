import { FastifyPluginAsync } from "fastify";
import prisma from "../config/database.js";
import { createApplicationSchema } from "../schemas/application.js";
import {
  getFileTypeFromS3Key,
  moveFileToApplication,
} from "../services/fileService.js";

const SLACK_WEBHOOK_URL = process.env.SLACK_URL!;

// Send Slack notification for new application
async function sendSlackNotification(application: any, portfolioUrl?: string) {
  try {
    const data = application.data || {};
    const personalInfo = data.personalInfo || {};
    const internshipDetails = data.internshipDetails || {};

    // Map internship type to readable format
    const typeMap: { [key: string]: string } = {
      architecture: "Architecture",
      engineering: "Engineering",
      design: "Design",
      business: "Business",
      other: "Other",
    };

    // Map period to readable format
    const periodMap: { [key: string]: string } = {
      summer: "Summer",
      spring: "Spring",
      fall: "Fall",
      winter: "Winter",
      flexible: "Flexible",
    };

    const name =
      personalInfo.fullName || application.name || "Unknown Applicant";
    const type =
      typeMap[internshipDetails.type] || internshipDetails.type || "Unknown";
    const period =
      periodMap[internshipDetails.period] ||
      internshipDetails.period ||
      "Unknown";

    const message = {
      text: `🎯 New Internship Application Received!`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🎯 New Internship Application",
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Name:*\n${name}`,
            },
            {
              type: "mrkdwn",
              text: `*Type:*\n${type}`,
            },
            {
              type: "mrkdwn",
              text: `*Period:*\n${period}`,
            },
            {
              type: "mrkdwn",
              text: `*Email:*\n${personalInfo.email || "N/A"}`,
            },
          ],
        },
      ],
    };

    // Add portfolio link if available
    if (portfolioUrl) {
      message.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `📄 *Portfolio:* <${portfolioUrl}|View Portfolio>`,
        },
      });
    }

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error(`Failed to send Slack notification: ${response.status}`);
    }
  } catch (error) {
    console.error("Error sending Slack notification:", error);
  }
}

const applicationsRoutes: FastifyPluginAsync = async (fastify) => {
  // Create application - ONLY SAFE ENDPOINT EXPOSED
  fastify.post(
    "/applications",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            data: { type: "object" },
            fileIds: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["name"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              data: { type: "object" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const body = createApplicationSchema.parse(request.body);
      const { fileIds, ...applicationData } = body;

      const application = await prisma.application.create({
        data: applicationData,
      });

      // Move uploaded files to this application if fileIds provided
      if (fileIds && fileIds.length > 0) {
        await Promise.all(
          fileIds.map((fileId) => moveFileToApplication(fileId, application.id))
        );
      }

      // Get the created application with files for Slack notification
      const applicationWithFiles = await prisma.application.findUnique({
        where: { id: application.id },
        include: { files: true },
      });

      // Send Slack notification
      if (applicationWithFiles) {
        // Find portfolio file specifically by checking S3 key pattern
        const portfolioFile = applicationWithFiles.files.find((file) => {
          const fileType = getFileTypeFromS3Key(file.s3Key);
          return (
            fileType === "portfolio" && file.mimeType === "application/pdf"
          );
        });

        let portfolioUrl: string | undefined;
        if (portfolioFile) {
          // Create a public URL using the backend view endpoint (no auth required)
          const baseUrl =
            process.env.BASE_URL || "https://lk0k8gs4gksk84gsk4s0k8ok.saga.dk";
          portfolioUrl = `${baseUrl}/api/files/${portfolioFile.id}/view`;
        }

        // Send notification (don't await - let it run in background)
        sendSlackNotification(applicationWithFiles, portfolioUrl).catch(
          (error) => {
            console.error("Slack notification failed:", error);
          }
        );
      }

      reply.code(201).send(application);
    }
  );
};

export default applicationsRoutes;
