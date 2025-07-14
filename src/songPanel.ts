import { newSongSelectedEvent, songUploadedEvent, stateChangedEvent } from "./Events";
import type { Song } from "./types";
import { randomID } from "./utils/utils";
import { switchPanels } from "./utils/commonUIBehaviors";

export default class SongPanel {
  private artistInput: HTMLInputElement;
  private songNameInput: HTMLInputElement;
  private songFileInput: HTMLInputElement;
  private songUploadForm: HTMLFormElement;
  private panelSwapButton: HTMLButtonElement;
  private songListElement: HTMLUListElement;
  private currentSong: number;
  private songList: Song[];

  constructor({ currentSong, songList }: { currentSong: number; songList: Song[] }) {
    this.artistInput = document.querySelector("#artist-input")!;
    this.songNameInput = document.querySelector("#song-name-input")!;
    this.songFileInput = document.querySelector("#song-file-input")!;
    this.songUploadForm = document.querySelector("#uploadSongForm")!;
    this.panelSwapButton = document.querySelector("#panel-song-swap-button")!;
    this.songListElement = document.querySelector("#song-list")!;
    this.currentSong = currentSong;
    this.songList = songList;

    // EVENTS
    this.songUploadForm.addEventListener("submit", (e) => this.handleFormSubmission(e));
    this.panelSwapButton.addEventListener("click", () => this.handlePanelSwapButton());
    this.handleSongListStyles(this.currentSong);

    window.addEventListener(stateChangedEvent, (e: CustomEventInit) => {
      this.currentSong = e.detail.currentSong;
      this.songList = e.detail.songList;
    });
  }

  handlePanelSwapButton() {
    switchPanels(this.panelSwapButton, this.songListElement.parentElement!, this.songUploadForm.parentElement!);
  }

  handleFormSubmission(e: Event) {
    e.preventDefault();
    const { files } = this.songFileInput;

    window.dispatchEvent(
      new CustomEvent(songUploadedEvent, {
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
    while (this.songListElement.firstChild) {
      this.songListElement.firstChild.remove();
    }

    this.songList.forEach((song) => {
      const li = this.handleCreateNewListElement(song);
      this.songListElement.appendChild(li);
    });

    window.dispatchEvent(
      new CustomEvent(newSongSelectedEvent, {
        detail: {
          currentSong: this.currentSong,
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
    const songIndex = this.songList.findIndex((song) => song.src === src);
    this.handleSongListStyles(songIndex);

    window.dispatchEvent(
      new CustomEvent(newSongSelectedEvent, {
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
