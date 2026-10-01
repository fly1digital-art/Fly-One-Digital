import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync('lib/site-content.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const content=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('compiled entry and CSS exist; saved defaults match source',()=>{
 const manifest=JSON.parse(readFileSync('webassets/.vite/manifest.json','utf8'));
 const entry=manifest['hostinger/main.tsx'];assert.ok(existsSync('webassets/'+entry.file));for(const css of entry.css)assert.ok(existsSync('webassets/'+css));
 assert.deepEqual(JSON.parse(readFileSync('hostinger/server/defaults.json','utf8')),content.defaultContent);
});
test('video providers reject spoofed hosts and unsafe URLs',()=>{
 for(const url of ['https://www.facebook.com/demo/videos/123456/','https://facebook.com/watch/?v=123456','https://facebook.com/reel/123456/'])assert.equal(content.parseVideo(url).kind,'facebook');
 for(const url of ['javascript:alert(1)','https://www.facebook.com.attacker.test/p/videos/123/','https://facebook.com/share/v/abc/','https://evil.test/1.mp4'])assert.equal(content.parseVideo(url),null);
 assert.equal(content.parseVideo('https://youtu.be/M7lc1UVf-VE').kind,'youtube');
 assert.equal(content.parseVideo('/api/media/12345678-1234-1234-1234-123456789abc.mp4').kind,'file');
});
test('phone upgrade preserves subsequently chosen admin number',()=>{
 const old={...content.defaultDocument.product,phone:'+8801990090262'};
 assert.equal(content.resolveDocument({product:old}).product.phone,'+8801323527412');
 const chosen={...old,phone:'+8801712345678'};assert.equal(content.resolveDocument({product:chosen}).product.phone,chosen.phone);
});
test('all generated deployment entrypoints are present',()=>{
 for(const f of ['index.php','setup.php','login.php','logout.php','.htaccess','hostinger/server/core.php','hostinger/server/api.php','hostinger/server/media.php','hostinger/server/validation.php','hostinger/server/schema.sql','HOSTINGER-SETUP.md'])assert.ok(existsSync(f),f);
});
