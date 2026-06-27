import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const rawUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const urlForAdapter = rawUrl.startsWith("file:./")
  ? `file:${path.resolve(process.cwd(), rawUrl.slice(7))}`
  : rawUrl;

const adapter = new PrismaBetterSqlite3({ url: urlForAdapter });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const REGIONS: Array<{
  nameDe: string;
  nameEn: string;
  nameTh: string;
  slug: string;
  provinces: Array<{ nameDe: string; nameEn: string; nameTh: string; slug: string }>;
}> = [
  {
    nameDe: "Nordthailand",
    nameEn: "Northern Thailand",
    nameTh: "ภาคเหนือ",
    slug: "nordthailand",
    provinces: [
      { nameDe: "Chiang Mai", nameEn: "Chiang Mai", nameTh: "เชียงใหม่", slug: "chiang-mai" },
      { nameDe: "Chiang Rai", nameEn: "Chiang Rai", nameTh: "เชียงราย", slug: "chiang-rai" },
      { nameDe: "Mae Hong Son", nameEn: "Mae Hong Son", nameTh: "แม่ฮ่องสอน", slug: "mae-hong-son" },
      { nameDe: "Nan", nameEn: "Nan", nameTh: "น่าน", slug: "nan" },
      { nameDe: "Phayao", nameEn: "Phayao", nameTh: "พะเยา", slug: "phayao" },
      { nameDe: "Phrae", nameEn: "Phrae", nameTh: "แพร่", slug: "phrae" },
      { nameDe: "Lampang", nameEn: "Lampang", nameTh: "ลำปาง", slug: "lampang" },
      { nameDe: "Lamphun", nameEn: "Lamphun", nameTh: "ลำพูน", slug: "lamphun" },
      { nameDe: "Uttaradit", nameEn: "Uttaradit", nameTh: "อุตรดิตถ์", slug: "uttaradit" },
    ],
  },
  {
    nameDe: "Nordostthailand (Isan)",
    nameEn: "Northeastern Thailand (Isan)",
    nameTh: "ภาคตะวันออกเฉียงเหนือ",
    slug: "nordostthailand-isan",
    provinces: [
      { nameDe: "Khon Kaen", nameEn: "Khon Kaen", nameTh: "ขอนแก่น", slug: "khon-kaen" },
      { nameDe: "Udon Thani", nameEn: "Udon Thani", nameTh: "อุดรธานี", slug: "udon-thani" },
      { nameDe: "Nong Khai", nameEn: "Nong Khai", nameTh: "หนองคาย", slug: "nong-khai" },
      { nameDe: "Nakhon Ratchasima", nameEn: "Nakhon Ratchasima", nameTh: "นครราชสีมา", slug: "nakhon-ratchasima" },
      { nameDe: "Ubon Ratchathani", nameEn: "Ubon Ratchathani", nameTh: "อุบลราชธานี", slug: "ubon-ratchathani" },
      { nameDe: "Roi Et", nameEn: "Roi Et", nameTh: "ร้อยเอ็ด", slug: "roi-et" },
      { nameDe: "Maha Sarakham", nameEn: "Maha Sarakham", nameTh: "มหาสารคาม", slug: "maha-sarakham" },
      { nameDe: "Kalasin", nameEn: "Kalasin", nameTh: "กาฬสินธุ์", slug: "kalasin" },
      { nameDe: "Sakon Nakhon", nameEn: "Sakon Nakhon", nameTh: "สกลนคร", slug: "sakon-nakhon" },
      { nameDe: "Nakhon Phanom", nameEn: "Nakhon Phanom", nameTh: "นครพนม", slug: "nakhon-phanom" },
      { nameDe: "Mukdahan", nameEn: "Mukdahan", nameTh: "มุกดาหาร", slug: "mukdahan" },
      { nameDe: "Loei", nameEn: "Loei", nameTh: "เลย", slug: "loei" },
      { nameDe: "Nong Bua Lam Phu", nameEn: "Nong Bua Lam Phu", nameTh: "หนองบัวลำภู", slug: "nong-bua-lam-phu" },
      { nameDe: "Bueng Kan", nameEn: "Bueng Kan", nameTh: "บึงกาฬ", slug: "bueng-kan" },
      { nameDe: "Chaiyaphum", nameEn: "Chaiyaphum", nameTh: "ชัยภูมิ", slug: "chaiyaphum" },
      { nameDe: "Buri Ram", nameEn: "Buri Ram", nameTh: "บุรีรัมย์", slug: "buri-ram" },
      { nameDe: "Surin", nameEn: "Surin", nameTh: "สุรินทร์", slug: "surin" },
      { nameDe: "Si Sa Ket", nameEn: "Si Sa Ket", nameTh: "ศรีสะเกษ", slug: "si-sa-ket" },
      { nameDe: "Amnat Charoen", nameEn: "Amnat Charoen", nameTh: "อำนาจเจริญ", slug: "amnat-charoen" },
      { nameDe: "Yasothon", nameEn: "Yasothon", nameTh: "ยโสธร", slug: "yasothon" },
    ],
  },
  {
    nameDe: "Zentralthailand",
    nameEn: "Central Thailand",
    nameTh: "ภาคกลาง",
    slug: "zentralthailand",
    provinces: [
      { nameDe: "Bangkok", nameEn: "Bangkok", nameTh: "กรุงเทพมหานคร", slug: "bangkok" },
      { nameDe: "Nonthaburi", nameEn: "Nonthaburi", nameTh: "นนทบุรี", slug: "nonthaburi" },
      { nameDe: "Pathum Thani", nameEn: "Pathum Thani", nameTh: "ปทุมธานี", slug: "pathum-thani" },
      { nameDe: "Samut Prakan", nameEn: "Samut Prakan", nameTh: "สมุทรปราการ", slug: "samut-prakan" },
      { nameDe: "Ayutthaya", nameEn: "Phra Nakhon Si Ayutthaya", nameTh: "พระนครศรีอยุธยา", slug: "ayutthaya" },
      { nameDe: "Ang Thong", nameEn: "Ang Thong", nameTh: "อ่างทอง", slug: "ang-thong" },
      { nameDe: "Sing Buri", nameEn: "Sing Buri", nameTh: "สิงห์บุรี", slug: "sing-buri" },
      { nameDe: "Chainat", nameEn: "Chai Nat", nameTh: "ชัยนาท", slug: "chainat" },
      { nameDe: "Lopburi", nameEn: "Lop Buri", nameTh: "ลพบุรี", slug: "lopburi" },
      { nameDe: "Saraburi", nameEn: "Saraburi", nameTh: "สระบุรี", slug: "saraburi" },
      { nameDe: "Nakhon Nayok", nameEn: "Nakhon Nayok", nameTh: "นครนายก", slug: "nakhon-nayok" },
      { nameDe: "Prachin Buri", nameEn: "Prachin Buri", nameTh: "ปราจีนบุรี", slug: "prachin-buri" },
      { nameDe: "Suphan Buri", nameEn: "Suphan Buri", nameTh: "สุพรรณบุรี", slug: "suphan-buri" },
      { nameDe: "Nakhon Pathom", nameEn: "Nakhon Pathom", nameTh: "นครปฐม", slug: "nakhon-pathom" },
      { nameDe: "Samut Sakhon", nameEn: "Samut Sakhon", nameTh: "สมุทรสาคร", slug: "samut-sakhon" },
      { nameDe: "Samut Songkhram", nameEn: "Samut Songkhram", nameTh: "สมุทรสงคราม", slug: "samut-songkhram" },
      { nameDe: "Kanchanaburi", nameEn: "Kanchanaburi", nameTh: "กาญจนบุรี", slug: "kanchanaburi" },
      { nameDe: "Ratchaburi", nameEn: "Ratchaburi", nameTh: "ราชบุรี", slug: "ratchaburi" },
      { nameDe: "Phetchaburi", nameEn: "Phetchaburi", nameTh: "เพชรบุรี", slug: "phetchaburi" },
      { nameDe: "Prachuap Khiri Khan", nameEn: "Prachuap Khiri Khan", nameTh: "ประจวบคีรีขันธ์", slug: "prachuap-khiri-khan" },
    ],
  },
  {
    nameDe: "Ostthailand",
    nameEn: "Eastern Thailand",
    nameTh: "ภาคตะวันออก",
    slug: "ostthailand",
    provinces: [
      { nameDe: "Chonburi", nameEn: "Chon Buri", nameTh: "ชลบุรี", slug: "chonburi" },
      { nameDe: "Rayong", nameEn: "Rayong", nameTh: "ระยอง", slug: "rayong" },
      { nameDe: "Chanthaburi", nameEn: "Chanthaburi", nameTh: "จันทบุรี", slug: "chanthaburi" },
      { nameDe: "Trat", nameEn: "Trat", nameTh: "ตราด", slug: "trat" },
      { nameDe: "Sa Kaeo", nameEn: "Sa Kaeo", nameTh: "สระแก้ว", slug: "sa-kaeo" },
      { nameDe: "Chachoengsao", nameEn: "Chachoengsao", nameTh: "ฉะเชิงเทรา", slug: "chachoengsao" },
    ],
  },
  {
    nameDe: "Westthailand",
    nameEn: "Western Thailand",
    nameTh: "ภาคตะวันตก",
    slug: "westthailand",
    provinces: [
      { nameDe: "Tak", nameEn: "Tak", nameTh: "ตาก", slug: "tak" },
      { nameDe: "Sukhothai", nameEn: "Sukhothai", nameTh: "สุโขทัย", slug: "sukhothai" },
      { nameDe: "Phitsanulok", nameEn: "Phitsanulok", nameTh: "พิษณุโลก", slug: "phitsanulok" },
      { nameDe: "Phichit", nameEn: "Phichit", nameTh: "พิจิตร", slug: "phichit" },
      { nameDe: "Kamphaeng Phet", nameEn: "Kamphaeng Phet", nameTh: "กำแพงเพชร", slug: "kamphaeng-phet" },
      { nameDe: "Nakhon Sawan", nameEn: "Nakhon Sawan", nameTh: "นครสวรรค์", slug: "nakhon-sawan" },
      { nameDe: "Uthai Thani", nameEn: "Uthai Thani", nameTh: "อุทัยธานี", slug: "uthai-thani" },
    ],
  },
  {
    nameDe: "Südthailand",
    nameEn: "Southern Thailand",
    nameTh: "ภาคใต้",
    slug: "suedthailand",
    provinces: [
      { nameDe: "Surat Thani", nameEn: "Surat Thani", nameTh: "สุราษฎร์ธานี", slug: "surat-thani" },
      { nameDe: "Nakhon Si Thammarat", nameEn: "Nakhon Si Thammarat", nameTh: "นครศรีธรรมราช", slug: "nakhon-si-thammarat" },
      { nameDe: "Krabi", nameEn: "Krabi", nameTh: "กระบี่", slug: "krabi" },
      { nameDe: "Phuket", nameEn: "Phuket", nameTh: "ภูเก็ต", slug: "phuket" },
      { nameDe: "Phang Nga", nameEn: "Phang Nga", nameTh: "พังงา", slug: "phang-nga" },
      { nameDe: "Trang", nameEn: "Trang", nameTh: "ตรัง", slug: "trang" },
      { nameDe: "Satun", nameEn: "Satun", nameTh: "สตูล", slug: "satun" },
      { nameDe: "Songkhla", nameEn: "Songkhla", nameTh: "สงขลา", slug: "songkhla" },
      { nameDe: "Pattani", nameEn: "Pattani", nameTh: "ปัตตานี", slug: "pattani" },
      { nameDe: "Yala", nameEn: "Yala", nameTh: "ยะลา", slug: "yala" },
      { nameDe: "Narathiwat", nameEn: "Narathiwat", nameTh: "นราธิวาส", slug: "narathiwat" },
      { nameDe: "Chumphon", nameEn: "Chumphon", nameTh: "ชุมพร", slug: "chumphon" },
      { nameDe: "Ranong", nameEn: "Ranong", nameTh: "ระนอง", slug: "ranong" },
      { nameDe: "Phatthalung", nameEn: "Phatthalung", nameTh: "พัทลุง", slug: "phatthalung" },
    ],
  },
];

