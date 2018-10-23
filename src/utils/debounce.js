// utils
const debounce = (fn, wait = 100) => {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
    fn.apply(this, args);
    }, wait);
  };
}

export default debounce;