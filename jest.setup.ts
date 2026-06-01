// Polyfill Web API untuk jsdom environment
if (typeof Request === 'undefined') {
  (global as any).Request = class Request {
    url: string; method: string; body: any;
    constructor(url: string, opts: any = {}) { this.url = url; this.method = opts.method || 'GET'; this.body = opts.body; }
  };
}
if (typeof Response === 'undefined') {
  (global as any).Response = class Response {
    status: number; body: any;
    constructor(body?: any, opts: any = {}) { this.body = body; this.status = opts.status || 200; }
    json() { return Promise.resolve(JSON.parse(this.body)); }
  };
}
if (typeof Headers === 'undefined') {
  (global as any).Headers = class Headers extends Map {};
}
