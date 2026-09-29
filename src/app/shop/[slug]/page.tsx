import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailView } from "@/components/shop/ProductDetailView";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: {
      slug,
      deletedAt: null,
      isPublished: true,
    },
    select: {
      name: true,
      description: true,
      images: true,
      cacaoPercentage: true,
      category: true,
    },
  });

  if (!product) {
    return {
      title: "Product Not Found | ChocoBliss by Tasnim",
      description: "The requested artisanal chocolate could not be found.",
    };
  }

  const cacaoText = product.cacaoPercentage ? ` (${product.cacaoPercentage}% Cacao)` : "";

  return {
    title: `${product.name}${cacaoText} | ChocoBliss by Tasnim`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} — Handcrafted Artisanal Chocolate`,
      description: product.description.slice(0, 160),
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      deletedAt: null,
      isPublished: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch related creations in same category or fallback to top products
  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      category: product.category,
      deletedAt: null,
      isPublished: true,
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <ProductDetailView
      product={{
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
      }}
      relatedProducts={relatedProducts.map((p) => ({
        ...p,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
      }))}
    />
  );
}
