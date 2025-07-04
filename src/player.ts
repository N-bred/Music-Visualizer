import {
  StateChangedEvent,
  changedVolumeEvent,
  nextSongEvent,
  previousSongEvent,
  changedSongStateEvent,
  progressBarClickedEvent,
} from "./Events";

import type StateManager from "./stateManager";

export default class Player {
  private playButton: HTMLButtonElement;
  private pauseButton: HTMLButtonElement;
  private previousButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;
  private volumeRange: HTMLInputElement;
  private initialTimeSpan: HTMLSpanElement;
  private totalTimeSpan: HTMLSpanElement;
  private progressBar: HTMLProgressElement;
  private _state;
  private _stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.playButton = document.querySelector(".play-button")!;
    this.pauseButton = document.querySelector(".pause-button")!;
    this.previousButton = document.querySelector(".previous-button")!;
    this.nextButton = document.querySelector(".next-button")!;
    this.volumeRange = document.querySelector("#volumen-button")!;
    this.initialTimeSpan = document.querySelector(
      "#progress-bar-current-time"
    )!;
    this.progressBar = document.querySelector("#progress-bar")!;
    this.totalTimeSpan = document.querySelector(
      "#progress-bar-total-duration"
    )!;

    this._stateManager = stateManager;

    this._state = {
      volume: this._stateManager.state.volume,
      progressBarClickPosition: 0,
    };

    // EVENTS

    this.playButton.addEventListener("click", () =>
      this.handlePlayPauseButton()
    );
    this.pauseButton.addEventListener("click", () =>
      this.handlePlayPauseButton()
    );
    this.nextButton.addEventListener("click", () => this.handleNextButton());
    this.previousButton.addEventListener("click", () =>
      this.handlePreviousButton()
    );
    this.volumeRange.addEventListener("input", () => this.handleVolumeRange());

    this.progressBar.addEventListener("click", (e) => {
      this.handleProgressBarClick(e);
    });
  }

  get state() {
    return this._state;
  }

  handleProgressBarClick(e: MouseEvent) {
    const { width, left } = this.progressBar.getBoundingClientRect();
    const mouseX = e.clientX;
    this._state.progressBarClickPosition = (mouseX - left) / width;

    window.dispatchEvent(StateChangedEvent);
    window.dispatchEvent(progressBarClickedEvent);
  }

  handleUpdateProgressBarUI(second: number, percentage: number) {
    const min = Math.floor(second / 60)
      .toString()
      .padStart(2, "0");
    const sec = Math.floor(second % 60)
      .toString()
      .padStart(2, "0");
    this.initialTimeSpan.textContent = `${min}:${sec}`;
    this.progressBar.value = percentage * 100;
  }

  handleTotalDurationSpan(duration: number) {
    const min = Math.floor(duration / 60)
      .toString()
      .padStart(2, "0");
    const sec = Math.floor(duration % 60)
      .toString()
      .padStart(2, "0");
    this.totalTimeSpan.textContent = `${min}:${sec}`;
  }

  handlePlayPauseButtonUI(showPlayButton: boolean) {
    if (!showPlayButton) {
      this.playButton.classList.remove("hide");
      this.pauseButton.classList.add("hide");
    } else {
      this.playButton.classList.add("hide");
      this.pauseButton.classList.remove("hide");
    }
  }

  handlePlayPauseButton() {
    if (this._stateManager.state.isPlaying) {
      this._stateManager.state.isPlaying = false;
      this.handlePlayPauseButtonUI(false);
    } else {
      this._stateManager.state.isPlaying = true;
      this.handlePlayPauseButtonUI(true);
    }

    window.dispatchEvent(StateChangedEvent);
    window.dispatchEvent(changedSongStateEvent);
  }

  handleNextButton() {
    if (
      this._stateManager.state.currentSong + 1 >
      this._stateManager.state.songList.length - 1
    )
      return;
    if (
      this._stateManager.state.currentSong + 1 <=
      this._stateManager.state.songList.length - 1
    ) {
      this._stateManager.currentSong = this._stateManager.state.currentSong + 1;
      this._stateManager.state.isPlaying = true;
    }

    window.dispatchEvent(StateChangedEvent);
    window.dispatchEvent(nextSongEvent);
  }

  handlePreviousButton() {
    if (this._stateManager.state.currentSong - 1 < 0) return;
    if (this._stateManager.state.currentSong - 1 >= 0) {
      this._stateManager.currentSong = this._stateManager.state.currentSong - 1;
      this._stateManager.state.isPlaying = true;
    }

    window.dispatchEvent(StateChangedEvent);
    window.dispatchEvent(previousSongEvent);
  }

  handleVolumeRange() {
    const { value } = this.volumeRange;
    this._state.volume = parseFloat(value);

    // Change 1

    window.dispatchEvent(StateChangedEvent);
    window.dispatchEvent(changedVolumeEvent);
  }
}
