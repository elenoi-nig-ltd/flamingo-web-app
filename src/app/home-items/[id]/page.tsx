'use client';

import { useParams } from 'next/navigation';
import HomeItemDetail from "@/components/home-items/HomeItemDetails";

const Page = () => {
  const params = useParams();
  const productId = params.id as string;

  return <HomeItemDetail productId={productId} />;
};

export default Page;