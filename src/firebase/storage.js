import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./config";

export async function uploadPropertyImage(file, pathPrefix = "properties") {
  const fileRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export async function removeImageByPath(path) {
  if (!path) return;
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
}
