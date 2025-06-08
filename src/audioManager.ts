import * as T from "three";

export default class AudioManager {
  private listener: T.AudioListener;
  private sound: T.Audio;
  private audioLoader: T.AudioLoader;
  private songList: string[];

  constructor(songList: string[]) {
    this.songList = songList;
    this.listener = new T.AudioListener();
    this.sound = new T.Audio(this.listener);
    this.audioLoader = new T.AudioLoader();
  }

  async setSong(songIndex: number) {
    const buffer = await this.audioLoader.loadAsync(this.songList[songIndex]);
    this.sound.setBuffer(buffer);
  }

  set volume(newVolume: number) {
    this.sound.setVolume(newVolume);
  }

  get isPlaying() {
    return this.sound.isPlaying;
  }

  play() {
    this.sound.play();
  }

  pause() {
    this.sound.pause();
  }
}
