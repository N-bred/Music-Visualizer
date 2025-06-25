import {
  StateChangedEvent,
  songUploadedEvent,
  changedSongIndexEvent,
} from "./Events";
import type StateManager from "./stateManager";

type SongPanelState = {
  artistName: string;
  songName: string;
  songFile: string;
};

export default class SongPanel {
  private artistInput: HTMLInputElement;
  private songNameInput: HTMLInputElement;
  private songFileInput: HTMLInputElement;
  private songUploadForm: HTMLFormElement;
  private panelSwapButton: HTMLInputElement;
  private songListElement: HTMLUListElement;
  private _currentSong: number;
  private _state: SongPanelState;
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
      artistName: "",
      songName: "",
      songFile: "",
    };
  }

  get state() {
    return this._state;
  }

  handleFormSubmission(e: Event) {
    e.preventDefault();
    const artistName = this.artistInput.value;
    const songName = this.songNameInput.value;
    const songFile = this.songFileInput.value;

    this._state = {
      artistName,
      songName,
      songFile,
    };

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
