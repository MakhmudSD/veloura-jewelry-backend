import * as mongoose from 'mongoose';
import { Schema, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// ─── Inline enums (avoids NestJS bootstrap cost) ─────────────────────────────
const MemberType   = { USER: 'USER', STORE: 'STORE', ADMIN: 'ADMIN' };
const MemberStatus = { ACTIVE: 'ACTIVE' };
const MemberAuthType = { PHONE: 'PHONE' };
const ProductCategory = { RING:'RING', NECKLACE:'NECKLACE', EARRINGS:'EARRINGS', BRACELET:'BRACELET', DIAMOND:'DIAMOND' };
const ProductLocation  = { SEOUL:'SEOUL', PARIS:'PARIS', TOKYO:'TOKYO', MILAN:'MILAN', NEWYORK:'NEWYORK' };
const ProductStatus   = { AVAILABLE: 'AVAILABLE' };
const ProductMaterial = { GOLD:'GOLD', ROSE_GOLD:'ROSE_GOLD', DIAMOND:'DIAMOND', PEARL:'PEARL', STERLING_SILVER:'STERLING_SILVER' };
const ProductGender   = { WOMEN:'WOMEN', MEN:'MEN' };
const BoardArticleCategory = { FREE:'FREE', RECOMMEND:'RECOMMEND' };
const BoardArticleStatus   = { ACTIVE:'ACTIVE' };
const ViewGroup = { PRODUCT:'PRODUCT', MEMBER:'MEMBER', ARTICLE:'ARTICLE' };

// ─── Schemas ─────────────────────────────────────────────────────────────────
const MemberSchema = new Schema({
  memberType:     { type: String, default: MemberType.USER },
  memberStatus:   { type: String, default: MemberStatus.ACTIVE },
  memberAuthType: { type: String, default: MemberAuthType.PHONE },
  memberPhone:    { type: String, required: true },
  memberNick:     { type: String, required: true },
  memberPassword: { type: String, required: true, select: false },
  memberFullName: String,
  memberImage:    { type: String, default: '' },
  memberAddress:  String,
  memberDesc:     String,
  memberProducts: { type: Number, default: 0 },
  memberArticles: { type: Number, default: 0 },
  memberFollowers:  { type: Number, default: 0 },
  memberFollowings: { type: Number, default: 0 },
  memberPoints:   { type: Number, default: 0 },
  memberLikes:    { type: Number, default: 0 },
  memberViews:    { type: Number, default: 0 },
  memberComments: { type: Number, default: 0 },
  memberRank:     { type: Number, default: 0 },
  memberWarnings: { type: Number, default: 0 },
  memberBlocks:   { type: Number, default: 0 },
  deletedAt:      Date,
}, { timestamps: true, collection: 'members' });
MemberSchema.index({ memberPhone: 1 }, { unique: true, sparse: true });
MemberSchema.index({ memberNick:  1 }, { unique: true, sparse: true });

const ProductSchema = new Schema({
  productCategory:  { type: String, required: true },
  productBrand:     String,
  productLocation:  { type: String, required: true },
  productStatus:    { type: String, default: ProductStatus.AVAILABLE },
  productColor:     String,
  productAdress:    String,
  productMaterial:  { type: String, required: true },
  productGender:    String,
  productTitle:     { type: String, required: true },
  productPrice:     { type: Number, required: true },
  productSize:      { type: Number, default: 0 },
  productStock:     { type: Number, default: 0 },
  productViews:     { type: Number, default: 0 },
  productLikes:     { type: Number, default: 0 },
  productComments:  { type: Number, default: 0 },
  productRank:      { type: Number, default: 0 },
  productImages:    { type: [String], required: true },
  productDesc:      { type: String, default: '' },
  productBarter:    { type: Boolean, default: false },
  productLimited:   { type: Boolean, default: false },
  productWeightUnit:{ type: Number, default: 0 },
  productOrigin:    String,
  memberId:  { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
  authorId:  { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
  soldAt:    Date,
  deletedAt: Date,
}, { timestamps: true, collection: 'products' });
ProductSchema.index({ productCategory:1, productLocation:1, productTitle:1, productPrice:1 }, { unique: true });

const BoardArticleSchema = new Schema({
  articleCategory: { type: String, required: true },
  articleStatus:   { type: String, default: BoardArticleStatus.ACTIVE },
  articleTitle:    { type: String, required: true },
  articleContent:  { type: String, required: true },
  articleImage:    String,
  articleLikes:    { type: Number, default: 0 },
  articleViews:    { type: Number, default: 0 },
  articleComments: { type: Number, default: 0 },
  memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
  authorId: { type: Schema.Types.ObjectId, ref: 'Member' },
}, { timestamps: true, collection: 'boardArticles' });

const LikeSchema = new Schema({
  likeGroup: { type: String, required: true },
  likeRefId: { type: Schema.Types.ObjectId, required: true },
  memberId:  { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
}, { timestamps: true, collection: 'likes' });
LikeSchema.index({ memberId: 1, likeRefId: 1 }, { unique: true });

const ViewSchema = new Schema({
  viewGroup: { type: String, required: true },
  viewRefId: { type: Schema.Types.ObjectId, required: true },
  memberId:  { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
}, { timestamps: true, collection: 'views' });
ViewSchema.index({ memberId: 1, viewRefId: 1 }, { unique: true });

// ─── Models ───────────────────────────────────────────────────────────────────
const Member      = mongoose.model('Member',       MemberSchema);
const Product     = mongoose.model('Product',      ProductSchema);
const BoardArticle= mongoose.model('BoardArticle', BoardArticleSchema);
const Like        = mongoose.model('Like',         LikeSchema);
const View        = mongoose.model('View',         ViewSchema);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];
const hash = (pw: string) => bcrypt.hashSync(pw, 10);

// ─── Seed data ───────────────────────────────────────────────────────────────
const JEWELRY_IMAGES = [
  '/img/products/cartier1.jpeg',
  '/img/products/cartier2.jpeg',
  '/img/products/cartier3.jpeg',
  '/img/products/cartier4.jpeg',
  '/img/products/cartier5.jpeg',
  '/img/products/cartier7.jpeg',
  '/img/products/cartier8.jpeg',
  '/img/products/bvlgari10.jpeg',
  '/img/products/bvlgari11.jpeg',
  '/img/products/bvlgari12.jpeg',
  '/img/products/bvlgari13.jpeg',
  '/img/products/bvlgari14.jpeg',
  '/img/products/tiffany1.jpeg',
  '/img/products/tiffany2.jpeg',
  '/img/products/tiffany3.jpeg',
  '/img/products/tiffany4.jpeg',
  '/img/products/missoma1.jpeg',
  '/img/products/missoma2.jpeg',
  '/img/products/missoma3.jpeg',
  '/img/products/vc1.jpeg',
  '/img/products/vc2.jpeg',
  '/img/products/vc3.jpeg',
  '/img/products/gs.jpeg',
  '/img/products/gs2.jpeg',
  '/img/products/gs3.jpeg',
];

const BRANDS = ['Cartier', 'Bvlgari', 'Tiffany', 'Pandora', 'Swarovski'];

const STORE_DATA = [
  {
    memberNick: 'SeoulGoldHouse',
    memberFullName: '서울 골드하우스',
    memberPhone: '+82-10-1234-5001',
    memberImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    memberAddress: '서울특별시 종로구 인사동길 12',
    memberDesc: 'Premium gold and diamond jewelry from the heart of Seoul.',
  },
  {
    memberNick: 'MilanJewelAtelier',
    memberFullName: '밀란 쥬얼 아뜰리에',
    memberPhone: '+82-10-2345-5002',
    memberImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    memberAddress: '서울특별시 강남구 도산대로 98',
    memberDesc: 'Luxury Italian-inspired jewelry crafted with European elegance.',
  },
  {
    memberNick: 'ParisRoséBijoux',
    memberFullName: '파리 로제 비주',
    memberPhone: '+82-10-3456-5003',
    memberImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    memberAddress: '서울특별시 마포구 홍익로 27',
    memberDesc: 'Rose gold and pearl collections inspired by Parisian couture.',
  },
];

const USER_DATA = [
  { memberNick: 'MinjiKim92',      memberPhone: '+82-10-9001-1001', memberImage: 'https://randomuser.me/api/portraits/women/12.jpg' },
  { memberNick: 'JunhoLee_style', memberPhone: '+82-10-9002-1002', memberImage: 'https://randomuser.me/api/portraits/men/15.jpg' },
  { memberNick: 'Yejin_Jewelry',  memberPhone: '+82-10-9003-1003', memberImage: 'https://randomuser.me/api/portraits/women/29.jpg' },
  { memberNick: 'SeohoChoi88',    memberPhone: '+82-10-9004-1004', memberImage: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { memberNick: 'HaraOh_Seoul',   memberPhone: '+82-10-9005-1005', memberImage: 'https://randomuser.me/api/portraits/women/55.jpg' },
];

// 25 products: 8 RING, 6 NECKLACE, 5 EARRINGS, 4 BRACELET, 2 DIAMOND
const PRODUCT_BLUEPRINTS = [
  // RING × 8
  { title: 'Eternal Rose Gold Band',     cat: 'RING',     mat: 'ROSE_GOLD',      loc: 'SEOUL',   brand: 'Cartier',    price: 890000,  gender: 'WOMEN', desc: 'Timeless rose gold band with micro-pavé diamond setting.' },
  { title: 'Solitaire Diamond Ring',     cat: 'RING',     mat: 'GOLD',           loc: 'PARIS',   brand: 'Tiffany',    price: 2500000, gender: 'WOMEN', desc: 'Classic 18k gold solitaire ring with 0.5ct diamond.' },
  { title: 'Men\'s Signet Ring',         cat: 'RING',     mat: 'GOLD',           loc: 'MILAN',   brand: 'Bvlgari',    price: 1200000, gender: 'MEN',   desc: 'Bold gold signet ring engraved with artisan motifs.' },
  { title: 'Pearl Floral Ring',          cat: 'RING',     mat: 'STERLING_SILVER',loc: 'TOKYO',   brand: 'Pandora',    price: 320000,  gender: 'WOMEN', desc: 'Delicate floral sterling silver ring with freshwater pearl center.' },
  { title: 'Diamond Eternity Band',      cat: 'RING',     mat: 'DIAMOND',        loc: 'NEWYORK', brand: 'Tiffany',    price: 2800000, gender: 'WOMEN', desc: 'Full-channel set diamond eternity band in platinum.' },
  { title: 'Rose Gold Twist Ring',       cat: 'RING',     mat: 'ROSE_GOLD',      loc: 'PARIS',   brand: 'Pandora',    price: 450000,  gender: 'WOMEN', desc: 'Modern twisted rose gold band with brushed finish.' },
  { title: 'Hammered Gold Band',         cat: 'RING',     mat: 'GOLD',           loc: 'SEOUL',   brand: 'Swarovski',  price: 680000,  gender: 'MEN',   desc: 'Artisan hammered 18k yellow gold band, unisex design.' },
  { title: 'Sapphire Halo Ring',         cat: 'RING',     mat: 'GOLD',           loc: 'MILAN',   brand: 'Bvlgari',    price: 1950000, gender: 'WOMEN', desc: 'Blue sapphire center stone surrounded by a halo of white diamonds.' },
  // NECKLACE × 6
  { title: 'Layered Pearl Necklace',     cat: 'NECKLACE', mat: 'PEARL',          loc: 'TOKYO',   brand: 'Pandora',    price: 560000,  gender: 'WOMEN', desc: 'Three-strand layered Akoya pearl necklace with gold clasp.' },
  { title: 'Gold Bar Pendant',           cat: 'NECKLACE', mat: 'GOLD',           loc: 'SEOUL',   brand: 'Cartier',    price: 780000,  gender: 'WOMEN', desc: 'Minimalist 14k gold bar pendant on a delicate chain.' },
  { title: 'Diamond Rivière Necklace',   cat: 'NECKLACE', mat: 'DIAMOND',        loc: 'NEWYORK', brand: 'Tiffany',    price: 2650000, gender: 'WOMEN', desc: 'Graduated diamond rivière necklace in 18k white gold.' },
  { title: 'Rose Gold Heart Necklace',   cat: 'NECKLACE', mat: 'ROSE_GOLD',      loc: 'PARIS',   brand: 'Swarovski',  price: 390000,  gender: 'WOMEN', desc: 'Open heart pendant in 14k rose gold on a 45cm chain.' },
  { title: 'Men\'s Cuban Link Chain',    cat: 'NECKLACE', mat: 'GOLD',           loc: 'MILAN',   brand: 'Bvlgari',    price: 1450000, gender: 'MEN',   desc: 'Heavy-gauge 18k gold Cuban link chain, 50cm length.' },
  { title: 'Sterling Silver Moon Charm', cat: 'NECKLACE', mat: 'STERLING_SILVER',loc: 'SEOUL',   brand: 'Pandora',    price: 210000,  gender: 'WOMEN', desc: 'Crescent moon charm pendant in sterling silver with cubic zirconia.' },
  // EARRINGS × 5
  { title: 'Diamond Stud Earrings',      cat: 'EARRINGS', mat: 'DIAMOND',        loc: 'NEWYORK', brand: 'Tiffany',    price: 1800000, gender: 'WOMEN', desc: 'Classic round brilliant diamond studs in 18k white gold prong setting.' },
  { title: 'Pearl Drop Earrings',        cat: 'EARRINGS', mat: 'PEARL',          loc: 'TOKYO',   brand: 'Pandora',    price: 480000,  gender: 'WOMEN', desc: 'Lustrous South Sea pearl drop earrings with gold leverback.' },
  { title: 'Rose Gold Huggie Hoops',     cat: 'EARRINGS', mat: 'ROSE_GOLD',      loc: 'PARIS',   brand: 'Cartier',    price: 620000,  gender: 'WOMEN', desc: 'Pavé diamond huggie hoop earrings in 14k rose gold.' },
  { title: 'Gold Geometric Ear Cuffs',   cat: 'EARRINGS', mat: 'GOLD',           loc: 'MILAN',   brand: 'Bvlgari',    price: 340000,  gender: 'WOMEN', desc: 'Bold geometric ear cuffs in 18k yellow gold, no piercing needed.' },
  { title: 'Crystal Chandelier Earrings',cat: 'EARRINGS', mat: 'STERLING_SILVER',loc: 'SEOUL',   brand: 'Swarovski',  price: 290000,  gender: 'WOMEN', desc: 'Multi-tier crystal chandelier earrings with sterling silver hooks.' },
  // BRACELET × 4
  { title: 'Tennis Diamond Bracelet',    cat: 'BRACELET', mat: 'DIAMOND',        loc: 'NEWYORK', brand: 'Tiffany',    price: 2750000, gender: 'WOMEN', desc: 'Classic 4-prong tennis bracelet with 3.5ct total weight diamonds.' },
  { title: 'Gold Charm Bracelet',        cat: 'BRACELET', mat: 'GOLD',           loc: 'PARIS',   brand: 'Cartier',    price: 980000,  gender: 'WOMEN', desc: '18k yellow gold link bracelet with removable heart charm.' },
  { title: 'Rose Gold Bangle',           cat: 'BRACELET', mat: 'ROSE_GOLD',      loc: 'SEOUL',   brand: 'Pandora',    price: 430000,  gender: 'WOMEN', desc: 'Thin stackable 14k rose gold bangle, perfect for layering.' },
  { title: 'Pearl Strand Bracelet',      cat: 'BRACELET', mat: 'PEARL',          loc: 'TOKYO',   brand: 'Swarovski',  price: 370000,  gender: 'WOMEN', desc: 'Single-strand freshwater pearl bracelet with gold-filled clasp.' },
  // DIAMOND × 2
  { title: 'Loose Princess Cut Diamond', cat: 'DIAMOND',  mat: 'DIAMOND',        loc: 'MILAN',   brand: 'Cartier',    price: 2200000, gender: 'WOMEN', desc: '1.2ct GIA-certified princess cut diamond, VS1 clarity, F color.' },
  { title: 'Pear Shape Diamond Solitaire',cat:'DIAMOND',  mat: 'DIAMOND',        loc: 'PARIS',   brand: 'Bvlgari',    price: 1950000, gender: 'WOMEN', desc: '0.9ct pear shape diamond in polished platinum four-claw setting.' },
];

const ARTICLES = [
  { title: 'How to Choose Your First Gold Ring',       cat: 'FREE',      content: 'Buying your first gold ring can be overwhelming. Here\'s a guide covering karat purity, hallmarks, ring sizing tips, and what to look for in craftsmanship when shopping at a jewelry boutique.' },
  { title: 'Top 5 Jewelry Trends for This Season',    cat: 'RECOMMEND', content: 'From chunky gold chains to delicate pearl drops — this season\'s hottest jewelry looks are all about mixing textures and layering metals. We break down each trend with styling suggestions.' },
  { title: 'Pearl Care 101: Keep Your Pearls Lustrous',cat: 'FREE',      content: 'Pearls are organic gems that require gentle care. Store them separately in a soft pouch, wipe with a damp cloth after wearing, and keep them away from perfume and hairspray to preserve their natural luster.' },
  { title: 'Cartier vs Bvlgari: Which Brand is Right for You?', cat:'RECOMMEND', content: 'Both Cartier and Bvlgari represent the pinnacle of luxury jewelry. This comparison covers their signature collections, price ranges, craftsmanship philosophy, and resale value to help you decide.' },
  { title: 'Diamond Grading Explained: The 4 Cs',     cat: 'FREE',      content: 'Cut, Color, Clarity, and Carat weight — understanding the 4Cs is essential before purchasing any diamond jewelry. This beginner-friendly breakdown includes what each grade means for appearance and value.' },
  { title: 'Rose Gold: Why It\'s More Than a Trend',  cat: 'RECOMMEND', content: 'Rose gold has proven it\'s here to stay. We explore its metallurgical composition, how it\'s created by alloying yellow gold with copper, why it complements warm skin tones, and the best rose gold pieces to invest in.' },
  { title: 'Best Jewelry Gifts for Every Budget',     cat: 'FREE',      content: 'From ₩150,000 sterling silver charms to ₩2,500,000 diamond pendants — we\'ve curated the perfect jewelry gifts across five price points so every celebration can be made memorable.' },
  { title: 'The History of Korean Jewelry Craftsmanship', cat:'RECOMMEND', content: 'Korean gold and jade jewelry has a rich history stretching back to the Three Kingdoms period. Discover how traditional techniques like nuigeum (granulation) and twisted wire work influence contemporary Korean jewelry designers.' },
  { title: 'How to Clean Sterling Silver at Home',    cat: 'FREE',      content: 'Sterling silver tarnishes naturally over time, but cleaning it at home is easy. We cover three methods: baking soda paste, aluminum foil bath, and commercial silver polish — with tips on preventing future tarnish.' },
  { title: 'Investment Jewelry: Pieces That Hold Value', cat:'RECOMMEND', content: 'Not all jewelry appreciates in value, but some pieces — particularly signed vintage Cartier, Bvlgari Serpenti, and high-clarity diamonds — have consistently outperformed inflation. Here\'s what to look for when buying jewelry as an investment.' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGO_PROD;
  if (!uri) throw new Error('MONGO_PROD is not set in .env');

  console.log('Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('Connected.\n');

  // ── 1. Clear existing seed data (idempotent re-run) ──────────────────────
  const existingNicks = [
    ...STORE_DATA.map(s => s.memberNick),
    ...USER_DATA.map(u => u.memberNick),
  ];
  const oldMembers = await Member.find({ memberNick: { $in: existingNicks } }).select('_id');
  const oldIds = oldMembers.map(m => m._id);

  if (oldIds.length) {
    await Product.deleteMany({ memberId: { $in: oldIds } });
    await BoardArticle.deleteMany({ memberId: { $in: oldIds } });
    await Like.deleteMany({ memberId: { $in: oldIds } });
    await View.deleteMany({ memberId: { $in: oldIds } });
    await Member.deleteMany({ _id: { $in: oldIds } });
    console.log(`Cleared ${oldIds.length} existing seed members and their data.\n`);
  }

  // ── 2. Create STORE members ───────────────────────────────────────────────
  console.log('Creating 3 STORE members…');
  const storeMembers = await Member.insertMany(
    STORE_DATA.map(s => ({
      ...s,
      memberType: MemberType.STORE,
      memberStatus: MemberStatus.ACTIVE,
      memberAuthType: MemberAuthType.PHONE,
      memberPassword: hash('Store@12345'),
      memberRank: rand(3, 8),
    }))
  );
  console.log(`  ✓ ${storeMembers.length} stores created`);

  // ── 3. Create USER members ────────────────────────────────────────────────
  console.log('Creating 5 USER members…');
  const userMembers = await Member.insertMany(
    USER_DATA.map(u => ({
      ...u,
      memberType: MemberType.USER,
      memberStatus: MemberStatus.ACTIVE,
      memberAuthType: MemberAuthType.PHONE,
      memberPassword: hash('User@12345'),
    }))
  );
  console.log(`  ✓ ${userMembers.length} users created`);

  // ── 4. Create Products ────────────────────────────────────────────────────
  console.log('Creating 25 products…');
  const productDocs = PRODUCT_BLUEPRINTS.map((bp, i) => {
    const store = storeMembers[i % storeMembers.length];
    const imgA = JEWELRY_IMAGES[i % JEWELRY_IMAGES.length];
    const imgB = JEWELRY_IMAGES[(i + 1) % JEWELRY_IMAGES.length];
    return {
      productCategory:  bp.cat,
      productBrand:     bp.brand,
      productLocation:  bp.loc,
      productMaterial:  bp.mat,
      productGender:    bp.gender,
      productTitle:     bp.title,
      productPrice:     bp.price,
      productStock:     rand(3, 20),
      productSize:      bp.cat === 'RING' ? rand(5, 12) : 0,
      productWeightUnit:parseFloat((Math.random() * 15 + 2).toFixed(1)),
      productImages:    [imgA, imgB],
      productDesc:      bp.desc,
      productBarter:    Math.random() < 0.2,
      productLimited:   Math.random() < 0.3,
      productOrigin:    bp.loc,
      productViews:     rand(0, 120),
      productLikes:     rand(0, 40),
      productRank:      rand(0, 5),
      memberId:  store._id,
      authorId:  store._id,
    };
  });
  const products = await Product.insertMany(productDocs);
  console.log(`  ✓ ${products.length} products created`);

  // Update store memberProducts counts
  for (const store of storeMembers) {
    const count = products.filter(p => p.memberId.toString() === store._id.toString()).length;
    await Member.updateOne({ _id: store._id }, { memberProducts: count });
  }

  // ── 5. Create Board Articles ──────────────────────────────────────────────
  console.log('Creating 10 board articles…');
  const allMembers = [...storeMembers, ...userMembers];
  const articleDocs = ARTICLES.map((a, i) => {
    const author = allMembers[i % allMembers.length];
    return {
      articleCategory: a.cat,
      articleTitle:    a.title,
      articleContent:  a.content,
      articleImage:    JEWELRY_IMAGES[i % JEWELRY_IMAGES.length],
      articleViews:    rand(10, 300),
      articleLikes:    rand(0, 80),
      memberId:  author._id,
      authorId:  author._id,
    };
  });
  const articles = await BoardArticle.insertMany(articleDocs);
  console.log(`  ✓ ${articles.length} articles created`);

  // ── 6. Create Likes ───────────────────────────────────────────────────────
  console.log('Creating likes across products…');
  const likeDocs: any[] = [];
  const likeSet = new Set<string>();
  for (const user of userMembers) {
    const targetProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, rand(3, 8));
    for (const product of targetProducts) {
      const key = `${user._id}-${product._id}`;
      if (!likeSet.has(key)) {
        likeSet.add(key);
        likeDocs.push({
          likeGroup: ViewGroup.PRODUCT,
          likeRefId: product._id,
          memberId:  user._id,
        });
      }
    }
  }
  const likes = await Like.insertMany(likeDocs);
  console.log(`  ✓ ${likes.length} likes created`);

  // Sync productLikes counts
  for (const product of products) {
    const count = likeDocs.filter(l => l.likeRefId.toString() === product._id.toString()).length;
    if (count > 0) await Product.updateOne({ _id: product._id }, { productLikes: count });
  }

  // ── 7. Create Views ───────────────────────────────────────────────────────
  console.log('Creating views across products…');
  const viewDocs: any[] = [];
  const viewSet = new Set<string>();
  for (const user of [...userMembers, ...storeMembers]) {
    const targetProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, rand(5, 12));
    for (const product of targetProducts) {
      const key = `${user._id}-${product._id}`;
      if (!viewSet.has(key)) {
        viewSet.add(key);
        viewDocs.push({
          viewGroup: ViewGroup.PRODUCT,
          viewRefId: product._id,
          memberId:  user._id,
        });
      }
    }
  }
  const views = await View.insertMany(viewDocs);
  console.log(`  ✓ ${views.length} views created`);

  // Sync productViews counts
  for (const product of products) {
    const count = viewDocs.filter(v => v.viewRefId.toString() === product._id.toString()).length;
    if (count > 0) await Product.updateOne({ _id: product._id }, { productViews: count });
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════');
  console.log('  SEED COMPLETE — Documents inserted');
  console.log('════════════════════════════════════');
  console.log(`  Members (STORE) : ${storeMembers.length}`);
  console.log(`  Members (USER)  : ${userMembers.length}`);
  console.log(`  Products        : ${products.length}`);
  console.log(`    ↳ RING        : ${products.filter(p=>p.productCategory==='RING').length}`);
  console.log(`    ↳ NECKLACE    : ${products.filter(p=>p.productCategory==='NECKLACE').length}`);
  console.log(`    ↳ EARRINGS    : ${products.filter(p=>p.productCategory==='EARRINGS').length}`);
  console.log(`    ↳ BRACELET    : ${products.filter(p=>p.productCategory==='BRACELET').length}`);
  console.log(`    ↳ DIAMOND     : ${products.filter(p=>p.productCategory==='DIAMOND').length}`);
  console.log(`  Board Articles  : ${articles.length}`);
  console.log(`  Likes           : ${likes.length}`);
  console.log(`  Views           : ${views.length}`);
  console.log('════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
