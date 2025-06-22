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

import db from "./firebase";
import "./FirebaseExample.css";

// Define the type for your items
interface Item {
  id: string;
  name: string;
  completed: boolean;
  createdAt: Date;
}

function FirebaseExample() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Collection reference
  const itemsCollection = collection(db, "items");

  // Fetch data on component mount
  useEffect(() => {
    fetchItems();

    // Optional: Set up real-time listener
    const unsubscribe = onSnapshot(itemsCollection, (snapshot) => {
      const itemsData: Item[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        completed: doc.data().completed,
        createdAt: doc.data().createdAt,
      }));
      setItems(itemsData);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // Fetch all items
  const fetchItems = async (): Promise<void> => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(itemsCollection);
      const itemsData: Item[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        completed: doc.data().completed,
        createdAt: doc.data().createdAt,
      }));
      setItems(itemsData);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add new item
  const addItem = async (
    e: React.MouseEvent | React.KeyboardEvent,
  ): Promise<void> => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      await addDoc(itemsCollection, {
        name: newItem,
        createdAt: new Date(),
        completed: false,
      });
      setNewItem("");
      console.log("Item added successfully!");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Update item
  const updateItem = async (
    id: string,
    updates: Partial<Omit<Item, "id">>,
  ): Promise<void> => {
    try {
      const itemDoc = doc(db, "items", id);
      await updateDoc(itemDoc, updates);
      console.log("Item updated successfully!");
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Delete item
  const deleteItem = async (id: string): Promise<void> => {
    try {
      const itemDoc = doc(db, "items", id);
      await deleteDoc(itemDoc);
      console.log("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="firebase-container">
      <h1 className="firebase-title">Firebase Todo List</h1>

      {/* Add Item Form */}
      <div className="add-item-form">
        <div className="input-group">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Enter new item..."
            className="item-input"
            onKeyDown={(e) => e.key === "Enter" && addItem(e)}
          />
          <button onClick={addItem} className="add-button">
            Add
          </button>
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <div className="items-container">
          {items.length === 0 ? (
            <p className="empty-message">No items yet. Add one above!</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="item-row">
                <div className="item-content">
                  <input
                    type="checkbox"
                    checked={item.completed || false}
                    onChange={(e) =>
                      updateItem(item.id, { completed: e.target.checked })
                    }
                    className="item-checkbox"
                  />
                  <span
                    className={`item-text ${item.completed ? "completed" : ""}`}
                  >
                    {item.name}
                  </span>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <button onClick={fetchItems} className="refresh-button">
        Refresh Data
      </button>
    </div>
  );
}

export default FirebaseExample;
