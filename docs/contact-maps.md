# Contact map placements

The original illustrated corridor card, including its heading, coordinates, legend, selectable hubs and descriptions, appears inside Write to us directly below the short-enquiry link. Its source is `CorridorMapCard` in `components/pages/contact.tsx`; the illustration remains `features/contact/RegionMap.tsx`.

The earlier map position in Operational topography now contains `features/contact/GeographicMap.tsx`. It uses Leaflet 1.9.4 with OpenStreetMap raster tiles. The desktop card keeps the previous width and approximately the same height (564 × 487px measured at a 1440px viewport, compared with 564 × 483px before). The map viewport retains the illustration’s 520:266 aspect ratio, with a mobile minimum height.

The frame has an explicit 100% width: without it, the aspect ratio and minimum height could force a 454px map inside a 266px mobile content area, with the outer card hiding the overflow. On phones, the view toggle sits above the map, location buttons use a two-column grid with a full-width final choice, and attribution/zoom controls remain inside the frame. Resizing refits the current overview bounds while preserving a deliberately selected local view. Returning from Delhi to the Kashmir overview selects Srinagar so its details match the visible region. Chromium and WebKit checks cover 320–1440px, controls/attribution containment, location selection and resizing; the scoped mobile accessibility scan reports no violations.

All five hubs have numbered markers and named selection buttons. The initial view fits the four Kashmir hubs so their markers are distinguishable; All 5 hubs includes Delhi in the corridor overview. Choosing a hub centers it at a local zoom level and updates its description and external map link. Kashmir restores the regional view. The original illustrated map below the form link still provides its former schematic view of all five hubs.

## Geographic precision

`hubCoordinates` in `features/contact/map-content.ts` stores **approximate regional reference points**, not verified building entrances. The interface states this. Existing office names, descriptions and institutional claims are preserved. Replace the reference points with surveyed office/site coordinates if exact directions are required.

| Hub                     | Latitude | Longitude | Reference                                                                                                                      |
| ----------------------- | -------: | --------: | ------------------------------------------------------------------------------------------------------------------------------ |
| Baramulla               |  34.2087 |   74.3435 | [OpenStreetMap-derived city reference](https://mapcarta.com/Baramulla)                                                         |
| Srinagar HQ region      |  34.0837 |   74.7973 | Existing website’s displayed Srinagar reference                                                                                |
| Lassipora Hub region    | 33.80402 |  74.92911 | [Lassipora Industrial Area reference](https://india.worldplaces.me/view-place/84881395-lassipora-industrial-area-pulwama.html) |
| Achabal                 |  33.6839 |   75.2195 | [Achabal regional reference](https://kashmirtravelguide.co.in/places/achabal)                                                  |
| New Delhi / Vasant Kunj | 28.52925 |  77.15413 | [OpenStreetMap-derived locality reference](https://mapcarta.com/27683658)                                                      |

## Loading and operation

Leaflet is dynamically imported when the map approaches the viewport. Tiles load directly from the provider; there is no map API key, geolocation request, Firestore map read or backend tile proxy. Scroll-wheel zoom is disabled to preserve normal page scrolling, while buttons, keyboard controls, dragging and touch gestures remain available. ResizeObserver updates the viewport; unmount removes the map, listeners and observer. Map view changes do not animate; reduced-motion preferences also disable tile/marker animations.

Attribution remains visible and linked. Requests use the browser’s normal Referer and HTTP cache behavior, the canonical HTTPS tile endpoint, and no offline download or tile-prefetch feature. The CSP permits only `https://tile.openstreetmap.org` for the new tile images. OpenStreetMap’s standard tiles are a best-effort shared service, without an SLA. If availability or traffic needs change, replace the provider URL and attribution in GeographicMap and update the CSP. See the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/).

If the tile service fails, the page retains named hub controls, descriptions and an external OpenStreetMap link. The no-JavaScript rendering also retains those names and the initial external map link. No existing contact submission behavior is changed.
