# Mobile app (Expo)

Placeholder layout. Generate the real Expo app here next:

```bash
npx create-expo-app@latest . --template tabs
```

Or create in a temp folder and merge into this tree, preserving `src/`.

## Intended router groups

```
app/
  (auth)/login.tsx
  (auth)/register.tsx
  (tabs)/index.tsx
  (tabs)/deliveries.tsx
  (tabs)/map.tsx
  (tabs)/profile.tsx
  delivery/[id].tsx
```

See `src/` for features, hooks, types, constants, services, store.
