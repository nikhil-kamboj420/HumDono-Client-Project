self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAR_CACHE") {
    console.log("SW: Clearing all caches…");

    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});
