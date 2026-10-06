// Off camera: pve-01, docker-01 (deploy identity) and the OpenWrt router (root) in the personal vault, tagged homelab.
const { useConnectionStore: conns } = await import('/src/stores/connectionStore.ts');
const { useIdentityStore: ids } = await import('/src/stores/identityStore.ts');
const { saveIdentityFromForm } = await import('/src/services/keychainForm.ts');
const deploy = ids.getState().identities.find((x) => x.username === 'deploy');
const vault = deploy.vault_id;
const root = ids.getState().identities.find((x) => x.username === 'root')
  ?? await saveIdentityFromForm(null, { name: 'root', username: 'root', tags: [], vault_id: vault }, 'openwrt', undefined, { current: null }, vault);
for (const [name, who] of [['pve-01', deploy], ['docker-01', deploy], ['router', root]]) {
  if (conns.getState().connections.some((c) => c.name === name)) continue;
  await conns.getState().saveConnection({ name, host: name, port: 22, username: who.username, auth_type: 'password', identity_id: who.id, tags: ['homelab'], vault_id: vault });
}
return conns.getState().connections.length + ' hosts';
