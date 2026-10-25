import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as policy from '../src/lib/adsense-policy.mjs';
function loader(host){
 const appended=[];const exports={};
 const document={querySelector:()=>null,createElement:()=>({}),head:{appendChild:s=>{appended.push(s);s.onload();}}};
 const code=ts.transpileModule(fs.readFileSync('src/lib/adsense-browser.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 vm.runInNewContext(code,{exports,require:()=>policy,window:{location:{hostname:host}},document,Promise,Error});
 return {load:exports.loadAdSense,appended};
}
test('preview loader never creates a script; production callers share one script',async()=>{
 for(const host of ['localhost','127.0.0.1','preview--dfmoa.netlify.app']){const x=loader(host);await assert.rejects(x.load());assert.equal(x.appended.length,0);}
 const x=loader('www.dfmoa.com');await Promise.all([x.load(),x.load(),x.load()]);assert.equal(x.appended.length,1);assert.match(x.appended[0].src,/ca-pub-2271072565444318/);
});
test('export retains the exact authorized ads.txt publisher record',()=>{
 const expected='google.com, pub-2271072565444318, DIRECT, f08c47fec0942fa0';
 assert.equal(fs.readFileSync('public/ads.txt','utf8').trim(),expected);
 if(fs.existsSync('out/ads.txt'))assert.equal(fs.readFileSync('out/ads.txt','utf8').trim(),expected);
});
