import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  runTransaction,
  setDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

import generateString from "./util/generateString";
import isValidURL from "./util/validateURL";
import db from "./firebase";
import "./FirebaseExample.css";
import { toHttpsUrl } from "./util/toHTTPSURL";

async function resolveSlug(slug: string): Promise<string | null> {
  // 🔑 Replace this with your DB lookup (Firestore, Supabase, etc.)
  // For example, Firestore:
  //
  // const snap = await getDoc(doc(db, "shortUrls", slug));
  // return snap.exists() ? snap.data().longUrl : null;
  //
  return null;
}
// Define the type for your ShortenedUrl
//
//
//  - id: string
//  - created at: Date
//  - url hash: string
//  - link url: string
//
//
//  add, fetch, useEffect
//  interface
//

interface ShortenedUrl {
  id: string;
  createdAt: Date;
  urlHash: string;
  linkUrl: string;
}

function FirebaseExample() {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Collection reference
  const dbName = "shortenedUrls";
  const shortenedUrlsCollection = collection(db, dbName);

  // Fetch data on component mount
  useEffect(() => {
    fetchShortenedUrls();

    // Optional: Set up real-time listener
    const unsubscribe = onSnapshot(shortenedUrlsCollection, (snapshot) => {
      const itemsData: ShortenedUrl[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          createdAt: data.createdAt,
          urlHash: data.urlHash,
          linkUrl: data.linkUrl,
        };
      });
      setUrls(itemsData);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // Fetch all items
  const fetchShortenedUrls = async (): Promise<void> => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(shortenedUrlsCollection);
      const shortenedUrlsData: ShortenedUrl[] = querySnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          createdAt: doc.data().createdAt,
          urlHash: doc.data().urlHash,
          linkUrl: doc.data().linkUrl,
        }),
      );
      setUrls(shortenedUrlsData);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add new item
  const MAX_TRIES = 5; // how many hashes we’ll try before giving up

  const addShortenedUrl = async (
    e: React.MouseEvent | React.KeyboardEvent,
  ): Promise<void> => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    if (!isValidURL(linkUrl)) {
      console.log("invalid url", linkUrl);
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
          setLinkUrl("");
          console.log("Item added successfully!");
          console.log("Saved under ID:", urlHash);
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
  };
  // Update item
  // const updateItem = async (
  //   id: string,
  //   updates: Partial<Omit<Item, "id">>,
  // ): Promise<void> => {
  //   try {
  //     const itemDoc = doc(db, "items", id);
  //     await updateDoc(itemDoc, updates);
  //     console.log("Item updated successfully!");
  //   } catch (error) {
  //     console.error("Error updating item:", error);
  //   }
  // };
  //

  // Delete item
  const deleteShortenedUrl = async (id: string): Promise<void> => {
    try {
      const itemDoc = doc(db, dbName, id);
      await deleteDoc(itemDoc);
      console.log("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="firebase-container">
      <h1 className="firebase-title">Firebase Shortened URLs</h1>

      {/* Add Item Form */}
      <div className="add-item-form">
        <div className="input-group">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter new item..."
            className="item-input"
            onKeyDown={(e) => e.key === "Enter" && addShortenedUrl(e)}
          />
          <button onClick={addShortenedUrl} className="add-button">
            Add
          </button>
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <div className="items-container">
          {urls.length === 0 ? (
            <p className="empty-message">No items yet. Add one above!</p>
          ) : (
            urls.map((url) => (
              <div key={url.id} className="item-row">
                <div className="item-content"></div>
                <span>
                  {url.urlHash} -{">"} {url.linkUrl}
                </span>

                <button
                  onClick={() => deleteShortenedUrl(url.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <button onClick={fetchShortenedUrls} className="refresh-button">
        Refresh Data
      </button>
    </div>
  );
}

export default FirebaseExample;
