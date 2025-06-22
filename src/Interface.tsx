import { useState } from "react";
import isValidURL from "./util/validateURL";
import generateString from "./util/generateString";
import "./Interface.css";

const UrlInterface = () => {
  const [inputURL, setInputURL] = useState("");
  const [shortenedURL, setShortenedURL] = useState("");
  const [urlIsValid, setUrlIsValid] = useState(false);
  return (
    <div className="card">
      <div className="inputDiv">
        <input
          className="urlInput"
          type="text"
          value={inputURL}
          onChange={(e) => setInputURL(e.target.value)}
        />
        <button
          onClick={() => {
            setUrlIsValid(isValidURL(inputURL));
            setShortenedURL(inputURL);
          }}
        >
          Generate
        </button>
      </div>

      {shortenedURL &&
        (urlIsValid ? <p>New URL: {shortenedURL}</p> : <p>Invalid URL</p>)}
      <p>Random string: {generateString()}</p>
    </div>
  );
};
export default UrlInterface;
