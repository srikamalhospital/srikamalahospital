import imageMap from '../pharmacyProductImages.json';

const DEFAULT =
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=85&w=600';

/** Resolve product image — API img first, then per-medicine map, then default */
export function getPharmacyProductImage(product) {
  if (!product) return DEFAULT;
  const fromApi = product.img || product.image;
  if (fromApi && String(fromApi).startsWith('http')) return fromApi;
  if (product.name && imageMap[product.name]) return imageMap[product.name];
  return DEFAULT;
}

export default getPharmacyProductImage;
