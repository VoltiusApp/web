"use client";

import { useEffect, useState } from "react";
import { getInvitation, type InvitationDetails } from "./api";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner", manager: "Manager", editor: "Editor",
  member: "Member", "connect-only": "Connect-Only",
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

export function inviterLabel(invitation: InvitationDetails): string {
  const name = invitation.inviter_display_name;
  return name && name !== "A teammate" ? `@${name}` : "A teammate";
}

/** Undefined while loading, null when the token names no live invitation. */
export function useInvitation(token: string | null): InvitationDetails | null | undefined {
  const [loaded, setLoaded] = useState<{ token: string; invitation: InvitationDetails | null } | null>(null);
  useEffect(() => {
    if (!token) return;
    let live = true;
    getInvitation(token)
      .then((invitation) => { if (live) setLoaded({ token, invitation }); })
      .catch(() => { if (live) setLoaded({ token, invitation: null }); });
    return () => { live = false; };
  }, [token]);
  if (!token) return null;
  return loaded?.token === token ? loaded.invitation : undefined;
}
