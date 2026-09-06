"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";
import { logActivity } from "@/lib/activity";
import { profileSchema, type ProfileValues } from "@/features/profile/schemas";

/** Update the signed-in user's own profile. */
export async function updateProfile(values: ProfileValues) {
  const user = await requireUser();
  const data = profileSchema.parse(values);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
    },
  });

  await logActivity({
    userId: user.id,
    action: "UPDATE",
    entityType: "Profile",
    entityId: user.id,
  });

  revalidatePath("/profile");
}
