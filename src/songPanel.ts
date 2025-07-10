import { newSongSelectedName, songUploadedName } from "./Events";
import type { Song } from "./stateManager";
import type StateManager from "./stateManager";
import { randomID } from "./utils";

export default class SongPanel {
  private artistInput: HTMLInputElement;
  private songNameInput: HTMLInputElement;
  private songFileInput: HTMLInputElement;
  private songUploadForm: HTMLFormElement;
  private panelSwapButton: HTMLInputElement;
  private songListElement: HTMLUListElement;
  private _stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.artistInput = document.querySelector("#artist-input")!;
    this.songNameInput = document.querySelector("#song-name-input")!;
    this.songFileInput = document.querySelector("#song-file-input")!;
    this.songUploadForm = document.querySelector("#uploadSongForm")!;
    this.panelSwapButton = document.querySelector("#panel-song-swap-button")!;
    this.songListElement = document.querySelector("#song-list")!;
    this._stateManager = stateManager;

    // EVENTS

    this.songUploadForm.addEventListener("submit", (e) => this.handleFormSubmission(e));
    this.panelSwapButton.addEventListener("click", () => this.handlePanelSwapButton());
    this.handleSongListStyles(this._stateManager.state.currentSong);
  }

  handlePanelSwapButton() {
    const isShowingSongs = this.panelSwapButton.dataset.showingSongs;

    if (isShowingSongs === "true") {
      this.songListElement.parentElement?.classList.add("hide");
      this.songUploadForm.parentElement?.classList.remove("hide");
      this.panelSwapButton.textContent = this.panelSwapButton.dataset.songsText!;
      this.panelSwapButton.dataset.showingSongs = "false";
    } else {
      this.songListElement.parentElement?.classList.remove("hide");
      this.songUploadForm.parentElement?.classList.add("hide");
      this.panelSwapButton.textContent = this.panelSwapButton.dataset.formText!;
      this.panelSwapButton.dataset.showingSongs = "true";
    }
  }

  handleFormSubmission(e: Event) {
    e.preventDefault();
    const { files } = this.songFileInput;

    window.dispatchEvent(
      new CustomEvent(songUploadedName, {
        detail: {
          id: randomID(this.artistInput.value, this.songNameInput.value),
          artistName: this.artistInput.value,
          songName: this.songNameInput.value,
          src: URL.createObjectURL(files![0]),
        },
      })
    );
  }

  handlePostFormSubmission(succesful: boolean) {
    if (!succesful) return alert("Song already in list");

    this.handleCleanUIState();
    this.handleRefreshUIState(true);
    this.panelSwapButton.click();
  }

  handleCleanUIState() {
    this.songUploadForm.reset();
  }

  handleRefreshUIState(autoplay: boolean) {
    this.songListElement.innerHTML = "";

    this._stateManager.state.songList.forEach((song) => {
      const li = this.handleCreateNewListElement(song);
      this.songListElement.appendChild(li);
    });

    window.dispatchEvent(
      new CustomEvent(newSongSelectedName, {
        detail: {
          currentSong: this._stateManager.state.currentSong,
          isPlaying: autoplay,
        },
      })
    );
  }

  handleCreateNewListElement(newSong: Song) {
    const li = document.createElement("li");
    const anchorHTML = `<a id="${newSong.id}" href="${newSong.src}" data-url="${newSong.src}">${newSong.artistName} - ${newSong.songName}</a>`;
    li.innerHTML += anchorHTML;
    li.querySelector("a")!.addEventListener("click", (e) => this.handleSongItemSetEvent(e));
    return li;
  }

  handleSongItemSetEvent(e: Event) {
    e.preventDefault();
    const anchor = e.target as HTMLAnchorElement;
    const src = anchor.dataset?.url;
    const songIndex = this._stateManager.state.songList.findIndex((song) => song.src === src);
    this.handleSongListStyles(songIndex);

    window.dispatchEvent(
      new CustomEvent(newSongSelectedName, {
        detail: {
          currentSong: songIndex,
          isPlaying: true,
        },
      })
    );
  }

  handleSongListStyles(currentSong: number) {
    [...this.songListElement.children].forEach((li, i) => {
      const anchor = li.querySelector("a");

      if (i === currentSong) {
        anchor?.classList.add("active");
      } else {
        anchor?.classList.remove("active");
      }
    });
  }
}
