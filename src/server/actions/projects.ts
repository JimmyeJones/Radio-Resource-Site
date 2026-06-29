'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { projects, projectItems, videos, articles, hubItems, datasheets } from '@/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { indexProject, removeDoc } from '@/server/search';

const ITEM_TYPES = ['video', 'article', 'hub', 'datasheet'] as const;
export type ProjectItemType = (typeof ITEM_TYPES)[number];

export async function listProjectsLite() {
  return db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .orderBy(desc(projects.updatedAt))
    .all();
}

const createSchema = z.object({ name: z.string().min(1).max(160), description: z.string().max(2000).optional() });

export async function createProjectAction(formData: FormData) {
  const parse = createSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    description: (formData.get('description') as string | null) || undefined,
  });
  if (!parse.success) return { ok: false, error: 'A project name is required' };
  const id = randomUUID();
  db.insert(projects)
    .values({ id, name: parse.data.name, description: parse.data.description ?? null })
    .run();
  indexProject(id);
  revalidatePath('/projects');
  return { ok: true, id };
}

export async function renameProjectAction(id: string, name: string, description: string | null) {
  db.update(projects)
    .set({ name, description, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(projects.id, id))
    .run();
  indexProject(id);
  revalidatePath(`/projects/${id}`);
  revalidatePath('/projects');
}

export async function setProjectStatusAction(id: string, status: 'planning' | 'active' | 'done' | 'archived') {
  db.update(projects)
    .set({ status, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(projects.id, id))
    .run();
  revalidatePath(`/projects/${id}`);
  revalidatePath('/projects');
}

export async function saveProjectNotesAction(id: string, notes: string) {
  db.update(projects)
    .set({ notes, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(projects.id, id))
    .run();
  indexProject(id);
  revalidatePath(`/projects/${id}`);
  return { ok: true };
}

export async function deleteProjectAction(id: string) {
  db.delete(projectItems).where(eq(projectItems.projectId, id)).run();
  db.delete(projects).where(eq(projects.id, id)).run();
  removeDoc('project', id);
  revalidatePath('/projects');
}

export async function linkItemAction(projectId: string, itemType: ProjectItemType, itemId: string) {
  if (!ITEM_TYPES.includes(itemType)) return { ok: false, error: 'Bad item type' };
  const exists = db
    .select()
    .from(projectItems)
    .where(
      and(
        eq(projectItems.projectId, projectId),
        eq(projectItems.itemType, itemType),
        eq(projectItems.itemId, itemId),
      ),
    )
    .get();
  if (!exists) {
    db.insert(projectItems)
      .values({ id: randomUUID(), projectId, itemType, itemId })
      .run();
    db.update(projects).set({ updatedAt: Math.floor(Date.now() / 1000) }).where(eq(projects.id, projectId)).run();
  }
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

export async function unlinkItemAction(projectItemId: string, projectId: string) {
  db.delete(projectItems).where(eq(projectItems.id, projectItemId)).run();
  revalidatePath(`/projects/${projectId}`);
}

/** Resolve the linked items of a project into display rows grouped by type. */
export async function getProjectItems(projectId: string) {
  const links = db.select().from(projectItems).where(eq(projectItems.projectId, projectId)).all();
  const resolved = links.map((link) => {
    let title = '(missing)';
    let href = '#';
    switch (link.itemType) {
      case 'video': {
        const r = db.select().from(videos).where(eq(videos.id, link.itemId)).get();
        if (r) { title = r.title; href = `/library/videos/${r.id}`; }
        break;
      }
      case 'article': {
        const r = db.select().from(articles).where(eq(articles.id, link.itemId)).get();
        if (r) { title = r.title; href = `/library/articles/${r.id}`; }
        break;
      }
      case 'hub': {
        const r = db.select().from(hubItems).where(eq(hubItems.id, link.itemId)).get();
        if (r) { title = r.title; href = r.url; }
        break;
      }
      case 'datasheet': {
        const r = db.select().from(datasheets).where(eq(datasheets.id, link.itemId)).get();
        if (r) { title = r.title; href = `/library/datasheets/${r.id}`; }
        break;
      }
    }
    return { linkId: link.id, itemType: link.itemType, title, href };
  });
  return resolved;
}
