// Demo mode planning engine - used when Gemini API key is not configured
// Generates realistic event plans based on event type and budget

const BUDGET_ALLOCATIONS = {
  Wedding: { Venue: 0.25, 'Food & Catering': 0.30, 'Decoration & Florals': 0.12, 'Photography & Video': 0.10, Entertainment: 0.05, Invitations: 0.02, Transportation: 0.04, 'Clothing & Accessories': 0.08, Miscellaneous: 0.04 },
  Birthday: { Venue: 0.20, 'Food & Catering': 0.30, Decoration: 0.15, 'Photography & Video': 0.10, Entertainment: 0.12, Invitations: 0.03, Transportation: 0.03, 'Cake & Desserts': 0.05, Miscellaneous: 0.02 },
  Anniversary: { Venue: 0.25, 'Food & Catering': 0.30, Decoration: 0.15, 'Photography & Video': 0.12, Entertainment: 0.08, Invitations: 0.02, Transportation: 0.04, Gifts: 0.02, Miscellaneous: 0.02 },
  Engagement: { Venue: 0.20, 'Food & Catering': 0.28, Decoration: 0.15, 'Photography & Video': 0.15, Entertainment: 0.05, Invitations: 0.03, Transportation: 0.04, 'Ring & Jewelry': 0.08, Miscellaneous: 0.02 },
  'Baby Shower': { Venue: 0.15, 'Food & Catering': 0.30, Decoration: 0.20, 'Photography & Video': 0.10, Entertainment: 0.08, Invitations: 0.05, Transportation: 0.03, Gifts: 0.06, Miscellaneous: 0.03 },
  'Community Event': { Venue: 0.30, 'Food & Catering': 0.25, Decoration: 0.10, 'Photography & Video': 0.08, Entertainment: 0.12, 'Printing & Banners': 0.05, Transportation: 0.05, 'Sound & Lighting': 0.03, Miscellaneous: 0.02 },
  'Festival Celebration': { Venue: 0.22, 'Food & Catering': 0.28, Decoration: 0.15, 'Photography & Video': 0.08, Entertainment: 0.12, Invitations: 0.03, Transportation: 0.05, 'Cultural Props': 0.04, Miscellaneous: 0.03 },
  Other: { Venue: 0.22, 'Food & Catering': 0.28, Decoration: 0.15, 'Photography & Video': 0.10, Entertainment: 0.10, Invitations: 0.03, Transportation: 0.05, Miscellaneous: 0.07 },
};

const THEMES = {
  Wedding: ['Royal Elegance', 'Garden Bliss', 'Rustic Charm', 'Beach Paradise', 'Traditional Kerala Thaali', 'Minimalist Modern', 'Bollywood Glamour'],
  Birthday: ['Starry Night', 'Tropical Paradise', 'Vintage Retro', 'Superhero Adventure', 'Floral Garden', 'Neon Glow', 'Royal Celebration'],
  Anniversary: ['Timeless Romance', 'Golden Memories', 'Garden Romance', 'Candlelit Elegance', 'Silver and White', 'Vintage Charm'],
  Engagement: ['Fairy Tale', 'Garden Party', 'Rooftop Romance', 'Floral Fantasy', 'Intimate Elegance'],
  'Baby Shower': ['Garden Whimsy', 'Pastel Dreams', 'Jungle Safari', 'Stars & Moon', 'Floral Boho'],
  'Community Event': ['Cultural Heritage', 'Modern Fest', 'Green & Sustainable', 'Unity Celebration', 'Festival of Colors'],
  'Festival Celebration': ['Traditional Splendor', 'Onam Harvest', 'Diwali Lights', 'Pongal Joy', 'Vishu Celebration'],
  Other: ['Classic Elegance', 'Modern Minimalist', 'Boho Chic', 'Garden Fresh', 'Urban Chic'],
};

