import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ItemDetail } from '@/components/item-detail'
import { getCachedMenu } from '@/lib/menu'

type ItemPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ItemPageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getCachedMenu()
  const item = data.items.find((i) => i.id === id)
  return { title: item ? `${item.nameEn} | Bilshake` : 'Menu item | Bilshake' }
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params
  const data = await getCachedMenu()
  const item = data.items.find((i) => i.id === id)
  if (!item) notFound()

  return (
    <ItemDetail item={item} />
  )
}
