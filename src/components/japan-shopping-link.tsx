'use client';

import Link from '@/components/app-link';
import { trackEvent } from '@/lib/analytics';
import type { ReactNode } from 'react';

export function JapanShoppingLink({ href, kind, product, source, store, airport, terminal, children }: {
  href: string; kind: 'product' | 'compare' | 'official' | 'official_branch' | 'pickup' | 'map'; product?: string; source: string; store?: string; airport?: string; terminal?: string; children: ReactNode;
}) {
  const events = { product: 'shopping_product_open', compare: 'shopping_compare_open', official: 'shopping_branch_open', official_branch: 'shopping_branch_open', pickup: 'shopping_pickup_open', map: 'shopping_map_open' } as const;
  const external = kind === 'official' || kind === 'official_branch' || kind === 'map';
  return <Link href={href} className={external ? undefined : 'ghost-button'}
    {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    onClick={() => trackEvent(events[kind], {
      language: 'ko', source_page: source,
      ...(store && { store }), ...(product && { product_slug: product }),
      ...(kind === 'map' ? { interaction: 'external_map', airport, terminal }
        : { interaction: kind === 'official' ? 'official_product_source' : kind }),
    })}>
    {children}
  </Link>;
}
