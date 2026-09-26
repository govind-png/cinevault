export function showLoader(container) {
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-label", "Loading movies");
  container.replaceChildren(loader);
}

export function showError(container, message = "Something went wrong. Please try again later.") {
  const error = document.createElement("p");
  error.className = "feedback-message";
  error.textContent = message;
  container.replaceChildren(error);
}