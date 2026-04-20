import {
  readExternalStoreSnapshot,
  saveExternalStoreSnapshot,
  type ExternalStoreSnapshotInput,
} from "../../src/lib/external-store-snapshots";
import { getNetlifyDeployContext, getNetlifyEnv } from "../../src/lib/netlify-runtime";
import type { StoreId } from "../../src/lib/site-data";

function getSyncToken() {
  return getNetlifyEnv("EXTERNAL_STORE_SYNC_TOKEN")?.trim() ?? "";
}

function isProductionDeploy() {
  return getNetlifyDeployContext() === "production";
}

function isAuthorized(req: Request) {
  const token = getSyncToken();

  if (!token) {
    return !isProductionDeploy();
  }

  return req.headers.get("x-dfmoa-external-token")?.trim() === token;
}

function cleanText(value: string | undefined | null) {
  return (value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function getStoreId(url: URL) {
  const storeId = cleanText(url.searchParams.get("storeId"));
  return storeId as StoreId;
}

const handler = async (req: Request) => {
  if (!isAuthorized(req)) {
    return Response.json(
      {
        ok: false,
        message: "Unauthorized",
      },
      {
        status: 401,
        headers: { "cache-control": "no-store" },
      }
    );
  }

  if (req.method === "GET") {
    const url = new URL(req.url);
    const storeId = getStoreId(url);
    const query = cleanText(url.searchParams.get("query"));

    if (!storeId || !query) {
      return Response.json(
        {
          ok: false,
          message: "storeId and query are required",
        },
        {
          status: 400,
          headers: { "cache-control": "no-store" },
        }
      );
    }

    const snapshot = await readExternalStoreSnapshot(query, storeId);

    return Response.json(
      {
        ok: Boolean(snapshot),
        snapshot,
      },
      {
        status: snapshot ? 200 : 404,
        headers: { "cache-control": "no-store" },
      }
    );
  }

  if (req.method === "POST") {
    const payload = (await req.json()) as ExternalStoreSnapshotInput;

    try {
      const saved = await saveExternalStoreSnapshot(payload);

      return Response.json(
        {
          ok: true,
          snapshot: saved,
        },
        {
          headers: { "cache-control": "no-store" },
        }
      );
    } catch (error) {
      return Response.json(
        {
          ok: false,
          message: error instanceof Error ? error.message : "Invalid payload",
        },
        {
          status: 400,
          headers: { "cache-control": "no-store" },
        }
      );
    }
  }

  return new Response("Method not allowed", { status: 405 });
};

export default handler;

export const config = {
  path: "/api/external-store-snapshot",
};
