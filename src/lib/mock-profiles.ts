import { ProfileFeedCard } from "@/types/match";

export const MOCK_PROFILES: ProfileFeedCard[] = [
  {
    id: "user-1",
    fullName: "Nadia Larasati",
    age: 23,
    gender: "female",
    city: "Jakarta Selatan",
    distanceKm: 3,
    bio: "Product designer yang gampang bahagia kalau nemu kafe tenang dengan playlist indie pop yang enak.",
    selfieVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    ],
    interests: [
      { id: "coffee", label: "Ngopi Santai", icon: "☕" },
      { id: "music", label: "Musik Indie", icon: "🎵" },
      { id: "art", label: "Museum & Galeri", icon: "🎨" },
      { id: "books", label: "Buku", icon: "📚" },
    ],
    prompts: [
      {
        question: "Tempat kencan pertama idealku adalah...",
        answer: "Coffee shop di daerah Senopati atau Blok M yang outdoor-nya adem dan nggak terlalu bising.",
      },
      {
        question: "Hal yang bikin aku langsung tertarik saat ngobrol...",
        answer: "Orang yang passionate saat ceritain hobi atau hal random yang dia sukai.",
      },
    ],
  },
  {
    id: "user-2",
    fullName: "Rizky Ramadhan",
    age: 25,
    gender: "male",
    city: "Jakarta Selatan",
    distanceKm: 5,
    bio: "Software engineer yang suka eksplor kuliner malam dan main badminton di akhir pekan.",
    selfieVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
    ],
    interests: [
      { id: "badminton", label: "Badminton", icon: "🏸" },
      { id: "tech", label: "Teknologi", icon: "💻" },
      { id: "foodie", label: "Wisata Kuliner", icon: "🍕" },
      { id: "cinema", label: "Nonton Film", icon: "🎬" },
    ],
    prompts: [
      {
        question: "Kencan pertama yang santai menurutku...",
        answer: "Ketemu sore jam 4 di resto/kafe pilihanmu, ngobrol santai tanpa harus buru-buru.",
      },
    ],
  },
  {
    id: "user-3",
    fullName: "Clara Salsabila",
    age: 22,
    gender: "female",
    city: "Bandung (Dago)",
    distanceKm: 2,
    bio: "Mahasiswi tingkat akhir. Lebih suka ngobrol langsung sambil minum matcha daripada chatting berminggu-minggu.",
    selfieVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80",
    ],
    interests: [
      { id: "coffee", label: "Matcha & Kopi", icon: "🍵" },
      { id: "cinema", label: "Film A24 / Indie", icon: "🎬" },
      { id: "travel", label: "Road Trip", icon: "🚗" },
      { id: "pets", label: "Kucing", icon: "🐱" },
    ],
    prompts: [
      {
        question: "Aku yang menentukan tempat kencan karena...",
        answer: "Aku tahu persis kafe tersembunyi dengan tiramisu terbaik di kota ini! 🍰",
      },
    ],
  },
  {
    id: "user-4",
    fullName: "Dimas Anggara",
    age: 26,
    gender: "male",
    city: "Jakarta Pusat",
    distanceKm: 6,
    bio: "Fotografer & barista paruh waktu. Suka diskusi tentang fotografi analog dan jalan-jalan santai sore.",
    selfieVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    ],
    interests: [
      { id: "photography", label: "Fotografi Analog", icon: "📷" },
      { id: "coffee", label: "Manual Brew", icon: "☕" },
      { id: "travel", label: "Jalan Sore", icon: "🚶" },
    ],
    prompts: [
      {
        question: "Kamu pasti cocok denganku kalau...",
        answer: "Suka hunting foto jalanan atau nggak keberatan diajak keliling cari kopi enak.",
      },
    ],
  },
];
