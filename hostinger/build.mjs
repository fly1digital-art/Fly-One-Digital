import {readFileSync,writeFileSync} from 'node:fs';
import ts from 'typescript';
import {build} from 'vite';
const source=readFileSync(new URL('../lib/site-content.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {defaultContent}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
writeFileSync(new URL('server/defaults.json',import.meta.url),JSON.stringify(defaultContent,null,2)+'\n');
await build({configFile:new URL('vite.config.ts',import.meta.url).pathname});
