import { ensureSession, jsAsync } from './wd.mjs';
await ensureSession();
const FOLDERS = ['Production', 'Kubernetes', 'Databases', 'Homelab'];
const HOSTS = [
  ['web-01', 'web-01', 'Production', 'nginx', ['prod', 'web']],
  ['web-02', 'web-02', 'Production', 'nginx', ['prod', 'web']],
  ['api-gateway', 'api-gateway', 'Production', 'nodejs', ['prod']],
  ['cache-01', 'cache-01', 'Production', 'redis', ['prod']],
  ['k8s-node-1', 'k8s-node-1', 'Kubernetes', 'kubernetes', ['k8s']],
  ['k8s-node-2', 'k8s-node-2', 'Kubernetes', 'kubernetes', ['k8s']],
  ['ci-runner', 'ci-runner', 'Kubernetes', 'docker', ['ci']],
  ['db-primary', 'db-primary', 'Databases', 'postgresql', ['prod', 'db']],
  ['db-replica', 'db-replica', 'Databases', 'postgresql', ['db']],
  ['analytics', 'analytics', 'Databases', 'mongodb', ['db']],
  ['grafana', 'grafana', 'Homelab', 'grafana', ['monitoring']],
  ['pihole', 'pihole', 'Homelab', 'raspbian', ['home']],
  ['nas-01', 'nas-01', 'Homelab', 'debian', ['home']],
];
console.log(await jsAsync(`
  const [FOLDERS, HOSTS] = arguments;
  const { useFolderStore } = await import('/src/stores/folderStore.ts');
  const { useConnectionStore } = await import('/src/stores/connectionStore.ts');
  const { storeSecret } = await import('/src/services/vault.ts');
  const ids = {};
  for (const f of FOLDERS) ids[f] = (await useFolderStore.getState().saveFolder({ name: f, object_type: 'connection' })).id;
  for (const [name, host, folder, icon, tags] of HOSTS) {
    const c = await useConnectionStore.getState().saveConnection({ name, host, port: 2222, username: 'deploy', auth_type: 'password', tags, folder_id: ids[folder], icon, distro: 'alpine' });
    await storeSecret('password:' + c.id, 'deploy');
  }
  return 'seeded ' + useConnectionStore.getState().connections.length;
`, [FOLDERS, HOSTS]));
