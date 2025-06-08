import * as T from "three";

export default class AudioManager {
  private listener: T.AudioListener;
  private sound: T.Audio;
  private audioLoader: T.AudioLoader;
  private analyser: T.AudioAnalyser;
  private songList: string[];

  constructor(songList: string[], numberOfFrequencies: number) {
    this.songList = songList;
    this.listener = new T.AudioListener();
    this.sound = new T.Audio(this.listener);
    this.audioLoader = new T.AudioLoader();
    this.analyser = new T.AudioAnalyser(this.sound, numberOfFrequencies);
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

  get fft() {
    return this.analyser.getFrequencyData();
  }
}
