export default class Player {
  private playButton: HTMLButtonElement;
  private pauseButton: HTMLButtonElement;
  private previousButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;
  private volumeRange: HTMLInputElement;
  private _state;

  constructor() {
    this.playButton = document.querySelector(".play-button")!;
    this.pauseButton = document.querySelector(".pause-button")!;
    this.previousButton = document.querySelector(".previous-button")!;
    this.nextButton = document.querySelector(".next-button")!;
    this.volumeRange = document.querySelector("#volumen-button")!;

    // EVENTS

    this.playButton.addEventListener("click", () => this.handlePlayButton());
    this.pauseButton.addEventListener("click", () => this.handlePauseButton());
    this.nextButton.addEventListener("click", () => this.handleNextButton());
    this.previousButton.addEventListener("click", () =>
      this.handlePreviousButton()
    );
    this.volumeRange.addEventListener("input", () => this.handleVolumeRange());

    // STATE

    this._state = {
      isPlaying: false,
      volume: 0.5,
    };
  }

  get state() {
    return this._state;
  }

  handlePlayButton() {
    const isHidden = this.playButton.classList.contains("hide");
    if (isHidden) {
      this.playButton.classList.remove("hide");
      this._state.isPlaying = false;
    } else {
      this.playButton.classList.add("hide");
      this.handlePauseButton();
      this._state.isPlaying = true;
    }
  }

  handlePauseButton() {
    const isHidden = this.pauseButton.classList.contains("hide");
    if (isHidden) {
      this.pauseButton.classList.remove("hide");
      this._state.isPlaying = true;
    } else {
      this.pauseButton.classList.add("hide");
      this.handlePlayButton();
      this._state.isPlaying = false;
    }
  }

  handleNextButton() {}

  handlePreviousButton() {}

  handleVolumeRange() {
    const { value } = this.volumeRange;
    this._state.volume = parseFloat(value);
  }
}
