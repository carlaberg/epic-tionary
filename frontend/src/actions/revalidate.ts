"use server";
import { revalidatePath } from "next/cache";

export async function revalidateClientSide(path: string) {
  revalidatePath(path);
}
