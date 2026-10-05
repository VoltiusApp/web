// Off camera: disconnect and close every session.
const { useSessionStore } = await import('/src/stores/sessionStore.ts');
for (const s of [...useSessionStore.getState().sessions]) { try { await useSessionStore.getState().disconnect(s.id); } catch {} useSessionStore.getState().removeSession(s.id); }
return useSessionStore.getState().sessions.length;
