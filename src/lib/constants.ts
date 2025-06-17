
export const WHATSAPP_PHONE_NUMBER = '+919581172082'; 
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // This will be the final/discounted price
  originalPrice?: number; // Optional: The price before discount
  imageUrl: string;
  dataAiHint: string;
  category: string;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Dolphin RO',
    description: 'This advanced purifier removes TDS, heavy metals, bacteria, and harmful chemicals, making water safe for consumption.',
    price: 7499,
    originalPrice: 8499,
    imageUrl: 'https://res.cloudinary.com/dckm1rzyh/image/upload/v1750153445/1_nvadlv.png',
    dataAiHint: 'water purifier',
    category: 'water purifier',
  },
  {
    id: '2',
    name: 'E Series DOLPHIN RO + UV',
    description: 'Capacity 9 Litres Storage Tank Capacity 9 L Installation Type Wall Mounted/ Counter Top RO + UV Technology Smart Indicator',
    price:8999,
    originalPrice: 10000,
    imageUrl: 'https://res.cloudinary.com/dckm1rzyh/image/upload/v1750153447/3_jjcrc7.png',
    dataAiHint: 'water purifier',
    category: 'water purifier',
  },
  {
    id: '3',
    name: 'G SERIES',
    description: 'Brand G+ SERIE Special Feature :includes card holders Material: CopperIncluded Components:  1 Water Purification Unit',
    price: 16999,
    originalPrice: 21000,
    imageUrl: 'https://res.cloudinary.com/dckm1rzyh/image/upload/v1750153459/2_t2sybe.png',
    dataAiHint: 'filter bottle',
    category: 'Accessories',
  },
  {
    id: '4',
    name: 'Aqaua 9090',
    description: 'Special Feature Modern Design, LED Indicators, UV Purifaction, 7 Stage Purification, Automatic Shut Off Product Dimensions 31L x 24W x 40H Centimeters Material Plastic Capacity 10 litres',
    price: 12999, // No discount for this one
    originalPrice: 16999,
    imageUrl: 'https://res.cloudinary.com/dckm1rzyh/image/upload/v1750153447/4_wvk7ht.png',
    dataAiHint: 'water cartridges',
    category: 'Accessories',
  },
  {
    id: '5',
    name: 'DOLPHIN + ALKALINE ',
    description: 'RO + ALKALINE WITH 1 YEAR BRAND WARRANTY IN ELECTRICAL ITEMS',
    price: 10699,
    originalPrice: 12999,
    imageUrl: 'https://res.cloudinary.com/dckm1rzyh/image/upload/v1750153449/6_wmlbrx.png',
    dataAiHint: 'ozone machine',
    category: 'Commercial Purifiers',
  },
  {
    id: '6',
    name: 'AQUA 2090',
    description: 'Powerful ozone generator for large-scale water treatment and sanitation.',
    price: 9999,
    originalPrice: 12999,
    imageUrl: 'https://res.cloudinary.com/dckm1rzyh/image/upload/v1750153448/5_xsxsgw.png',
    dataAiHint: 'ozone machine',
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
    author: 'Rajesh ',
    role: 'Homeowner',
    text: "Since installing the Ozonxt Home Purifier, my family's drinking water has never tasted better. The peace of mind is priceless!",
    avatarUrl: 'https://res.cloudinary.com/dckm1rzyh/image/upload/v1750172100/3_wm1kc0.png',
    dataAiHint: 'happy man',
  },
  {
    id: '2',
    author: 'Dhanush Genupudi',
    role: 'IT Employee',
    text: 'The Ozonxt is a Great Experience and Recommended to everyone',
    avatarUrl: 'https://res.cloudinary.com/dckm1rzyh/image/upload/v1750172100/2_mom8fg.png',
    dataAiHint: 'male chef',
  },
  {
    id: '3',
    author: 'Naveen.',
    role: 'Fitness Enthusiast',
    text: "I love my Ozonxt Portable service! It's perfect for the daily use and ensures I have clean water wherever I drink.",
    avatarUrl: 'https://res.cloudinary.com/dckm1rzyh/image/upload/v1750172100/1_xddgqp.png',
    dataAiHint: 'sporty man',
  },
];

export const SERVICE_TYPES = [
  'Installation',
  'Maintenance',
  'Repair',
  'Consultation',
  'Water Quality Testing',
];

// Changed ADMIN_EMAIL to an array of strings
export const ADMIN_EMAIL = ['tumbikarthik2797@gmail.com','deepakperumal09@gmail.com'];

export const SERVICE_STATUSES = [
  'Pending Confirmation',
  'Scheduled',
  'Technician Assigned',
  'Work In Progress',
  'Completed',
  'Cancelled',
  'Rescheduled',
];
