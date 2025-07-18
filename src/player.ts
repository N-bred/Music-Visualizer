import { calculateMinutesAndSeconds } from "./utils/utils";
import { changedVolumeEvent, newSongSelectedEvent, changedSongStateEvent, progressBarClickedEvent, stateChangedEvent } from "./Events";
import { switchClasses } from "./utils/commonUIBehaviors";
import type { Song } from "./types";

export default class Player {
  private playButton: HTMLButtonElement;
  private pauseButton: HTMLButtonElement;
  private previousButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;
  private volumeRange: HTMLInputElement;
  private initialTimeSpan: HTMLSpanElement;
  private totalTimeSpan: HTMLSpanElement;
  private progressBar: HTMLProgressElement;
  private isPlaying: boolean;
  private currentSong: number;
  private songList: Song[];

  constructor({ currentSong, songList }: { currentSong: number; songList: Song[] }) {
    this.playButton = document.querySelector(".play-button")!;
    this.pauseButton = document.querySelector(".pause-button")!;
    this.previousButton = document.querySelector(".previous-button")!;
    this.nextButton = document.querySelector(".next-button")!;
    this.volumeRange = document.querySelector("#volumen-button")!;
    this.initialTimeSpan = document.querySelector("#progress-bar-current-time")!;
    this.progressBar = document.querySelector("#progress-bar")!;
    this.totalTimeSpan = document.querySelector("#progress-bar-total-duration")!;
    this.isPlaying = false;
    this.currentSong = currentSong;
    this.songList = songList;

    // EVENTS
    this.playButton.addEventListener("click", () => this.handlePlayPauseButton());
    this.pauseButton.addEventListener("click", () => this.handlePlayPauseButton());
    this.nextButton.addEventListener("click", () => this.handleNextButton());
    this.previousButton.addEventListener("click", () => this.handlePreviousButton());
    this.volumeRange.addEventListener("input", () => this.handleVolumeRange());
    this.progressBar.addEventListener("click", (e) => this.handleProgressBarClick(e));

    window.addEventListener(stateChangedEvent, (e: CustomEventInit) => {
      this.isPlaying = e.detail.isPlaying;
      this.currentSong = e.detail.currentSong;
      this.songList = e.detail.songList;
    });
  }

  handleProgressBarClick(e: MouseEvent) {
    const { width, left } = this.progressBar.getBoundingClientRect();
    const mouseX = e.clientX;

    window.dispatchEvent(
      new CustomEvent(progressBarClickedEvent, {
        detail: {
          progressBarClickPosition: (mouseX - left) / width,
          isPlaying: true,
        },
      })
    );
  }

  handleUpdateProgressBarUI(second: number, percentage: number) {
    const { min, sec } = calculateMinutesAndSeconds(second);
    this.initialTimeSpan.textContent = `${min}:${sec}`;
    this.progressBar.value = percentage * 100;
  }

  handleTotalDurationSpan(duration: number) {
    const { min, sec } = calculateMinutesAndSeconds(duration);
    this.totalTimeSpan.textContent = `${min}:${sec}`;
  }

  handlePlayPauseButtonUI(showPlayButton: boolean) {
    switchClasses(!showPlayButton, this.playButton, this.pauseButton);
  }

  handleVolumeUI(volume: number) {
    this.volumeRange.value = volume.toString();
  }

  handlePlayPauseButton(forceAction?: boolean) {
    const isPlaying = forceAction ?? !this.isPlaying;
    this.handlePlayPauseButtonUI(isPlaying);

    window.dispatchEvent(
      new CustomEvent(changedSongStateEvent, {
        detail: {
          isPlaying,
        },
      })
    );
  }

  handleNextButton() {
    if (this.currentSong + 1 > this.songList.length - 1) return;
    if (this.currentSong + 1 <= this.songList.length - 1) {
      window.dispatchEvent(
        new CustomEvent(newSongSelectedEvent, {
          detail: {
            currentSong: this.currentSong + 1,
            isPlaying: true,
          },
        })
      );
    }
  }

  handlePreviousButton() {
    if (this.currentSong - 1 < 0) return;
    if (this.currentSong - 1 >= 0) {
      window.dispatchEvent(
        new CustomEvent(newSongSelectedEvent, {
          detail: {
            currentSong: this.currentSong - 1,
            isPlaying: true,
          },
        })
      );
    }
  }

  handleVolumeRange() {
    const { value } = this.volumeRange;

    window.dispatchEvent(
      new CustomEvent(changedVolumeEvent, {
        detail: {
          volume: parseFloat(value),
        },
      })
    );
  }
}