async function main() {
  console.log("Seeding Thailand location hierarchy...");

  const thailand = await prisma.location.upsert({
    where: { slug: "thailand" },
    update: {},
    create: {
      type: "country",
      nameDe: "Thailand",
      nameEn: "Thailand",
      nameTh: "ประเทศไทย",
      slug: "thailand",
    },
  });

  console.log(`Country: ${thailand.nameEn}`);

  for (const region of REGIONS) {
    const regionRecord = await prisma.location.upsert({
      where: { slug: region.slug },
      update: {},
      create: {
        type: "region",
        nameDe: region.nameDe,
        nameEn: region.nameEn,
        nameTh: region.nameTh,
        slug: region.slug,
        parentId: thailand.id,
      },
    });

    console.log(`  Region: ${regionRecord.nameEn} (${region.provinces.length} provinces)`);

    for (const province of region.provinces) {
      await prisma.location.upsert({
        where: { slug: province.slug },
        update: {},
        create: {
          type: "province",
          nameDe: province.nameDe,
          nameEn: province.nameEn,
          nameTh: province.nameTh,
          slug: province.slug,
          parentId: regionRecord.id,
        },
      });
    }
  }

  const total = await prisma.location.count();
  console.log(`\nDone. ${total} locations in database.`);

  // Link Thailand template to Thailand location
  const thailandLoc = await prisma.location.findUnique({ where: { slug: "thailand" } });
  const thailandTemplate = await prisma.promptTemplate.findFirst({
    where: { name: "Thailand Reise-Artikel (Deutsch)" },
  });
  if (thailandLoc && thailandTemplate && thailandTemplate.locationId !== thailandLoc.id) {
    await prisma.promptTemplate.update({
      where: { id: thailandTemplate.id },
      data: { locationId: thailandLoc.id },
    });
    console.log("Linked Thailand template to Thailand location.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
