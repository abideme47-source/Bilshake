import { MenuPage } from '@/components/menu-page'
import { getCachedMenu } from '@/lib/menu'

export default async function DrinkMenuPage() {
  const data = await getCachedMenu()
  return (
    <MenuPage
      type="drink"
      categories={data.categories}
      items={data.items}
    />
  )
}
