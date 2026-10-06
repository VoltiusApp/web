// Off camera: a snippet with two variables, for #32. Prompts for both before it runs.
const { useSnippetStore: sn } = await import('/src/stores/snippetStore.ts');
const { useIdentityStore: ids } = await import('/src/stores/identityStore.ts');
await Promise.all([sn.getState().loadSnippets(), ids.getState().loadIdentities()]);
const NAME = 'Package changes';
for (const s of sn.getState().snippets.filter((s) => s.name === NAME)) await sn.getState().deleteSnippet(s.id);
await sn.getState().createSnippet({ name: NAME, tags: [], favorite: false, only_for_connection_tags: [], only_for_distros: [], vault_id: ids.getState().identities[0].vault_id,
    steps: [{ kind: 'script', content: 'grep " {{action:choice:upgrade,install,remove|Action}} " /var/log/dpkg.log | tail -n {{lines:number|How many}}' }] });
return sn.getState().snippets.map((s) => s.name).join(', ');
