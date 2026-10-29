import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import * as policy from '../src/lib/adsense-policy.mjs';
const require = createRequire(import.meta.url);

async function mount(host, fail = false) {
  const effects=[], diagnostics=[], resize=[], mutations=[];
  const attributes=new Map();let pushes=0, loads=0, ref=0, state=0;
  const element={isConnected:true,getAttribute:key=>attributes.get(key)??null,getBoundingClientRect:()=>({width:320,height:280})};
  const react={useRef:()=>({current:ref++===0?element:element}),useState:initial=>[++state===1?initial:'waiting', state===1?()=>{}:value=>diagnostics.push(value)],useEffect:fn=>effects.push(fn),useSyncExternalStore:(_,snapshot)=>snapshot()};
  const exports={};
  const code=ts.transpileModule(fs.readFileSync('src/components/ad-banner.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext(code,{exports,require:id=>id==='react'?react:id==='next/navigation'?{usePathname:()=>'/product/test'}:id.includes('adsense-policy')?policy:id.includes('adsense-browser')?{loadAdSense:()=>{loads++;return Promise.resolve();}}:require(id),window:{location:{hostname:host},adsbygoogle:{push:()=>{pushes++;if(fail)throw Error('ad failure');}}},ResizeObserver:class{constructor(fn){resize.push(fn);}observe(){}disconnect(){}},IntersectionObserver:class{constructor(fn){this.fn=fn;}observe(){this.fn([{isIntersecting:true}]);}disconnect(){}},MutationObserver:class{constructor(fn){mutations.push(fn);}observe(){}disconnect(){}}});
  const tree=exports.AdBanner({placement:'results'});
  const cleanups=effects.map(fn=>fn());await Promise.resolve();await Promise.resolve();
  return {tree,diagnostics,attributes,resize,mutations,counts:()=>({pushes,loads}),cleanup:()=>cleanups.forEach(fn=>fn?.())};
}
test('diagnostics distinguish errors and filled state without retrying the submitted slot',async()=>{
  const failed=await mount('www.dfmoa.com',true);
  assert.deepEqual(failed.counts(),{pushes:1,loads:1});assert.equal(failed.diagnostics.at(-1),'push-error');
  failed.resize.forEach(fn=>fn());assert.equal(failed.counts().pushes,1);assert.equal(failed.diagnostics.at(-1),'push-error');failed.cleanup();
  const success=await mount('www.dfmoa.com');success.attributes.set('data-ad-status','unfilled');success.mutations.forEach(fn=>fn());
  assert.equal(success.diagnostics.at(-1),'unfilled');assert.equal(success.counts().pushes,1);success.cleanup();
});
test('preview diagnostics do not call the loader or push ads',async()=>{
  const preview=await mount('127.0.0.1');assert.deepEqual(preview.counts(),{pushes:0,loads:0});
  assert.equal(preview.tree.props['data-ad-state'],'preview-blocked');preview.cleanup();
});
