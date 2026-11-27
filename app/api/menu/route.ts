import { getCachedMenu } from '@/lib/menu';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const data = await getCachedMenu();
  return Response.json(data);
}
