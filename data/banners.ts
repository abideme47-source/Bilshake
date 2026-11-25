export type Banner = {
  id: string
  imageUrl: string
  title: string
  titleAm?: string
  tillDate: string
  active: boolean
}

export const banners: Banner[] = [
  { id: 'family-combo', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85', title: 'The perfect burger combo', tillDate: 'Till Nov 29', active: true },
  { id: 'fresh-juice', imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=1200&q=85', title: 'A little taste of fresh', tillDate: 'Till Nov 29', active: true },
  { id: 'pizza-night', imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=1200&q=85', title: 'Make tonight a pizza night', tillDate: 'Till Nov 29', active: true },
]
