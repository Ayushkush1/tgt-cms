export async function uploadFiles(
  files: (File | string | null)[],
): Promise<(string | null)[]> {
  const fileIndices: number[] = [];
  const formData = new FormData();

  files.forEach((file, index) => {
    if (file instanceof File) {
      formData.append(`file_${index}`, file);
      fileIndices.push(index);
    }
  });

  if (fileIndices.length === 0) {
    // If there are no new files, just return the strings/nulls that already exist
    return files.map((f) => (typeof f === "string" ? f : null));
  }

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      const result = [...files];
      let uploadIdx = 0;
      files.forEach((file, index) => {
        if (file instanceof File) {
          result[index] = data.files[uploadIdx++];
        } else if (typeof file === "string") {
          result[index] = file;
        } else {
          result[index] = null;
        }
      });
      return result as (string | null)[];
    } else {
      console.error("Upload handler failed", data.error);
      throw new Error(data.error || "Upload failed");
    }
  } catch (err) {
    console.error("Upload error", err);
    throw err;
  }
}
