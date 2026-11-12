import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { getDeployStore, getStore } from "@netlify/blobs";
import { parseAndGenerateServices } from "@typescript-eslint/typescript-estree";

test("the scoped minimatch override preserves project-service allow-list behavior", () => {
  const require = createRequire(import.meta.url);
  const parserRequire = createRequire(require.resolve("@typescript-eslint/typescript-estree"));
  assert.equal(parserRequire("minimatch/package.json").version, "11.0.1");

  const root = mkdtempSync(path.join(tmpdir(), "dfmoa-parser-"));
  try {
    writeFileSync(path.join(root, "tsconfig.json"), JSON.stringify({
      compilerOptions: { allowJs: false }, files: ["included.ts"],
    }));
    writeFileSync(path.join(root, "included.ts"), "export const included = true;\n");
    const code = "export const value = 1;\n";
    const options = {
      tsconfigRootDir: root,
      projectService: {
        allowDefaultProject: ["exact.js", "*.config.js", "*.hidden.js"],
      },
    };

    // These files are outside tsconfig, so the parser must actually call minimatch.
    for (const name of ["exact.js", "build.config.js", ".fixture.hidden.js"]) {
      const filePath = path.join(root, name);
      writeFileSync(filePath, code);
      const result = parseAndGenerateServices(code, { ...options, filePath });
      assert.equal(result.ast.type, "Program");
      assert.ok(result.services.program);
    }
    const filePath = path.join(root, "denied.js");
    writeFileSync(filePath, code);
    assert.throws(() => parseAndGenerateServices(code, { ...options, filePath }), /does not match 'denied\.js'/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

for (const scope of ["site", "deploy"]) {
  test(`Blobs ${scope} client preserves JSON, atomic writes, pagination and deletion`, async () => {
    const calls = [];
    const value = { status: "active", productSlug: "fixture-product" };
    const metadata = { contentType: "application/json", status: "active" };
    const responses = [
      new Response(null, { status: 200, headers: { etag: "fixture-etag" } }),
      new Response(null, { status: 412 }),
      Response.json(value),
      new Response(null, { status: 404 }),
      Response.json({ blobs: [{ key: "events/a.json", etag: "a" }], directories: ["events/day/"], next_cursor: "page2" }),
      Response.json({ blobs: [{ key: "events/b.json", etag: "b" }] }),
      new Response(null, { status: 204 }),
    ];
    const options = {
      name: "dependency-test",
      siteID: "fixture-site",
      token: "not-a-real-token",
      consistency: "strong",
      edgeURL: "https://cached.invalid",
      uncachedEdgeURL: "https://strong.invalid",
      region: "us-east-2",
      // Every SDK request is intercepted. No credentials or requests leave the test.
      fetch: async (input, init) => {
        const request = new Request(input, init);
        assert.equal(new URL(request.url).hostname, "strong.invalid");
        calls.push({ request, body: await request.text() });
        assert.ok(responses.length, "unexpected SDK request");
        return responses.shift();
      },
    };
    const store = scope === "site" ? getStore(options) : getDeployStore({ ...options, deployID: "fixturedeploy" });
    assert.deepEqual(await store.setJSON("events/a.json", value, { metadata, onlyIfNew: true }), {
      modified: true, etag: "fixture-etag",
    });
    assert.deepEqual(await store.setJSON("events/a.json", value, { onlyIfNew: true }), { modified: false });
    assert.deepEqual(await store.get("events/a.json", { type: "json" }), value);
    assert.equal(await store.get("events/missing.json", { type: "json" }), null);
    assert.deepEqual(await store.list({ prefix: "events/", directories: true }), {
      blobs: [{ key: "events/a.json", etag: "a" }, { key: "events/b.json", etag: "b" }],
      directories: ["events/day/"],
    });
    await store.delete("events/a.json");

    assert.equal(calls[0].request.method, "PUT");
    assert.deepEqual(JSON.parse(calls[0].body), value);
    assert.equal(calls[0].request.headers.get("content-type"), "application/json");
    assert.equal(calls[0].request.headers.get("if-none-match"), "*");
    const encodedMetadata = calls[0].request.headers.get("x-amz-meta-user");
    assert.ok(encodedMetadata?.startsWith("b64;"));
    assert.deepEqual(JSON.parse(Buffer.from(encodedMetadata.slice(4), "base64").toString()), metadata);
    assert.equal(new URL(calls[4].request.url).searchParams.get("prefix"), "events/");
    assert.equal(new URL(calls[4].request.url).searchParams.get("directories"), "true");
    assert.equal(new URL(calls[5].request.url).searchParams.get("cursor"), "page2");
    assert.equal(calls[6].request.method, "DELETE");
    assert.equal(responses.length, 0);
  });
}
