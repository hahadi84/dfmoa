"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function UnsubscribeClient() {
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") ?? "";
  const [token, setToken] = useState(initialToken);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function unsubscribe() {
    setMessage(null);
    setError(null);

    if (!token.trim()) {
      setError("수신거부 링크의 토큰을 확인해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await response.json()) as { ok: boolean; message: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "수신거부 처리에 실패했습니다.");
      }

      setMessage(data.message);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "수신거부 처리에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="surface-card unsubscribe-card">
      <span className="eyebrow">Unsubscribe</span>
      <h1 className="page-title">수신거부</h1>
      <p className="page-description">
        가격 알림과 주간 면세 리포트는 로그인 없이 수신거부할 수 있습니다. 이메일의 수신거부 링크를 열면 토큰이
        자동으로 입력됩니다.
      </p>

      <label className="retention-token-field">
        수신거부 토큰
        <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="unsubscribe token" />
      </label>

      {error ? <p className="form-message is-error">{error}</p> : null}
      {message ? <p className="form-message is-success">{message}</p> : null}

      <button type="button" className="button" disabled={isSubmitting} onClick={unsubscribe}>
        {isSubmitting ? "처리 중" : "수신거부 처리"}
      </button>
    </article>
  );
}
