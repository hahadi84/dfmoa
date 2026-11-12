# GA4 setup checklist

## Google tag and web stream

- `NEXT_PUBLIC_GA_TAG_ID` identifies the installed Google tag. Use it for the script and the `config` call.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` identifies the DFMOA web stream. Page views and custom events explicitly route to that destination.

## Events

The site sends these events directly. They appear after GA4 receives and processes them.

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

After a release, open the Korean Estée Lauder 100ml product page in debug mode and click a retailer's official link once. Verify one `outbound_click_store` for that action and inspect `store` and `product_slug`. The automatically collected `click` event is a separate measurement.
