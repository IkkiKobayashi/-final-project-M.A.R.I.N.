const config = {
  apiUrl:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://marin.onrender.com",
};

export default config;
