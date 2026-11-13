import type { AccountNotice } from "./session";

export const INVITATION_NOT_FOUND =
  "This invitation has expired, was withdrawn, or was already accepted. Ask the person who invited you for a new one.";
export const INVITATION_WITHDRAWN =
  "The person who invited you can no longer add you to this team. Ask for a new invitation.";
export const REGISTRATION_CLOSED =
  "Account registration is disabled on this server. Contact your administrator for an invitation.";

export function joinedNotice(teamName: string): AccountNotice {
  return { tone: "success", text: `You've joined ${teamName}. Open Voltius to access the shared vault.` };
}
