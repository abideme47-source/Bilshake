import { MenuPage } from '@/components/menu-page'
import { getCachedMenu } from '@/lib/menu'

export default async function FoodMenuPage() {
  const data = await getCachedMenu()
  return (
    <MenuPage
      type="food"
      categories={data.categories}
      items={data.items.filter((it) => it.type === 'food')}
    />
  )
}
