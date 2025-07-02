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
      <p>Enter your destination URL</p>
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
            if (prevUrl === inputURL) {
              setIsLoading(false);
              return;
            }
            if (isValid && prevUrl !== inputURL) {
              setPrevUrl(inputURL);
              const urlHash = await addShortenedUrl(e, inputURL);
              const urlHashDomain =
                "https://rpfarish.github.io/shortenurl/#/" + urlHash;
              setUrlHash(urlHashDomain);
            }
            setIsLoading(false);
          }}
        >
          Generate
        </button>
      </div>

      {!isLoading ? (
        hasGenerated &&
        (urlIsValid ? <p></p> : <p className="invalidUrl">Invalid URL</p>)
      ) : (
        <p>Loading...</p>
      )}
      {!isLoading && hasGenerated && urlIsValid && (
        <FirebaseCopyTextBox urlHash={urlHash} />
      )}
    </div>
  );
};

export default UrlInterface;
