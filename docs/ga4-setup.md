# GA4 setup checklist

## Measurement ID

- Netlify environment variable: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Current production value: `G-SRSWS2FHS2`

## Events

Register these events in Google Analytics Admin after deployment:

- `outbound_click_store`
- `favorite_add`
- `favorite_remove`
- `price_alert_submit`
- `weekly_report_subscribe`
- `search_submit`

## Custom dimensions and metrics

Add event-scoped custom dimensions:

- `store`
- `product_slug`
- `source_status`
- `source_page`
- `trigger_mode`

Add event-scoped custom metrics:

- `price_krw`
- `threshold_krw`
- `results_count`

## Conversions

Mark these events as conversions:

- `outbound_click_store`
- `price_alert_submit`
- `weekly_report_subscribe`

## DebugView

Open the site with `?debug_mode=1`, then trigger:

1. Search form submit.
2. Favorite add and remove.
3. Product original source click.
4. Price alert submit.
5. Weekly report subscribe.

Confirm every event appears in DebugView with no email, phone, token, URL, or user ID values.