const VENDORS = {
  Wedding: ['Venue / Banquet Hall', 'Catering Service', 'Photographer', 'Videographer', 'Decorator & Florist', 'Bridal Makeup Artist', 'Groom Styling', 'DJ / Live Band', 'Wedding Planner', 'Transportation', 'Invitation Designer', 'Mehendi Artist', 'Priest / Officiant'],
  Birthday: ['Venue / Party Hall', 'Caterer', 'Cake Baker', 'Photographer', 'Decorator', 'Entertainment / Anchor', 'DJ / Music', 'Return Gifts Supplier', 'Transportation'],
  Anniversary: ['Venue / Restaurant', 'Caterer', 'Photographer', 'Decorator', 'Florist', 'Entertainment', 'Transportation', 'Invitation Printer'],
  Engagement: ['Venue', 'Caterer', 'Photographer', 'Decorator', 'Florist', 'Makeup Artist', 'Jeweler', 'Transportation', 'Invitation Designer'],
  'Baby Shower': ['Venue / Home Decorator', 'Caterer', 'Cake Baker', 'Photographer', 'Decorator', 'Return Gifts Supplier'],
  'Community Event': ['Venue / Ground', 'Caterer', 'Stage & Sound', 'Photographer / Videographer', 'Decorator', 'Printing & Branding', 'Security', 'Transportation', 'Anchor / MC'],
  'Festival Celebration': ['Venue', 'Caterer', 'Decorator', 'Performer / Artist', 'Sound & Lighting', 'Photographer', 'Cultural Troupe'],
  Other: ['Venue', 'Caterer', 'Photographer', 'Decorator', 'Entertainment', 'Transportation'],
};

const CREATIVE_IDEAS = {
  themes: {
    Wedding: ['Traditional Kerala Thaali with banana leaf decor and flower mandapam', 'Garden wedding with marigold and jasmine floral arch', 'Royal palace theme with golden drapes and chandeliers', 'Minimalist white and green botanical theme', 'Rustic outdoor theme with fairy lights and wooden accents'],
    Birthday: ['Vintage Hollywood glamour with black, gold and white palette', 'Enchanted forest with fairy lights, moss and mushroom decor', 'Tropical Luau with palm leaves and bright colors', 'Bollywood dance party theme with colorful drapes', 'Pastel carnival theme with balloon installations'],
    default: ['Elegant floral with pastel tones', 'Modern minimalist with geometric accents', 'Boho chic with macrame and earth tones', 'Royal gold and purple luxury theme', 'Nature-inspired with greens and naturals'],
  },
  food: {
    Wedding: ['Traditional Kerala Sadhya on banana leaf', 'Live dosa and paratha counter', 'Biryani station with regional flavors', 'Chaat and street food corner', 'Dessert table with payasam and halwa'],
    Birthday: ['Themed birthday cake as centerpiece', 'Mini sliders and finger food station', 'DIY taco bar', 'Ice cream sundae bar', 'Mocktail station with fresh fruits'],
    default: ['Multi-cuisine buffet', 'Live cooking station', 'Regional specialty items', 'Mocktail and juice bar', 'Dessert and sweet counter'],
  },
  entertainment: {
    Wedding: ['Classical Mohiniyattam or Bharatanatyam performance', 'Live Carnatic music ensemble', 'Photo booth with traditional props', 'Couple game show with guests', 'Professional DJ for reception'],
    Birthday: ['Stand-up comedian or anchor', 'Live DJ with dance floor', 'Karaoke station', 'Interactive games and contests', 'Magician for kids or adults'],
    default: ['Live music performance', 'DJ and dance', 'Photo booth', 'Interactive games', 'Cultural performance'],
  },
};

