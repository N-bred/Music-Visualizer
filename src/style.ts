import "./styles.scss";

const panelSongs: HTMLDivElement = document.querySelector(".panel-songs")!;
const panelData: HTMLDivElement = document.querySelector(".panel-data")!;

const panelSongsButton: HTMLButtonElement = document.querySelector(
  "#hamburger-button-panel-songs"
)!;
const panelDataButton: HTMLButtonElement = document.querySelector(
  "#hamburger-button-panel-data"
)!;

const menuState = {
  currentElement: panelSongs,
  isActive: false,
};

const handleButtonClick = (
  button: HTMLButtonElement,
  panel: HTMLDivElement
) => {
  button.addEventListener("click", (e: Event) => {
    e.preventDefault();

    if (menuState.isActive) {
      menuState.currentElement.classList.remove("active");
      menuState.isActive = false;

      if (menuState.currentElement !== panel) {
        menuState.currentElement = panel;
        menuState.isActive = true;
        panel.classList.add("active");
      }
    } else {
      menuState.currentElement = panel;
      menuState.isActive = true;
      panel.classList.add("active");
    }
  });
};

handleButtonClick(panelSongsButton, panelSongs);
handleButtonClick(panelDataButton, panelData);
