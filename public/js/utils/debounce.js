// Waits until calls stop for `delay` ms, then runs `callback` once with the latest arguments.
export function debounce(callback, delay) {
  let timeoutId;

  function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  }

  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}
