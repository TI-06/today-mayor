import {readdir,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';

const roots=['site/js','functions','scripts'];
const files=[];
async function walk(root){for(const name of await readdir(root)){const file=path.join(root,name);const info=await stat(file);if(info.isDirectory())await walk(file);else if(file.endsWith('.js')||file.endsWith('.mjs'))files.push(file)}}
for(const root of roots)await walk(root);
for(const file of files){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status??1)}
console.log(`JavaScript syntax OK: ${files.length} files`);
