/* PlayVerse — ملف تعطيل. لا يخزّن شيئاً، ويمسح أي ذاكرة قديمة. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil((async function(){
    try{
      var ks = await caches.keys();
      await Promise.all(ks.map(function(k){ return caches.delete(k); }));
    }catch(err){}
    try{ await self.registration.unregister(); }catch(err){}
  })());
});
