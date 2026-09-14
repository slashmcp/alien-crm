"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function markLeadAsDNC(leadId: string) {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "DNC",
        email: null // Erase email for compliance
      }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking DNC:", error);
    return { success: false, error: error.message };
  }
}