function generateTimeline(eventDate, eventType) {
  const phases = [
    { label: '3 Months Before', daysOffset: -90, tasks: ['Finalize venue and book it', 'Set final budget and allocations', 'Shortlist and contact vendors', 'Decide on guest list', 'Choose event theme and color palette'] },
    { label: '2 Months Before', daysOffset: -60, tasks: ['Confirm catering and menu', 'Book photographer and videographer', 'Finalize decoration plan', 'Send save-the-date messages', 'Book transportation'] },
    { label: '1 Month Before', daysOffset: -30, tasks: ['Send formal invitations', 'Confirm guest count', 'Finalize all vendor contracts', 'Arrange accommodation if needed', 'Plan event day schedule'] },
    { label: '1 Week Before', daysOffset: -7, tasks: ['Confirm all vendors one final time', 'Prepare final payment schedule', 'Create event day timeline', 'Arrange event coordinator/MC', 'Pack and organize event materials'] },
    { label: 'Event Day', daysOffset: 0, tasks: ['Venue setup and decoration', 'Vendor setup and sound check', 'Guest reception and welcome', 'Main event program', 'Photography sessions', 'Thank guests and event wrap-up'] },
  ];

  const eventDateObj = eventDate ? new Date(eventDate) : null;

  return phases.map(phase => ({
    phase: phase.label,
    date: eventDateObj
      ? new Date(eventDateObj.getTime() + phase.daysOffset * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : null,
    tasks: phase.tasks.map(task => ({ text: task, completed: false })),
  }));
}

function generateBudgetBreakdown(budget, eventType, currency) {
  const allocations = BUDGET_ALLOCATIONS[eventType] || BUDGET_ALLOCATIONS.Other;
  const categories = Object.entries(allocations).map(([name, pct]) => ({
    name,
    percentage: Math.round(pct * 100),
    estimated: Math.round(budget * pct),
    currency,
  }));
  const total = categories.reduce((s, c) => s + c.estimated, 0);
  const diff = budget - total;
  if (diff !== 0 && categories.length > 0) {
    categories[categories.length - 1].estimated += diff;
  }
  return categories;
}

function generateVendorChecklist(eventType, budget) {
  const vendors = VENDORS[eventType] || VENDORS.Other;
  return vendors.map(name => ({
    id: `v_${Math.random().toString(36).substr(2, 9)}`,
    name,
    status: 'Not Started',
    estimatedCost: '',
    notes: '',
  }));
}

function generateCreativeIdeas(eventType, budget, location, guests, preferences) {
  const themes = CREATIVE_IDEAS.themes[eventType] || CREATIVE_IDEAS.themes.default;
  const food = CREATIVE_IDEAS.food[eventType] || CREATIVE_IDEAS.food.default;
  const entertainment = CREATIVE_IDEAS.entertainment[eventType] || CREATIVE_IDEAS.entertainment.default;

  const isKerala = location && (
    location.toLowerCase().includes('kerala') ||
    location.toLowerCase().includes('kochi') ||
    location.toLowerCase().includes('trivandrum') ||
    location.toLowerCase().includes('kozhikode') ||
    location.toLowerCase().includes('thrissur') ||
    location.toLowerCase().includes('calicut')
  );

  return {
    themes: themes.slice(0, 4),
    decoration: [
      'Fresh flower arrangements with local seasonal blooms',
      isKerala ? 'Traditional Pookalam (flower rangoli) at entrance' : 'Floral arch and backdrop for photo opportunities',
      'Themed table centerpieces matching the color palette',
      'Ambient fairy lights and candle arrangements',
      isKerala ? 'Brass lamp (Nilavilakku) as centerpiece decoration' : 'Balloon columns and decorative pillars',
    ],
    invitations: [
      `"Join us for a ${eventType} celebration filled with joy and memories."`,
      `"Your presence is the greatest gift. We warmly invite you to celebrate our ${eventType.toLowerCase()}."`,
      isKerala ? '"Namasthe! We joyfully request the honor of your presence at our celebration."' : '"Save the date and join us for an unforgettable celebration!"',
    ],
    food: food.slice(0, 4),
    entertainment: entertainment.slice(0, 4),
    photography: [
      'Candid storytelling photography of natural moments',
      'Drone aerial shots of venue and outdoor areas',
      'Dedicated couple/birthday person portrait session',
      'Photo booth with themed props for guests',
      'Same-day video highlight reel for social sharing',
    ],
    guestExperience: [
      'Welcome drink on arrival (coconut water, mocktails)',
      'Personalized return gifts for guests',
      'Guest book or digital memory wall',
      isKerala ? 'Traditional welcome with flower garland and lamp lighting' : 'Themed welcome activity',
      'Live social media wall displaying guest posts',
    ],
  };
}

export function generateDemoPlan(formData) {
  const { eventType, budget = 100000, currency = 'INR', eventDate, location, guests, preferences } = formData;
  const numBudget = parseFloat(budget) || 100000;
  const themeOptions = THEMES[eventType] || THEMES.Other;
  const selectedTheme = themeOptions[0];

  const isKerala = location && (
    location.toLowerCase().includes('kerala') ||
    location.toLowerCase().includes('kochi')
  );

  return {
    eventOverview: `Your ${eventType} event is planned for ${eventDate ? new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'the scheduled date'} at ${location || 'the chosen venue'}${guests ? ` for approximately ${guests} guests` : ''}. This plan has been thoughtfully designed to make your celebration memorable, elegant, and within your budget of ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(numBudget)}.${isKerala ? ' Kerala-inspired cultural elements have been incorporated to honor regional traditions.' : ''} ${preferences ? `Special preferences considered: ${preferences}.` : ''}`,
    theme: selectedTheme,
    budgetBreakdown: generateBudgetBreakdown(numBudget, eventType, currency || 'INR'),
    timeline: generateTimeline(eventDate, eventType),
    vendorChecklist: generateVendorChecklist(eventType, numBudget),
    creativeIdeas: generateCreativeIdeas(eventType, numBudget, location, guests, preferences),
  };
}
