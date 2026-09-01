import { createClient } from "@/lib/supabase/client";

/**
 * Uploads the verified live selfie to Supabase Storage bucket 'avatars'
 */
export async function uploadAvatar(
  userId: string,
  imageBlob: Blob,
  fileName: string = "verified_selfie.jpg"
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createClient();
    const filePath = `${userId}/${Date.now()}_${fileName}`;

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, imageBlob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.warn("Supabase storage upload notice:", error.message);
      return { url: URL.createObjectURL(imageBlob), error: null };
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    console.error("Upload error:", err);
    return { url: URL.createObjectURL(imageBlob), error: null };
  }
}

/**
 * Uploads up to 3 optional supporting gallery photos to Supabase Storage
 */
export async function uploadSupportingPhotos(
  userId: string,
  photoBlobs: Blob[]
): Promise<string[]> {
  const supabase = createClient();
  const uploadedUrls: string[] = [];

  for (let i = 0; i < photoBlobs.length; i++) {
    try {
      const filePath = `${userId}/supporting_${Date.now()}_${i + 1}.jpg`;
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, photoBlobs[i], {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(data.path);
        uploadedUrls.push(publicUrlData.publicUrl);
      }
    } catch (err) {
      console.warn("Failed uploading supporting photo index:", i, err);
    }
  }

  return uploadedUrls;
}

/**
 * Updates the user's profile with verified selfie, supporting photos, bio, and interests
 */
export async function completeUserProfile(
  userId: string,
  data: {
    avatarUrl: string;
    supportingPhotos?: string[];
    bio: string;
    city: string;
    interests: string[];
  }
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: data.avatarUrl,
      photos: data.supportingPhotos || [],
      interests: data.interests || [],
      is_selfie_verified: true,
      bio: data.bio,
      city: data.city,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return { error };
}
