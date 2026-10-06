// Off camera, in promo-phone: a handful of the fleet in the phone's synced vault, for #28. Passwords go to the vault like the form's.
const { useConnectionStore: conns } = await import('/src/stores/connectionStore.ts');
const { storeSecret } = await import('/src/services/vault.ts');
const HOSTS = [['pve-01', 'deploy', 'deploy'], ['docker-01', 'deploy', 'deploy'], ['router', 'root', 'openwrt'], ['api-01', 'deploy', 'deploy'], ['api-02', 'deploy', 'deploy'], ['db-01', 'deploy', 'deploy'], ['cache-01', 'deploy', 'deploy']];
for (const [name, user, pass] of HOSTS) {
  if (conns.getState().connections.some((c) => c.name === name)) continue;
  const c = await conns.getState().saveConnection({ name, host: name, port: 22, username: user, auth_type: 'password', tags: [], vault_id: 'personal' });
  await storeSecret(`password:${c.id}`, pass);
}
return conns.getState().connections.map((c) => c.name).join(', ');
