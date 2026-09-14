'use server'
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function saveLead(leadData: any) {
  // Check if exists
  const existing = await prisma.lead.findFirst({
    where: { name: leadData.name, location: leadData.location }
  });

  let result;
  if (existing) {
    result = await prisma.lead.update({
      where: { id: existing.id },
      data: {
        website: leadData.website || existing.website,
        email: leadData.email || existing.email,
        status: leadData.status || existing.status,
        auditDraft: leadData.auditDraft || existing.auditDraft
      }
    });
  } else {
    result = await prisma.lead.create({
      data: {
        name: leadData.name,
        location: leadData.location,
        website: leadData.website,
        email: leadData.email,
        status: leadData.status || "Scraped",
        auditDraft: leadData.auditDraft
      }
    });
  }
  
  revalidatePath("/");
  return {
    ...result,
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString()
  };
}

import { unstable_noStore as noStore } from "next/cache";

export async function getLeads() {
  noStore();
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  });
  // Next.js client components need dates serialized if they aren't parsed by RSC
  return leads.map(l => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString()
  }));
}

export async function clearLeads() {
  await prisma.lead.deleteMany({});
  revalidatePath("/");
}
