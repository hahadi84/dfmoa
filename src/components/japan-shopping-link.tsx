'use client';

import Link from '@/components/app-link';
import { trackEvent } from '@/lib/analytics';
import type { ReactNode } from 'react';

export function JapanShoppingLink({ href, kind, product, source, children }: {
  href: string; kind: 'product' | 'compare' | 'official' | 'pickup'; product?: string; source: string; children: ReactNode;
}) {
  const events = { product: 'shopping_product_open', compare: 'shopping_compare_open', official: 'shopping_branch_open', pickup: 'shopping_pickup_open' } as const;
  return <Link href={href} className={kind === 'official' ? undefined : 'ghost-button'}
    {...(kind === 'official' ? { target: '_blank', rel: 'noreferrer' } : {})}
    onClick={() => trackEvent(events[kind], { language: 'ko', source_page: source, product_slug: product, interaction: kind === 'official' ? 'official_product_source' : kind })}>
    {children}
  </Link>;
}
