import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "@/components/app-link";
import { UnsubscribeClient } from "@/components/unsubscribe-client";

export const metadata: Metadata = {
  title: "수신거부",
  description: "DFMOA 가격 알림과 주간 면세 리포트 수신거부 페이지입니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnsubscribePage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>수신거부</span>
        </div>
        <Suspense fallback={null}>
          <UnsubscribeClient />
        </Suspense>
      </div>
    </section>
  );
}
