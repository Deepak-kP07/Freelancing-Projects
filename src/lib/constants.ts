export const WHATSAPP_PHONE_NUMBER = '12345678900'; // Replace with actual number, including country code without + or 00

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  dataAiHint: string;
  category: string;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Ozonxt Home Purifier X100',
    description: 'Advanced multi-stage home water purifier with ozone disinfection. Ideal for families.',
    price: 299.99, // Assuming direct symbol swap, actual value might need conversion
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'home water filter',
    category: 'Home Purifiers',
  },
  {
    id: '2',
    name: 'Ozonxt Commercial Purifier C500',
    description: 'High-capacity water purification system for commercial use. Ensures safe water for your business.',
    price: 1299.99,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'large water purifier',
    category: 'Commercial Purifiers',
  },
  {
    id: '3',
    name: 'Ozonxt Portable Bottle',
    description: 'Purifying water bottle with built-in ozone tech. Clean water on the go.',
    price: 79.99,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'filter water bottle',
    category: 'Accessories',
  },
  {
    id: '4',
    name: 'Replacement Filter Pack',
    description: 'Pack of 3 replacement filters for Ozonxt Home Purifier X100.',
    price: 49.99,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'water filter cartridges',
    category: 'Accessories',
  },
  {
    id: '5',
    name: 'Ozonxt Shower Filter',
    description: 'Enjoy ozonated, pure water in your shower. Reduces chlorine and impurities.',
    price: 89.99,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'shower head filter',
    category: 'Home Purifiers',
  },
  {
    id: '6',
    name: 'Industrial Ozone Generator I-1000',
    description: 'Powerful ozone generator for large-scale water treatment and sanitation.',
    price: 2500.00,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'industrial ozone machine',
    category: 'Commercial Purifiers',
  },
];

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  text: string;
  avatarUrl: string;
  dataAiHint: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    author: 'Sarah L.',
    role: 'Homeowner',
    text: "Since installing the Ozonxt Home Purifier, my family's drinking water has never tasted better. The peace of mind is priceless!",
    avatarUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'happy woman',
  },
  {
    id: '2',
    author: 'John B.',
    role: 'Restaurant Owner',
    text: 'The Ozonxt Commercial Purifier is a game-changer for my restaurant. Our customers notice the difference in water quality.',
    avatarUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'male chef',
  },
  {
    id: '3',
    author: 'Emily K.',
    role: 'Fitness Enthusiast',
    text: "I love my Ozonxt Portable Bottle! It's perfect for the gym and ensures I have clean water wherever I go.",
    avatarUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'sporty woman',
  },
];

export const SERVICE_TYPES = [
  'Installation',
  'Maintenance',
  'Repair',
  'Consultation',
  'Water Quality Testing',
];
