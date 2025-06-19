import {
  StateChangedEvent,
  changedVolumeEvent,
  nextSongEvent,
  previousSongEvent,
  changedSongStateEvent,
} from "./Events";

export default class Player {
  private playButton: HTMLButtonElement;
  private pauseButton: HTMLButtonElement;
  private previousButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;
  private volumeRange: HTMLInputElement;
  private songNames: string[] = [];
  private _state;

  constructor(songNames: string[]) {
    this.playButton = document.querySelector(".play-button")!;
    this.pauseButton = document.querySelector(".pause-button")!;
    this.previousButton = document.querySelector(".previous-button")!;
    this.nextButton = document.querySelector(".next-button")!;
    this.volumeRange = document.querySelector("#volumen-button")!;
    this.songNames = songNames;

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

    // STATE

    this._state = {
      isPlaying: false,
      volume: 0.5,
      currentSong: 0,
    };
  }

  get state() {
    return this._state;
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
    if (this._state.isPlaying) {
      this._state.isPlaying = false;
      this.handlePlayPauseButtonUI(false);
    } else {
      this._state.isPlaying = true;
      this.handlePlayPauseButtonUI(true);
    }

    window.dispatchEvent(StateChangedEvent);
    window.dispatchEvent(changedSongStateEvent);
  }

  handleNextButton() {
    if (this._state.currentSong + 1 > this.songNames.length - 1) return;
    if (this._state.currentSong + 1 <= this.songNames.length - 1) {
      this._state.currentSong += 1;
      this._state.isPlaying = true;
    }

    window.dispatchEvent(StateChangedEvent);
    window.dispatchEvent(nextSongEvent);
  }

  handlePreviousButton() {
    if (this._state.currentSong - 1 < 0) return;
    if (this._state.currentSong - 1 >= 0) {
      this._state.currentSong -= 1;
      this._state.isPlaying = true;
    }

    window.dispatchEvent(StateChangedEvent);
    window.dispatchEvent(previousSongEvent);
  }

  handleVolumeRange() {
    const { value } = this.volumeRange;
    this._state.volume = parseFloat(value);

    window.dispatchEvent(StateChangedEvent);
    window.dispatchEvent(changedVolumeEvent);
  }
}
