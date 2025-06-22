import "./App.css";
import UrlInterface from "./Interface";
import FirebaseExample from "./FirebaseExample";

function App() {
  console.log("Reloaded App");

  return (
    <>
      <h1>URL Shortener:</h1>
      <UrlInterface />
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <FirebaseExample />
    </>
  );
}

export default App;
