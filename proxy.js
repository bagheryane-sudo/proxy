addEventListener("fetch", (event) => {
  event.respondWith(handle(event.request));
});

async function handle(request) {
  try {
    const url = new URL(request.url);
    // remove our worker origin path prefix if any (we assume worker deployed on root)
    // forward everything after "/" to https://api.tgju.org
    const forwardPath = url.pathname + url.search;
    const target = "https://api.tgju.org" + forwardPath;

    const forwarded = await fetch(target, {
      method: request.method,
      headers: {
        // مهم: TGJU به UA/Accept حساس است
        "User-Agent": "Mozilla/5.0 (compatible; ProxyWorker/1.0)",
        "Accept": "application/json",
      },
      // body only for methods that may have one
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body
    });

    // پاس‌ترو کردن هدرها (و اضافه کردن CORS)
    const respHeaders = new Headers(forwarded.headers);
    respHeaders.set("Access-Control-Allow-Origin", "*");
    respHeaders.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    respHeaders.set("Access-Control-Allow-Headers", "Content-Type,Authorization");

    const body = await forwarded.arrayBuffer();
    return new Response(body, {
      status: forwarded.status,
      headers: respHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
