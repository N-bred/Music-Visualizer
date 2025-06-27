import {
  StateChangedEvent,
  songUploadedEvent,
  changedSongIndexEvent,
} from "./Events";
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
  private _currentSong: number;
  private _state: Song;
  private _stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.artistInput = document.querySelector("#artist-input")!;
    this.songNameInput = document.querySelector("#song-name-input")!;
    this.songFileInput = document.querySelector("#song-file-input")!;
    this.songUploadForm = document.querySelector("#uploadSongForm")!;
    this.panelSwapButton = document.querySelector("#panel-song-swap-button")!;
    this.songListElement = document.querySelector("#song-list")!;
    this._currentSong = 0;
    this._stateManager = stateManager;

    // EVENTS

    this.songUploadForm.addEventListener("submit", (e) => {
      this.handleFormSubmission(e);
    });

    this.handleSonglistItemsSetEvent();

    this.handleSongListStyles(this._currentSong);

    // STATE

    this._state = {
      id: "",
      artistName: "",
      songName: "",
      src: "",
    };
  }

  get state() {
    return this._state;
  }

  handleCleanState() {
    this._state.id = "";
    this._state.artistName = "";
    this._state.songName = "";
    this._state.src = "";
  }

  handleCleanUIState() {
    this.songUploadForm.reset();
  }

  handleRefreshUIState(newSong: Song) {
    const li = this.handleCreateNewListElement(newSong);
    this.songListElement.appendChild(li);
  }

  handleCreateNewListElement(newSong: Song) {
    const li = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.href = newSong.src!;
    anchor.dataset.url = newSong.src!;
    anchor.textContent = `${newSong.artistName} - ${newSong.songName}`;
    anchor.addEventListener("click", (e) => this.handleSongItemSetEvent(e));
    li.appendChild(anchor);
    return li;
  }

  handleFormSubmission(e: Event) {
    e.preventDefault();
    const artistName = this.artistInput.value;
    const songName = this.songNameInput.value;

    this._state = {
      id: randomID(artistName, songName),
      artistName,
      songName,
    };

    const { files } = this.songFileInput;

    for (let i = 0; i < files!.length; ++i) {
      const file = files![i];
      const src = URL.createObjectURL(file);
      this._state.src = src;
    }

    const result = this._stateManager.handleAddNewSong(this._state);

    if (result) {
      this.handleRefreshUIState(this._state);
      this.handleCleanUIState();
      this.handleCleanState();
    } else {
      alert("Song already in list");
    }

    window.dispatchEvent(StateChangedEvent);
    window.dispatchEvent(songUploadedEvent);
  }

  handleSonglistItemsSetEvent() {
    [...this.songListElement.children].forEach((li) => {
      const anchor = li.querySelector("a");
      anchor?.addEventListener("click", (e) => this.handleSongItemSetEvent(e));
    });
  }

  handleSongItemSetEvent(e: Event) {
    e.preventDefault();
    const anchor = e.target as HTMLAnchorElement;
    const src = anchor.dataset?.url;
    const songIndex = this._stateManager.state.songList.findIndex(
      (song) => song.src === src
    );
    this._stateManager.currentSong = songIndex;
    this.handleSongListStyles(songIndex);

    window.dispatchEvent(StateChangedEvent);
    window.dispatchEvent(changedSongIndexEvent);
  }

  handleSongListStyles(currentSong: number) {
    [...this.songListElement.children].forEach((li) => {
      li.querySelector("a")?.classList.remove("active");
    });

    const anchor = this.songListElement.children[currentSong]
      .children[0] as HTMLAnchorElement;

    anchor.classList.add("active");
  }
}
