import assert from 'node:assert/strict';
import {expansionState, lineGradientPosition} from '../dist/motion-rules.mjs';

// The frame starts cropped, reaches the full viewport at 55% of its scroll,
// and reveals readable content later. Reverse scroll must follow the same path.
const desktopStart = expansionState(0, 1440);
assert.equal(desktopStart.horizontalInset, 35);
assert.equal(desktopStart.verticalInset, 30);
assert.equal(desktopStart.opacity, 0);
assert.equal(expansionState(0, 390).horizontalInset, 20);
assert.equal(expansionState(0.55, 1440).horizontalInset, 0);
assert.equal(expansionState(0.55, 1440).opacity, 0);
assert.equal(expansionState(0.72, 1440).opacity, 1);
assert.equal(expansionState(1, 1440).offset, 0);
assert.equal(expansionState(-1, 1440).scale, 1.25);
assert.equal(expansionState(2, 1440).scale, 1);
const positions = [0, 0.2, 0.4, 0.6, 0.8, 1];
const forward = positions.map(position => expansionState(position, 1440));
const backward = [...positions].reverse().map(position => expansionState(position, 1440)).reverse();
assert.deepEqual(forward, backward);
for (let index = 1; index < forward.length; index++) {
  assert(forward[index].horizontalInset <= forward[index - 1].horizontalInset);
  assert(forward[index].opacity >= forward[index - 1].opacity);
}
assert.equal(lineGradientPosition(0, 0, 3), -18);
assert.equal(lineGradientPosition(1, 2, 3), 118);
assert(lineGradientPosition(0.5, 0, 3) > lineGradientPosition(0.5, 2, 3));
console.log('PASS: responsive frame expansion, reveal ordering, bounded values, reverse scroll and sequential line gradients.');

// A pointer over the lead textarea must not swallow page scrolling at its edges.
const {JSDOM}=await import('jsdom');
const dom=new JSDOM('<!doctype html><textarea style="overflow-y:auto;overscroll-behavior-y:auto"></textarea>');
globalThis.window=dom.window;globalThis.document=dom.window.document;
const {default:Lenis}=await import('../dist/vendor/lenis.mjs');
function nested(height,top,delta){
 const field=document.createElement('textarea');field.style.overflowY='auto';field.style.overscrollBehaviorY='auto';
 for(const [key,value] of Object.entries({scrollHeight:height,clientHeight:100,scrollWidth:100,clientWidth:100,scrollTop:top}))Object.defineProperty(field,key,{value,configurable:true});
 return Lenis.prototype.hasNestedScroll.call({},field,{deltaX:0,deltaY:delta});
}
assert.equal(nested(100,0,60),false,'An empty textarea lets the page continue scrolling');
assert.equal(nested(300,80,60),true,'An overflowing field scrolls its own contents');
assert.equal(nested(300,200,60),false,'The bottom edge releases downward scroll to the page');
assert.equal(nested(300,0,-60),false,'The top edge releases upward scroll to the page');
dom.window.close();
console.log('PASS: native textarea scroll within content and page handoff at both edges.');

// Scroll animation frames must not alternate geometry reads and transform writes.
const motionDom=new JSDOM('<!doctype html><header class="header"><div class="nav-inner"></div></header><main><section class="expanding-scene"><div class="expanding-frame"><img></div><div class="expanding-scrim"></div><div class="expanding-copy"></div></section><section class="narrative-process"><figure><img></figure></section></main><div class="footer-wordmark">Confort4</div>',{url:'https://example.invalid/'});
globalThis.window=motionDom.window;globalThis.document=motionDom.window.document;globalThis.location=motionDom.window.location;globalThis.sessionStorage=motionDom.window.sessionStorage;

window.matchMedia=()=>({matches:false,addEventListener(){}});
window.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
let nextFrame=null;window.requestAnimationFrame=callback=>{nextFrame=callback;return 1;};window.cancelAnimationFrame=()=>{};
const operations=[];let offscreen=false,frameTop=0;
window.HTMLElement.prototype.getBoundingClientRect=function(){operations.push('read');return {top:offscreen?-4000:frameTop,bottom:offscreen?-2000:frameTop+2000,height:2000,width:800,left:0,right:800};};
await import('../dist/reference-motion.mjs?scroll-regression').then(({initializeReferenceMotion})=>initializeReferenceMotion(document.querySelector('main')));
await Promise.resolve();await Promise.resolve();
for(const element of document.querySelectorAll('*')){
 let value=element.style.transform;Object.defineProperty(element.style,'transform',{configurable:true,get:()=>value,set:newValue=>{operations.push('write');value=newValue;}});
}
frameTop=-100;operations.length=0;window.dispatchEvent(new window.Event('scroll'));nextFrame();
assert(operations.includes('read'));assert(operations.includes('write'));
assert(!operations.slice(operations.indexOf('write')).includes('read'),'All geometry reads precede transform writes');
offscreen=true;operations.length=0;window.dispatchEvent(new window.Event('scroll'));nextFrame();
assert(!operations.includes('write'),'Offscreen scene transforms stay idle');
motionDom.window.close();
console.log('PASS: batched geometry reads before transforms and idle offscreen scenes.');
