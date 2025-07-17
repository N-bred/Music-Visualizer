export default class CanvasPanel {
  private theaterButton: HTMLButtonElement;
  private fullscreenButton: HTMLButtonElement;
  private canvas: HTMLCanvasElement;
  private mode: "regular" | "fullscreen" | "theater";

  constructor(canvas: HTMLCanvasElement) {
    this.theaterButton = document.querySelector("#canvas-theater-button")!;
    this.fullscreenButton = document.querySelector("#canvas-fullscreen-button")!;
    this.canvas = canvas;
    this.mode = "regular";

    // EVENTS
    this.theaterButton.addEventListener("click", () => this.handleTheaterButton());
    this.fullscreenButton.addEventListener("click", () => this.handleFullscreenButton());
  }

  handleTheaterButton() {
    console.log(this.canvas);
  }

  handleFullscreenButton() {
    if (this.mode === "fullscreen") {
      this.mode = "regular";
      document.exitFullscreen();
    } else {
      this.mode = "fullscreen";
      this.canvas.parentElement!.requestFullscreen();
    }
  }
}
