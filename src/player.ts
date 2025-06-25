import {
  StateChangedEvent,
  changedVolumeEvent,
  nextSongEvent,
  previousSongEvent,
  changedSongStateEvent,
} from "./Events";

import type StateManager from "./stateManager";

export default class Player {
  private playButton: HTMLButtonElement;
  private pauseButton: HTMLButtonElement;
  private previousButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;
  private volumeRange: HTMLInputElement;
  private _stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.playButton = document.querySelector(".play-button")!;
    this.pauseButton = document.querySelector(".pause-button")!;
    this.previousButton = document.querySelector(".previous-button")!;
    this.nextButton = document.querySelector(".next-button")!;
    this.volumeRange = document.querySelector("#volumen-button")!;
    this._stateManager = stateManager;

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
    this._stateManager.state.volume = parseFloat(value);

    window.dispatchEvent(StateChangedEvent);
    window.dispatchEvent(changedVolumeEvent);
  }
}
