import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION_NAME = "diagnoses";

/**
 * Save or update a diagnosis in Firebase Firestore
 */
export async function saveDiagnosisToFirebase(entry) {
  try {
    if (!entry || !entry.id) {
      throw new Error("Diagnosis entry must have a valid ID");
    }
    const docRef = doc(db, COLLECTION_NAME, entry.id);
    await setDoc(docRef, {
      id: entry.id,
      errorMessage: entry.errorMessage || "",
      technology: entry.technology || "General",
      diagnosis: entry.diagnosis || {},
      timestamp: entry.timestamp || new Date().toISOString(),
      isBookmarked: Boolean(entry.isBookmarked),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error saving diagnosis to Firebase:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete an individual diagnosis from Firebase Firestore
 */
export async function deleteDiagnosisFromFirebase(id) {
  try {
    if (!id) return { success: false };
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting diagnosis from Firebase:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle bookmark flag on a diagnosis in Firebase Firestore
 */
export async function toggleBookmarkInFirebase(id, currentBookmarked) {
  try {
    if (!id) return { success: false };
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isBookmarked: !currentBookmarked,
      updatedAt: new Date().toISOString()
    });
    return { success: true, isBookmarked: !currentBookmarked };
  } catch (error) {
    console.error("Error toggling bookmark in Firebase:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear all diagnoses from Firebase Firestore
 */
export async function clearAllDiagnosesFromFirebase(currentItems = []) {
  try {
    const batch = writeBatch(db);
    if (currentItems.length > 0) {
      currentItems.forEach((item) => {
        if (item.id) {
          batch.delete(doc(db, COLLECTION_NAME, item.id));
        }
      });
      await batch.commit();
    } else {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      snapshot.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    return { success: true };
  } catch (error) {
    console.error("Error clearing diagnoses from Firebase:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to real-time updates from Firebase Firestore diagnoses collection
 */
export function subscribeToDiagnoses(onData, onError) {
  try {
    const colRef = collection(db, COLLECTION_NAME);

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Sort descending by timestamp in memory (avoids requiring composite Firestore index)
        items.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

        if (onData) onData(items);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error("Failed to setup Firebase real-time listener:", err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Migrate local storage items to Firebase if not present
 */
export async function migrateLocalHistoryToFirebase(localItems) {
  if (!Array.isArray(localItems) || localItems.length === 0) return 0;

  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const existingIds = new Set(snapshot.docs.map((d) => d.id));

    let migratedCount = 0;
    const batch = writeBatch(db);

    for (const item of localItems) {
      if (item.id && !existingIds.has(item.id)) {
        const docRef = doc(db, COLLECTION_NAME, item.id);
        batch.set(docRef, {
          ...item,
          isBookmarked: Boolean(item.isBookmarked),
          timestamp: item.timestamp || new Date().toISOString(),
          migratedFromLocal: true
        });
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      await batch.commit();
      console.log(`Successfully migrated ${migratedCount} local diagnoses to Firebase!`);
    }

    return migratedCount;
  } catch (err) {
    console.warn("Could not migrate local history to Firebase:", err.message);
    return 0;
  }
}
