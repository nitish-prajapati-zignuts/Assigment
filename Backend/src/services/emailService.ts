import { Resend } from "resend";
import { currentEnviromentType, getCurrentEnviroment } from "../utils/config";
import { config } from "../utils/config";
import { getMagicLinkEmailTemplate } from "../utils/emailTemplate";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";
const projectRoot = path.join(__dirname, "../../../");

const resend = new Resend(config.RESEND_EMAIL_API);

export const emailService = async (emailId: string, generateToken: string): Promise<boolean> => {
  const currentEnviroment: currentEnviromentType = getCurrentEnviroment();

  let baseUri = "";
  if (currentEnviroment === "Production") {
    baseUri = config.PRODUCTION_DEPLOYMENT_URI;
  } else if (currentEnviroment === "Test") {
    baseUri = config.TEST_DEPLOYMENT_URI;
  } else {
    baseUri = config.DEVELOPMENT_DEPLOYMENT_URI;
  }

  // Fallback if environment URI is empty
  if (!baseUri) {
    baseUri = "http://localhost:3000/";
  }

  const cleanBaseUri = baseUri.replace(/\/$/, "");
  const reslink = `${cleanBaseUri}/reset-password?token=${generateToken}`;

  console.log(reslink);

  const htmlContent = getMagicLinkEmailTemplate(reslink, emailId);
  try {
    fs.writeFileSync(path.join(projectRoot, "magic_link_preview.html"), htmlContent, "utf8");

    logger.info(`Preview of password reset email written to: ${path.join(projectRoot, "magic_link_preview.html")}`);
  } catch (fsErr) {
    logger.warn("Failed to write email preview file", { error: (fsErr as Error).message });
  }

  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: emailId,
      subject: "Reset Password",
      html: htmlContent,
    });

    if (response.error) {
      logger.error("Resend API failed to send email", response.error as any);

      if (currentEnviroment === "Development") {
        logger.info(
          "[DEV FALLBACK] Allowing flow to succeed in development. You can preview the reset link in magic_link_preview.html"
        );
        return true;
      }
      return false;
    }

    logger.info(`Email sent successfully: ${response.data?.id}`);
    return true;
  } catch (sendErr) {
    logger.error("Error occurred while sending email with Resend", sendErr as Error);

    if (currentEnviroment === "Development") {
      logger.info(
        "[DEV FALLBACK] Allowing flow to succeed in development. You can preview the reset link in magic_link_preview.html"
      );
      return true;
    }
    return false;
  }
};
