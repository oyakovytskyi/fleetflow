import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PostLocationRequestDto } from '@fleetflow/shared-types';

import { STORAGE_KEYS } from '@/src/constants';

/** Cap so a long offline stretch cannot blow up AsyncStorage. */
export const LOCATION_QUEUE_MAX = 200;

type QueueListener = (items: PostLocationRequestDto[]) => void;

let memory: PostLocationRequestDto[] | null = null;
const listeners = new Set<QueueListener>();

function emit(items: PostLocationRequestDto[]): void {
  for (const listener of listeners) {
    listener(items);
  }
}

export function subscribeLocationQueue(listener: QueueListener): () => void {
  listeners.add(listener);
  if (memory) listener(memory);
  return () => {
    listeners.delete(listener);
  };
}

async function read(): Promise<PostLocationRequestDto[]> {
  if (memory) return memory;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.locationQueue);
    memory = raw ? (JSON.parse(raw) as PostLocationRequestDto[]) : [];
  } catch {
    memory = [];
  }
  return memory;
}

async function write(items: PostLocationRequestDto[]): Promise<void> {
  memory = items;
  emit(items);
  await AsyncStorage.setItem(STORAGE_KEYS.locationQueue, JSON.stringify(items));
}

export async function loadLocationQueue(): Promise<PostLocationRequestDto[]> {
  return read();
}

export async function enqueueLocation(sample: PostLocationRequestDto): Promise<number> {
  const current = await read();
  const next = [...current, sample].slice(-LOCATION_QUEUE_MAX);
  await write(next);
  return next.length;
}

export async function peekLocationQueue(): Promise<PostLocationRequestDto[]> {
  return read();
}

export async function replaceLocationQueue(items: PostLocationRequestDto[]): Promise<void> {
  await write(items);
}

export async function clearLocationQueue(): Promise<void> {
  await write([]);
}
