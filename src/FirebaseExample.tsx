import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

import generateString from "./util/generateString";
import db from "./firebase";
import "./FirebaseExample.css";

// Define the type for your ShortenedUrl
//
//  - id: string
//  - created at: Date
//  - url hash: string
//  - link url: string
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
      const itemsData: ShortenedUrl[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        createdAt: doc.data().createdAt,
        urlHash: doc.data().urlHash,
        linkUrl: doc.data().linkUrl,
      }));
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
  const addShortenedUrl = async (
    e: React.MouseEvent | React.KeyboardEvent,
  ): Promise<void> => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    try {
      await addDoc(shortenedUrlsCollection, {
        createdAt: new Date(),
        urlHash: generateString(7),
        linkUrl: linkUrl,
      });
      setLinkUrl("");
      console.log("Item added successfully!");
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
