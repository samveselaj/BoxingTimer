import assert from "node:assert/strict";
import test from "node:test";
import { BellPlaybackQueue, type BellAudioElement } from "../lib/bellPlayback.js";

class FakeAudio implements BellAudioElement {
  currentTime = 0;
  muted = false;
  preload = "none";
  loadCalls = 0;
  pauseCalls = 0;
  playCalls = 0;
  rejectNextPlay = false;
  private listeners = new Map<string, Set<() => void>>();

  load() {
    this.loadCalls += 1;
  }

  pause() {
    this.pauseCalls += 1;
  }

  play() {
    this.playCalls += 1;
    if (this.rejectNextPlay) {
      this.rejectNextPlay = false;
      return Promise.reject(new Error("autoplay blocked"));
    }
    return Promise.resolve();
  }

  addEventListener(type: "ended" | "error", listener: () => void) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: "ended" | "error", listener: () => void) {
    this.listeners.get(type)?.delete(listener);
  }

  emit(type: "ended" | "error") {
    for (const listener of this.listeners.get(type) ?? []) listener();
  }
}

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

test("preload requests the bell asset eagerly", () => {
  const audio = new FakeAudio();
  const player = new BellPlaybackQueue(audio);

  player.preload();

  assert.equal(audio.preload, "auto");
  assert.equal(audio.loadCalls, 1);
});

test("one bell event starts one playback", () => {
  const audio = new FakeAudio();
  const player = new BellPlaybackQueue(audio);

  player.enqueue();
  assert.equal(audio.playCalls, 1);

  audio.emit("ended");
  assert.equal(audio.playCalls, 1);
});

test("rapid boundary events are queued without duplicates or overwritten bells", () => {
  const audio = new FakeAudio();
  const player = new BellPlaybackQueue(audio);

  player.enqueue();
  player.enqueue();
  player.enqueue();
  assert.equal(audio.playCalls, 1);

  audio.emit("ended");
  assert.equal(audio.playCalls, 2);
  audio.emit("ended");
  assert.equal(audio.playCalls, 3);
  audio.emit("ended");
  assert.equal(audio.playCalls, 3);
});

test("an autoplay rejection retains exactly one event for a gesture retry", async () => {
  const audio = new FakeAudio();
  const player = new BellPlaybackQueue(audio);
  audio.rejectNextPlay = true;

  player.enqueue();
  await flushPromises();
  assert.equal(audio.playCalls, 1);

  player.retry();
  assert.equal(audio.playCalls, 2);
  audio.emit("ended");

  player.retry();
  assert.equal(audio.playCalls, 2);
});

test("silent priming never consumes or duplicates a bell event", async () => {
  const audio = new FakeAudio();
  const player = new BellPlaybackQueue(audio);

  player.prime();
  assert.equal(audio.playCalls, 1);
  assert.equal(audio.muted, true);
  await flushPromises();
  assert.equal(audio.muted, false);

  player.enqueue();
  assert.equal(audio.playCalls, 2);
  audio.emit("ended");
  assert.equal(audio.playCalls, 2);
});

test("a real bell event safely supersedes in-flight priming", async () => {
  const audio = new FakeAudio();
  const player = new BellPlaybackQueue(audio);

  player.prime();
  player.enqueue();
  assert.equal(audio.playCalls, 2);
  assert.equal(audio.muted, false);

  await flushPromises();
  audio.emit("ended");
  assert.equal(audio.playCalls, 2);
});

test("stop clears the active bell and all queued boundary events", () => {
  const audio = new FakeAudio();
  const player = new BellPlaybackQueue(audio);

  player.enqueue();
  player.enqueue();
  player.stop();
  audio.emit("ended");

  assert.equal(audio.playCalls, 1);
  assert.equal(audio.currentTime, 0);
  assert.equal(audio.muted, false);
});
