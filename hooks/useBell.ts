"use client";

import { useCallback, useEffect, useRef } from "react";
import { BellPlaybackQueue } from "@/lib/bellPlayback";

const BELL_SOURCE = "/sounds/boxing-bell.mp3";

export function useBell() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<BellPlaybackQueue | null>(null);

  const getPlayer = useCallback(() => {
    if (!playerRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = BELL_SOURCE;
      audioRef.current = audio;
      playerRef.current = new BellPlaybackQueue(audio);
    }
    return playerRef.current;
  }, []);

  const prime = useCallback(() => {
    getPlayer().prime();
  }, [getPlayer]);

  const playBell = useCallback(() => {
    getPlayer().enqueue();
  }, [getPlayer]);

  const stopBell = useCallback(() => {
    playerRef.current?.stop();
  }, []);

  useEffect(() => {
    const player = getPlayer();
    player.preload();

    const retryBlockedPlayback = () => player.retry();
    document.addEventListener("pointerdown", retryBlockedPlayback, true);
    document.addEventListener("keydown", retryBlockedPlayback, true);

    return () => {
      document.removeEventListener("pointerdown", retryBlockedPlayback, true);
      document.removeEventListener("keydown", retryBlockedPlayback, true);
      player.dispose();
      playerRef.current = null;
      if (audioRef.current) {
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
        audioRef.current = null;
      }
    };
  }, [getPlayer]);

  return { playBell, prime, source: BELL_SOURCE, stopBell };
}
