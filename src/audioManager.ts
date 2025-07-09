import * as T from "three";
import type { Song } from "./stateManager";
import { songChangedEvent, songEndedEvent, stateChangedName } from "./Events";

export default class AudioManager {
  private listener: T.AudioListener;
  private sound: T.Audio;
  private audioLoader: T.AudioLoader;
  private analyser: T.AudioAnalyser;
  private songList: Song[];
  private _currentTime: number;
  private currentTimeInterval: number;

  constructor(songList: Song[], numberOfFrequencies: number) {
    this.songList = songList;
    this.listener = new T.AudioListener();
    this.sound = new T.Audio(this.listener);
    this.audioLoader = new T.AudioLoader();
    this.analyser = new T.AudioAnalyser(this.sound, numberOfFrequencies);
    this._currentTime = 0;
    this.currentTimeInterval = 0;

    window.addEventListener(stateChangedName, (e: CustomEventInit) => {
      const { volume } = e.detail;
      this.volume = volume;
    });
  }

  async setSong(songIndex: number) {
    this.stop();
    const song = this.songList[songIndex];
    const buffer = await this.audioLoader.loadAsync(song.src!);
    this.sound.setBuffer(buffer);

    window.dispatchEvent(songChangedEvent);

    this.sound.onEnded = () => {
      window.dispatchEvent(songEndedEvent);
    };
  }

  set volume(newVolume: number) {
    this.sound.setVolume(newVolume);
  }

  get duration() {
    return this.sound.buffer?.duration;
  }

  get currentTime() {
    return this._currentTime;
  }

  playFromSecond(second: number) {
    this.handleCurrentTimeInterval(true);
    this.sound.stop(0);
    this.sound.offset = second;
    this._currentTime = second;
    this.sound.play();
    this.handleCurrentTimeInterval(false);
  }

  play() {
    if (this.sound.isPlaying) return;
    this.sound.play();
    this.handleCurrentTimeInterval(false);
  }

  pause() {
    this.sound.pause();
    this.handleCurrentTimeInterval(true);
  }

  stop() {
    this.sound.stop(0);
    this.sound.offset = 0;
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
    return this.analyser.getFrequencyData();
  }
}
