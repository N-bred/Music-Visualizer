import { songChangedEvent, songEndedEvent, stateChangedEvent } from "./Events";
import type { ConstructedFFT, Song } from "./types";
import { constructFFT } from "./utils/utils";

export default class AudioManager {
  private songList: Song[];
  private _currentTime: number;
  private currentTimeInterval: number;
  private audioElement: HTMLAudioElement;
  private constructedFFT: ConstructedFFT;
  private _duration: number;

  constructor(songList: Song[], numberOfFrequencies: number) {
    this.songList = songList;
    this._currentTime = 0;
    this.currentTimeInterval = 0;
    this.audioElement = document.querySelector("#main-audio")!;
    this.constructedFFT = constructFFT(this.audioElement, numberOfFrequencies);
    this._duration = 0;

    window.addEventListener(stateChangedEvent, (e: CustomEventInit) => {
      this.volume = e.detail.volume;
      this.songList = e.detail.songList;
    });
  }

  setSong(songIndex: number) {
    const song = this.songList[songIndex];
    this.stop();
    this.audioElement.src = song.src!;
    this.audioElement.load();

    this.audioElement.onloadeddata = () => {
      this._duration = this.audioElement.duration;
      window.dispatchEvent(new CustomEvent(songChangedEvent));
    };

    this.audioElement.onended = () => {
      window.dispatchEvent(new CustomEvent(songEndedEvent));
    };
  }

  set volume(newVolume: number) {
    this.audioElement.volume = newVolume;
  }

  get duration() {
    return this._duration;
  }

  get currentTime() {
    return this._currentTime;
  }

  playFromSecond(second: number) {
    this.handleCurrentTimeInterval(true);
    this.audioElement.pause();
    this.audioElement.currentTime = second;
    this.audioElement.play();
    this._currentTime = second;
    this.handleCurrentTimeInterval(false);
  }

  play() {
    if (!this.audioElement.paused) return;
    this.audioElement.play();
    this.handleCurrentTimeInterval(false);
  }

  pause() {
    this.audioElement.pause();
    this.handleCurrentTimeInterval(true);
  }

  stop() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this._currentTime = 0;
    this.handleCurrentTimeInterval(true);
  }

  handleCurrentTimeInterval(removeInterval: boolean) {
    if (removeInterval) {
      clearInterval(this.currentTimeInterval);
    } else {
      this.currentTimeInterval = setInterval(() => {
        this._currentTime += 1;
      }, 1000);
    }
  }

  get fft() {
    this.constructedFFT.reloadFFT();
    return this.constructedFFT.fft;
  }
}
