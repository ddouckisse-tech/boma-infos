/**
 * Audience measurement, without a third-party tracker — CDC §4.4, §5.4.
 *
 * Views are counted server-side by `proxy.ts` as the request goes past: no
 * cookie, no identifier, no JavaScript at all. What a server cannot know
 * is how long someone read, and whether they shared — so this emits a
 * single inline script, around six hundred bytes, which sends two numbers
 * and nothing else:
 *
 *  - the seconds the tab stayed visible, once, when it is hidden;
 *  - the channel of a share, when a control carrying `data-partage` is
 *    clicked.
 *
 * No library, no client component, no hydration: the article page's
 * JavaScript budget is unchanged (§5.4). The legacy site loaded
 * MonsterInsights and Google Analytics for a worse answer.
 *
 * `fetch(..., { keepalive: true })` rather than `navigator.sendBeacon`: a
 * beacon carrying `application/json` needs a CORS preflight it cannot
 * perform, so it would fail silently.
 */
export function AudienceBeacon({ slug }: { slug: string }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;

  const script = `(function(){
var u=${JSON.stringify(`${convexUrl}/api/mutation`)},s=${JSON.stringify(slug)},t=Date.now(),d=0;
function p(n,a){try{fetch(u,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({path:n,args:a,format:"json"}),keepalive:true,mode:"cors"})}catch(e){}}
document.addEventListener("visibilitychange",function(){
if(document.visibilityState!=="hidden"||d)return;d=1;
var v=Math.round((Date.now()-t)/1000);if(v>=5)p("stats:recordReading",{slug:s,seconds:v});});
document.addEventListener("click",function(e){
var n=e.target&&e.target.closest?e.target.closest("[data-partage]"):null;
if(n)p("stats:recordShare",{slug:s,channel:n.getAttribute("data-partage")});},true);
})();`;

  return (
    <script
      // Chaîne construite ici, sans aucune entrée du lecteur : le slug vient
      // de la base et passe par JSON.stringify.
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
