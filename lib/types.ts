// The structured data Claude extracts from a business, used to build the demo site + proposal.
export interface Service {
  name: string;
  description: string;
  price?: string;
}

export interface BusinessData {
  name: string;
  type: string; // gym, restaurant, salon, shop, etc.
  tagline: string;
  vibe: string; // e.g. "modern", "luxury", "cozy", "energetic"
  primary_color: string; // hex
  accent_color: string; // hex
  about: string;
  services: Service[];
  highlights: string[]; // short feature bullets
  location: {
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
  };
  socials?: { label: string; url: string }[];
}

export interface GenerationResult {
  business: BusinessData;
  critique: string; // why their current presence is losing them customers
  proposal_email: {
    subject: string;
    body: string;
  };
}
