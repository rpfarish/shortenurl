import { useState } from "react";
import isValidURL from "./util/validateURL";
import "./Interface.css";
import { addShortenedUrl } from "./firebaseAPI/database";
import FirebaseCopyTextBox from "./CopyTextBox";

const UrlInterface = () => {
  const [inputURL, setInputURL] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [urlIsValid, setUrlIsValid] = useState(false);
  const [urlHash, setUrlHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prevUrl, setPrevUrl] = useState("");
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
          onClick={async (e) => {
            setIsLoading(true);
            const isValid = isValidURL(inputURL);
            setUrlIsValid(isValid);
            setHasGenerated(true);
            if (!isValid) {
              setIsLoading(false);
              return;
            } else if (prevUrl !== inputURL) {
              const urlHash = await addShortenedUrl(e, inputURL);
              setUrlHash(urlHash);
            }
            setPrevUrl(inputURL);
            setIsLoading(false);
          }}
        >
          Generate
        </button>
      </div>

      {!isLoading ? (
        hasGenerated && (urlIsValid ? <p></p> : <p>Invalid URL</p>)
      ) : (
        <p>Loading...</p>
      )}
      {!isLoading && hasGenerated && (
        <FirebaseCopyTextBox urlHash={"localhost:5173/" + urlHash} />
      )}
    </div>
  );
};
export default UrlInterface;
