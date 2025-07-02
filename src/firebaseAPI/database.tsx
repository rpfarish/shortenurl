const MAX_TRIES = 5; // how many hashes we’ll try before giving up

import { collection, doc, runTransaction } from "firebase/firestore";
import db from "../firebase";
import { databaseName } from "../firebaseConfig";
import isValidURL from "../util/validateURL";
import { toHttpsUrl } from "../util/toHTTPSURL";
import generateString from "../util/generateString";

const dbName = databaseName;
const shortenedUrlsCollection = collection(db, dbName);

export const handleShortenUrl = (linkUrl: string) => {
  return (e: React.MouseEvent | React.KeyboardEvent) => {
    return addShortenedUrl(e, linkUrl);
  };
};
export const addShortenedUrl = async (
  e: React.MouseEvent | React.KeyboardEvent,
  linkUrl: string,
): Promise<string> => {
  e.preventDefault();
  if (!linkUrl.trim()) return "";
  if (!isValidURL(linkUrl)) {
    console.log("invalid url", linkUrl);
    return "";
  }
  const linkUrlHTTPS = toHttpsUrl(linkUrl);
  console.log("new https url", linkUrlHTTPS);

  try {
    let tries = 0;
    let saved = false;

    while (!saved && tries < MAX_TRIES) {
      const urlHash = generateString(7);
      const docRef = doc(shortenedUrlsCollection, urlHash);

      try {
        // 🚦 transaction = atomic “check‑then‑set”
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(docRef);

          if (snap.exists()) {
            throw new Error("collision"); // same hash already in use
          }

          tx.set(docRef, {
            createdAt: new Date(), // keep Date object
            urlHash: urlHash, // keep field
            linkUrl: linkUrlHTTPS,
          });
        });

        // if we get here, the write succeeded
        saved = true;
        console.log("Item added successfully!");
        console.log("Saved under ID:", urlHash);
        return urlHash;
      } catch (err: any) {
        if (err.message !== "collision") throw err; // real error – abort
        tries += 1; // hash collision – try again
      }
    }

    if (!saved) {
      console.error(`Failed after ${MAX_TRIES} collisions – please retry.`);
    }
  } catch (error) {
    console.error("Error adding item:", error);
  }
  return "";
};
