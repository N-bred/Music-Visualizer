export function switchClasses(switchCondition: boolean, element1: HTMLElement, element2: HTMLElement) {
  if (switchCondition) {
    element1.classList.remove("hide");
    element2.classList.add("hide");
  } else {
    element1.classList.add("hide");
    element2.classList.remove("hide");
  }
}

export function switchPanels(switchButton: HTMLButtonElement, panel1: HTMLElement, panel2: HTMLElement) {
  const showingFirstPanel = switchButton.dataset.open === "true";
  switchButton.dataset.open = `${!showingFirstPanel}`;

  switchClasses(showingFirstPanel, panel1, panel2);
  if (showingFirstPanel) {
    switchButton.textContent = switchButton.dataset.secondPanelText!;
  } else {
    switchButton.textContent = switchButton.dataset.firstPanelText!;
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
