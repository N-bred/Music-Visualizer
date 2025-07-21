export default class CanvasPanel {
  private theaterButton: HTMLButtonElement;
  private fullscreenButton: HTMLButtonElement;
  private canvas: HTMLCanvasElement;
  private mode: "regular" | "fullscreen" | "theater";
  private app: HTMLDivElement;

  constructor(canvas: HTMLCanvasElement) {
    this.theaterButton = document.querySelector("#canvas-theater-button")!;
    this.fullscreenButton = document.querySelector("#canvas-fullscreen-button")!;
    this.canvas = canvas;
    this.mode = "regular";
    this.app = document.querySelector(".app")!;

    // EVENTS
    this.theaterButton.addEventListener("click", () => this.handleTheaterButton());
    this.fullscreenButton.addEventListener("click", () => this.handleFullscreenButton());
  }

  handleAddTheaterMode() {
    this.theaterButton.classList.add("active");
    this.app.classList.add("theater");
  }

  handleRemoveTheaterMode() {
    this.theaterButton.classList.remove("active");
    this.app.classList.remove("theater");
  }

  handleAddFullscreen() {
    this.fullscreenButton.classList.add("active");
    this.canvas.parentElement!.requestFullscreen();
  }

  handleRemoveFullscreen() {
    this.fullscreenButton.classList.remove("active");
    document.exitFullscreen();
  }

  handleTheaterButton() {
    if (this.mode === "theater") {
      this.handleRemoveTheaterMode();
      this.mode = "regular";
    } else if (this.mode === "fullscreen") {
      this.handleRemoveFullscreen();
      this.handleAddTheaterMode();
      this.mode = "theater";
    } else if (this.mode === "regular") {
      this.handleAddTheaterMode();
      this.mode = "theater";
    }
    window.dispatchEvent(new Event("resize"));
  }

  handleFullscreenButton() {
    this.handleRemoveTheaterMode();
    if (this.mode === "fullscreen") {
      this.handleRemoveFullscreen();
      this.mode = "regular";
    } else if (this.mode === "theater") {
      this.handleRemoveTheaterMode();
      this.handleAddFullscreen();
      this.mode = "fullscreen";
    } else {
      this.handleAddFullscreen();
      this.mode = "fullscreen";
    }
  }
}
