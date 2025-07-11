export function switchPanels(switchButton: HTMLButtonElement, panel1: HTMLElement, panel2: HTMLElement) {
  const showingFirstPanel = switchButton.dataset.open === "true";
  switchButton.dataset.open = `${!showingFirstPanel}`;

  if (!showingFirstPanel) {
    panel1.classList.add("hide");
    panel2.classList.remove("hide");
    switchButton.textContent = switchButton.dataset.firstPanelText!;
  } else {
    panel1.classList.remove("hide");
    panel2.classList.add("hide");
    switchButton.textContent = switchButton.dataset.secondPanelText!;
  }
}

export function populateDropdown<T extends { name: string }>(dropdown: HTMLSelectElement, selectables: T[], selectedIndex: number) {
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.lastChild!);
  }

  for (const selectable of selectables) {
    const option = document.createElement("option");
    option.value = selectable.name;
    option.textContent = selectable.name;
    dropdown.appendChild(option);
  }

  dropdown.selectedIndex = selectedIndex;
}
