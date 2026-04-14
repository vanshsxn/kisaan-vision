import {
  Droplets, Fish, Wind, MapPin, Sun, Plane,
  Thermometer, Building2, Shovel
} from "lucide-react";

export interface FarmingMethod {
  slug: string;
  title: string;
  subtitle: string;
  emoji: string;
  icon: any;
  heroImage: string;
  description: string;
  deepDescription: string[];
  features: { icon: string; title: string; description: string }[];
  vrDescription: string;
  sketchfabId?: string;
}

export const farmingMethods: FarmingMethod[] = [
  {
    slug: "hydroponics",
    title: "Hydroponics",
    subtitle: "Soil-less Farming",
    emoji: "💧",
    icon: Droplets,
    heroImage: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&q=80",
    description: "Growing plants in a nutrient-rich water solution instead of soil. It uses 90% less water and allows you to grow crops vertically in small spaces or indoor \"Plant Factories.\"",
    deepDescription: [
      "Hydroponics eliminates the need for soil entirely, replacing it with a carefully balanced nutrient solution that delivers essential minerals directly to plant roots. This method allows for precise control over every variable affecting plant growth — from pH levels to nutrient concentrations.",
      "Modern hydroponic systems range from simple Deep Water Culture (DWC) setups to sophisticated Nutrient Film Technique (NFT) systems. These can be deployed in urban environments, rooftops, basements, and even shipping containers, making fresh produce accessible anywhere.",
      "The environmental benefits are staggering: hydroponic farms use up to 90% less water than traditional agriculture, produce yields 3-10x higher per square foot, and eliminate the need for herbicides since there are no weeds. Crops grow 25-30% faster due to optimized nutrient delivery."
    ],
    features: [
      { icon: "💧", title: "90% Less Water", description: "Recirculating systems dramatically reduce water waste" },
      { icon: "📈", title: "10x Higher Yield", description: "Per square foot compared to traditional farming" },
      { icon: "🏙️", title: "Urban Friendly", description: "Grow anywhere — indoors, rooftops, containers" },
      { icon: "🌿", title: "No Herbicides", description: "Zero weeds means zero chemical herbicides needed" },
    ],
    vrDescription: "White PVC pipe structures with glowing blue water channels and LED grow lights illuminating rows of leafy greens.",
    sketchfabId: "b46083eb0138465fb63945497e471ebb",
  },
  {
    slug: "aquaponics",
    title: "Aquaponics",
    subtitle: "The Fish & Plant Loop",
    emoji: "🐟",
    icon: Fish,
    heroImage: "https://images.unsplash.com/photo-1524486361537-8ad15938e1a3?w=1200&q=80",
    description: "A circular ecosystem where you raise fish in tanks. The waste from the fish provides natural fertilizer for the plants, and the plants clean the water for the fish. It's a 100% organic, closed-loop system.",
    deepDescription: [
      "Aquaponics merges aquaculture (raising fish) with hydroponics (growing plants without soil) into a single, symbiotic ecosystem. Fish produce ammonia-rich waste, which beneficial bacteria convert into nitrates — the perfect plant food. In return, plant roots filter and purify the water before it cycles back to the fish.",
      "This closed-loop system is remarkably efficient. It uses 90% less water than conventional farming because water is continuously recycled. The system produces both protein (fish) and vegetables simultaneously, making it a complete food production system.",
      "Common fish species used include tilapia, catfish, trout, and ornamental koi. The plants thrive on the nutrient-rich water, growing faster than in traditional soil. Once established, an aquaponic system requires minimal inputs — just fish food and occasional water top-ups."
    ],
    features: [
      { icon: "♻️", title: "Closed-Loop System", description: "Zero waste — fish feed plants, plants clean water" },
      { icon: "🐟", title: "Dual Harvest", description: "Produce both fish protein and fresh vegetables" },
      { icon: "🌱", title: "100% Organic", description: "No synthetic fertilizers or chemicals needed" },
      { icon: "💧", title: "Water Efficient", description: "Uses 90% less water than traditional methods" },
    ],
    vrDescription: "Fish tanks with animated fish connected to lush grow beds via water channels.",
    sketchfabId: "5f7e0c3d32a24be7b5ebb96566bfca99",
  },
  {
    slug: "aeroponics",
    title: "Aeroponics",
    subtitle: "Misting the Roots",
    emoji: "🌬️",
    icon: Wind,
    heroImage: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&q=80",
    description: "Plants are suspended in the air, and their roots are sprayed with a high-nutrient mist. This allows plants to absorb more oxygen, making them grow significantly faster.",
    deepDescription: [
      "Aeroponics represents the most advanced form of soil-less agriculture. Plants are suspended in air within enclosed chambers, and their exposed roots are periodically misted with a nutrient-rich solution. This approach maximizes root oxygenation, which is the key driver of accelerated plant growth.",
      "NASA has extensively researched aeroponics for potential space farming applications. The technology uses 95% less water than traditional farming and 40% less than hydroponics. The misting intervals, nutrient concentrations, and environmental conditions can all be precisely computer-controlled.",
      "Aeroponic systems produce crops that grow up to 3x faster than soil-grown equivalents. The roots, fully exposed to air, develop more robust structures and absorb nutrients more efficiently. This method is particularly effective for root vegetables, herbs, and leafy greens."
    ],
    features: [
      { icon: "🚀", title: "3x Faster Growth", description: "Maximum oxygen exposure accelerates development" },
      { icon: "💧", title: "95% Less Water", description: "Fine misting uses minimal water resources" },
      { icon: "🧪", title: "NASA-Proven", description: "Researched for space agriculture applications" },
      { icon: "🚫", title: "No Soil Needed", description: "Completely eliminates soil-borne diseases" },
    ],
    vrDescription: "High-tech indoor lab with misting nozzles spraying fine mist on suspended plant roots under purple LED grow lights.",
    sketchfabId: "781053ef4b5a4c108e5d51f529e1e1c2",
  },
  {
    slug: "vra",
    title: "Variable Rate Application",
    subtitle: "VRA",
    emoji: "📍",
    icon: MapPin,
    heroImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80",
    description: "Using GPS and AI, tractors apply different amounts of fertilizer or seeds to different parts of a field. If one area is healthy, the machine uses less; if struggling, it uses more.",
    deepDescription: [
      "Variable Rate Application (VRA) is precision agriculture at its finest. Using GPS mapping, soil sensors, drone imagery, and AI analytics, VRA systems create detailed 'prescription maps' of an entire field. These maps identify exactly how much fertilizer, water, or seeds each specific zone needs.",
      "Smart tractors equipped with VRA technology read these prescription maps in real-time and automatically adjust their application rates as they move across the field. Areas with healthy soil receive less input, while struggling zones get more attention — optimizing every square meter.",
      "The economic and environmental impact is substantial. Farmers typically save 15-20% on input costs while achieving 10-15% higher yields. By applying only what's needed where it's needed, VRA dramatically reduces chemical runoff into waterways and minimizes the environmental footprint of farming."
    ],
    features: [
      { icon: "🛰️", title: "GPS Precision", description: "Centimeter-accurate field mapping and navigation" },
      { icon: "🤖", title: "AI-Driven", description: "Machine learning optimizes application rates" },
      { icon: "💰", title: "20% Cost Savings", description: "Reduce fertilizer and seed waste significantly" },
      { icon: "🌍", title: "Eco-Friendly", description: "Minimizes chemical runoff and pollution" },
    ],
    vrDescription: "Vast open field with a GPS-equipped tractor and colorful heat map overlay showing nutrient levels across the terrain.",
    sketchfabId: "8682e38b93f74c689f414a4b49d2c6da",
  },
  {
    slug: "agrivoltaics",
    title: "Agrivoltaics",
    subtitle: "Farming + Solar",
    emoji: "☀️",
    icon: Sun,
    heroImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
    description: "Installing solar panels high above the crops. The panels generate electricity while providing partial shade, reducing evaporation and protecting crops from heat stress.",
    deepDescription: [
      "Agrivoltaics is the innovative practice of co-locating solar energy production and agriculture on the same land. Solar panels are mounted 3-4 meters above the ground on elevated structures, allowing crops to grow underneath while generating clean electricity above.",
      "Research shows that certain crops actually perform better under partial shade. Leafy greens, herbs, and berries benefit from reduced heat stress and lower evaporation rates. The panels reduce ground temperature by 2-5°C, extending growing seasons and protecting sensitive crops during heat waves.",
      "For farmers, agrivoltaics creates a dual income stream: crop revenue plus solar energy sales. Studies indicate that land productivity increases by 60-70% when both uses are combined. The panels also collect rainwater for efficient redistribution to crops below."
    ],
    features: [
      { icon: "⚡", title: "Dual Income", description: "Earn from both crops and solar energy production" },
      { icon: "🌡️", title: "Heat Protection", description: "Reduces ground temperature by 2-5°C" },
      { icon: "📈", title: "70% More Productive", description: "Combined land use dramatically increases output" },
      { icon: "💧", title: "Less Evaporation", description: "Shade reduces water loss from soil" },
    ],
    vrDescription: "Agricultural field with rows of elevated solar panels casting geometric shadow patterns over thriving crops below.",
    sketchfabId: "c037c1cf06b34ce9b9ba25249958d6be",
  },
  {
    slug: "drones",
    title: "Drone-Assisted Farming",
    subtitle: "Seeding & Spraying",
    emoji: "🛩️",
    icon: Plane,
    heroImage: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&q=80",
    description: "Drones fly over large fields to bombard the soil with seed pods or spray fertilizer only on specific unhealthy spots detected by AI, covering hectares in minutes.",
    deepDescription: [
      "Agricultural drones are revolutionizing how farmers manage large-scale operations. Equipped with multispectral cameras, LiDAR sensors, and AI-powered image processing, these drones can survey hundreds of acres in hours, identifying crop stress, pest infestations, and nutrient deficiencies invisible to the naked eye.",
      "Precision spraying drones carry payloads of pesticides or fertilizers and apply them with surgical accuracy. Unlike traditional boom sprayers, drones target only the affected areas, reducing chemical usage by up to 90%. This spot-treatment approach saves money and drastically cuts environmental impact.",
      "Seeding drones are transforming reforestation and cover crop planting. They can launch seed pods into difficult terrain at rates of 100,000+ seeds per day. Some models use AI to determine optimal seed placement based on terrain analysis, soil type, and moisture levels."
    ],
    features: [
      { icon: "📸", title: "AI Imaging", description: "Multispectral cameras detect invisible crop stress" },
      { icon: "🎯", title: "Precision Spraying", description: "90% less chemicals with targeted application" },
      { icon: "⚡", title: "Lightning Fast", description: "Cover hundreds of acres in hours, not days" },
      { icon: "🌱", title: "Smart Seeding", description: "Plant 100,000+ seeds daily in any terrain" },
    ],
    vrDescription: "Aerial view following a drone flying over a lush plantation, spraying targeted areas highlighted in red.",
    sketchfabId: "add8fd8c2c364b1787e13ac9009e788f",
  },
  {
    slug: "greenhouse",
    title: "Greenhouse Automation",
    subtitle: "AI Climate Control",
    emoji: "🌡️",
    icon: Thermometer,
    heroImage: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80",
    description: "Using AI to control the climate inside a greenhouse. Motorized vents, fans, and LED grow lights automatically adjust based on weather to maintain the perfect growing season year-round.",
    deepDescription: [
      "Modern automated greenhouses are essentially giant computers that grow food. Hundreds of sensors continuously monitor temperature, humidity, CO₂ levels, light intensity, soil moisture, and nutrient concentrations. AI algorithms process this data in real-time to maintain optimal growing conditions 24/7.",
      "Actuators respond to AI commands: motorized roof vents open for ventilation, shade screens deploy during intense sunlight, heating systems activate on cold nights, and LED grow lights supplement natural light during cloudy periods. The result is a perfectly controlled microclimate regardless of external weather.",
      "The economic impact is remarkable. Automated greenhouses produce 10-12 harvests per year compared to 1-3 for open-field farming. Water usage drops by 80% through closed-loop irrigation. Labor costs decrease as robots handle planting, monitoring, and even harvesting in the most advanced facilities."
    ],
    features: [
      { icon: "🤖", title: "Full Automation", description: "AI manages climate, irrigation, and lighting" },
      { icon: "📊", title: "12 Harvests/Year", description: "Year-round production regardless of season" },
      { icon: "💧", title: "80% Water Savings", description: "Closed-loop systems minimize water waste" },
      { icon: "🌡️", title: "Perfect Climate", description: "Sensors maintain ideal growing conditions 24/7" },
    ],
    vrDescription: "Transparent glass dome greenhouse with automated vents, LED light arrays cycling through spectrums, and sensor dashboards.",
    sketchfabId: "75f4b19f15f74936bc5fef5f80aa4b80",
  },
  {
    slug: "vertical-farming",
    title: "Vertical Farming",
    subtitle: "Skyscraper Farms",
    emoji: "🏢",
    icon: Building2,
    heroImage: "https://images.unsplash.com/photo-1585500141024-4cbb94c23f12?w=1200&q=80",
    description: "Growing crops in stacked layers. Essential for urban farming near cities, reducing food travel distance (lowering carbon footprint) and maximizing every square inch of land.",
    deepDescription: [
      "Vertical farming takes agriculture to new heights — literally. By stacking growing layers from floor to ceiling in climate-controlled buildings, vertical farms can produce up to 390 times more food per square meter than traditional farmland. These facilities can operate anywhere: warehouses, skyscrapers, or purpose-built structures.",
      "Each layer is equipped with LED grow lights tuned to specific wavelengths that maximize photosynthesis while minimizing energy consumption. Automated nutrient delivery systems, climate control, and robotic harvesting work in concert to create a fully autonomous food production facility.",
      "The urban advantage is transformative. By locating farms inside or near cities, vertical farming eliminates thousands of food miles, delivering produce to consumers within hours of harvest. This hyper-local approach slashes transportation emissions, reduces food waste from spoilage, and provides food security for growing urban populations."
    ],
    features: [
      { icon: "🏗️", title: "390x More Yield", description: "Per square meter compared to traditional farms" },
      { icon: "🏙️", title: "Urban Integration", description: "Grow food right where people live and eat" },
      { icon: "🚛", title: "Zero Food Miles", description: "Eliminate transportation emissions entirely" },
      { icon: "🔄", title: "365 Days/Year", description: "Continuous production with no seasonal limits" },
    ],
    vrDescription: "Skyscraper interior with stacked growing layers under purple-pink LED lights, with robotic arms tending to crops.",
    sketchfabId: "d4e3f91ddb464e6aac1508991ae71a8d",
  },
  {
    slug: "regenerative-no-till",
    title: "Regenerative No-Till",
    subtitle: "Farming",
    emoji: "🌱",
    icon: Shovel,
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
    description: "Using specialized machines to plant seeds without plowing. This keeps the soil's natural microbiome healthy, traps carbon in the ground, and prevents soil erosion.",
    deepDescription: [
      "Regenerative no-till farming represents a paradigm shift back to working with nature rather than against it. By eliminating plowing and tilling, this approach preserves the soil's complex underground ecosystem — billions of microorganisms, fungi networks, and earthworms that naturally maintain soil health and fertility.",
      "Specialized no-till seed drills cut narrow slots in the soil surface, placing seeds at precise depths without disturbing the surrounding earth. Cover crops are planted between harvest seasons to protect soil from erosion, fix nitrogen, and build organic matter. The result is soil that actually improves year after year.",
      "The carbon sequestration potential is enormous. Healthy, undisturbed soil acts as a massive carbon sink, pulling CO₂ from the atmosphere and storing it underground. Studies show that no-till fields can sequester 0.5-1 ton of carbon per hectare per year while simultaneously reducing fuel costs by 50-70% since heavy plowing equipment is eliminated."
    ],
    features: [
      { icon: "🌍", title: "Carbon Capture", description: "Sequesters 0.5-1 ton CO₂ per hectare yearly" },
      { icon: "🦠", title: "Living Soil", description: "Preserves billions of beneficial microorganisms" },
      { icon: "⛽", title: "70% Less Fuel", description: "No heavy plowing equipment needed" },
      { icon: "🛡️", title: "Erosion Prevention", description: "Undisturbed soil resists wind and water erosion" },
    ],
    vrDescription: "Natural field with thick mulch cover, a specialized no-till seeder moving through, and visible healthy root structures.",
  },
];

export const getMethodBySlug = (slug: string) => farmingMethods.find(m => m.slug === slug);
