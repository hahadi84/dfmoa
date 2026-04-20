import { markUnsubscribed } from "./_shared/retention-store";

const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ ok: false, message: "Method not allowed" }, { status: 405 });
  }

  const payload = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const token = typeof payload?.token === "string" ? payload.token.trim() : "";

  if (!token) {
    return Response.json({ ok: false, message: "수신거부 토큰이 없습니다." }, { status: 400 });
  }

  const result = await markUnsubscribed(token);

  if (!result) {
    return Response.json({ ok: false, message: "유효하지 않거나 이미 처리된 수신거부 링크입니다." }, { status: 404 });
  }

  return Response.json(
    {
      ok: true,
      status: "unsubscribed",
      message: "수신거부가 처리되었습니다. 로그인 없이 알림 또는 리포트 수신을 중단했습니다.",
    },
    {
      headers: { "cache-control": "no-store" },
    }
  );
};

export default handler;

export const config = {
  path: "/api/unsubscribe",
};
