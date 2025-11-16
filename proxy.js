export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);

      // forward everything to TGJU
      const forwardPath = url.pathname + url.search;
      const target = "https://api.tgju.org" + forwardPath;

      const forwarded = await fetch(target, {
        method: request.method,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ProxyWorker/1.0)",
          "Accept": "application/json",
        },
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body
      });

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
      return new Response(
        JSON.stringify({ ok: false, error: String(err) }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
  }
};
