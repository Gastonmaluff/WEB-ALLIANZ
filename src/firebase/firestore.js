import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";

const propertiesCollection = collection(db, "properties");
const testimonialsCollection = collection(db, "testimonials");

export async function fetchProperties() {
  const q = query(propertiesCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
}

export async function createProperty(payload) {
  return addDoc(propertiesCollection, payload);
}

export async function updateProperty(id, payload) {
  return updateDoc(doc(db, "properties", id), payload);
}

export async function fetchPropertyById(id) {
  const snapshot = await getDoc(doc(db, "properties", id));
  if (!snapshot.exists()) return null;
  return { ...snapshot.data(), id: snapshot.id };
}

export async function upsertPropertyById(id, payload) {
  return setDoc(doc(db, "properties", id), payload, { merge: true });
}

export async function deleteProperty(id) {
  return deleteDoc(doc(db, "properties", id));
}

export async function fetchTestimonials() {
  const snapshot = await getDocs(testimonialsCollection);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createTestimonial(payload) {
  return addDoc(testimonialsCollection, payload);
}

export async function updateTestimonial(id, payload) {
  return updateDoc(doc(db, "testimonials", id), payload);
}

export async function deleteTestimonial(id) {
  return deleteDoc(doc(db, "testimonials", id));
}
