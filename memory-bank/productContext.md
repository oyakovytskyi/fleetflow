# Product Context

## Problem

Dispatchers need to see where couriers are in realtime. Drivers need a simple way to accept deliveries and share location even when the network drops briefly.

## Users

1. **Driver** — logs in, sees assigned deliveries, starts a run, shares GPS, finishes delivery.
2. **Admin / Operator** — sees active drivers on a map, assigns/changes delivery status, reviews history.

## Core UX goals

- Driver flow stays short: login → pick delivery → start → track → finish.
- Location feels continuous on the admin map (smooth marker updates, reconnect UX).
- Offline: coordinates never silently disappear; queue and sync when online.
- Clear connection states: connected / reconnecting / offline / permission denied.

## Primary happy path

```
Login → Dashboard → Available deliveries → Delivery details
  → Start delivery → Location permission → GPS tracking
  → WebSocket → Admin sees movement → Finish delivery
```

## Offline path

```
GPS sample → no network → AsyncStorage queue
  → network restored → flush queue → remove synced items
```
