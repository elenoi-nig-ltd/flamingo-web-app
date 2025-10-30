// app/food/page.tsx
import { Suspense } from 'react';
import FoodInterface from '@/components/food/FoodInterface';
import Loading from '@/components/Loading';

export default function FoodPage() {
  return (
    <Suspense fallback={<Loading />}>
      <FoodInterface />
    </Suspense>
  );
}