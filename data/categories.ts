export type MenuType = 'food' | 'drink'

export type MenuCategory = {
  id: string
  nameEn: string
  nameAm: string
  type: MenuType
}

export const categories: MenuCategory[] = [
  { id: 'smoothies', nameEn: 'Smoothies', nameAm: '', type: 'drink' },
  { id: 'juices', nameEn: 'Juices', nameAm: '', type: 'drink' },
  { id: 'burgers', nameEn: 'Burgers', nameAm: '', type: 'food' },
  { id: 'pizza', nameEn: 'Pizza', nameAm: '', type: 'food' },
  { id: 'shawarma', nameEn: 'Shawarma', nameAm: '', type: 'food' },
  { id: 'sandwiches', nameEn: 'Sandwiches', nameAm: '', type: 'food' },
  { id: 'sides-and-light-bites', nameEn: 'Sides and light bites', nameAm: '', type: 'food' },
  { id: 'salads', nameEn: 'Salads', nameAm: '', type: 'food' },
]
