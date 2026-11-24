import { OrderTracking } from '@/components/order-tracking'

export default async function OrderTrackingPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params
  return <OrderTracking number={Number(number)} />
}
