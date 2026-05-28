// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('MNP@2026', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mnp.mg' },
    update: {},
    create: {
      name: 'Admin MNP',
      email: 'admin@mnp.mg',
      passwordHash: hash,
      role: 'admin',
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@mnp.mg' },
    update: {},
    create: {
      name: 'Agent Mantadia',
      email: 'agent@mnp.mg',
      passwordHash: hash,
      role: 'agent',
    },
  });

  await prisma.user.upsert({
    where: { email: 'accueil@mnp.mg' },
    update: {},
    create: {
      name: 'Hôtesse Accueil',
      email: 'accueil@mnp.mg',
      passwordHash: hash,
      role: 'receptionist',
    },
  });

  console.log('✅ Users created');

  // ── Parcels ────────────────────────────────────────────────────────────────
  const parcel1 = await prisma.parcel.upsert({
    where: { code: 'PARC-01' },
    update: {},
    create: {
      name: 'North-East Zone — Block A',
      code: 'PARC-01',
      park: 'Mantadia National Park',
      areaHa: 2.5,
      latitude: -18.815,
      longitude: 48.421,
      notes: 'Primary restoration zone. 250 holes prepared.',
    },
  });

  const parcel2 = await prisma.parcel.upsert({
    where: { code: 'PARC-02' },
    update: {},
    create: {
      name: 'South Valley — Block B',
      code: 'PARC-02',
      park: 'Mantadia National Park',
      areaHa: 1.8,
      latitude: -18.831,
      longitude: 48.418,
      notes: 'Secondary zone. Mixed endemic species.',
    },
  });

  console.log('✅ Parcels created');

  // ── Trees (pre-attributed QR codes) ───────────────────────────────────────
  const treeData = [
    {
      externalId: 'QR-00001',
      speciesVernacular: 'Palissandre',
      speciesScientific: 'Dalbergia baronii',
      holeNumber: 1,
      parcelId: parcel1.id,
    },
    {
      externalId: 'QR-00002',
      speciesVernacular: 'Varongy',
      speciesScientific: 'Ocotea cymosa',
      holeNumber: 2,
      parcelId: parcel1.id,
    },
    {
      externalId: 'QR-00003',
      speciesVernacular: 'Ramy',
      speciesScientific: 'Canarium madagascariensis',
      holeNumber: 3,
      parcelId: parcel1.id,
    },
    {
      externalId: 'QR-00004',
      speciesVernacular: 'Hafotra',
      speciesScientific: 'Weinmannia rutenbergii',
      holeNumber: 1,
      parcelId: parcel2.id,
    },
    {
      externalId: 'QR-00005',
      speciesVernacular: 'Ambora',
      speciesScientific: 'Tambourissa sp.',
      holeNumber: 2,
      parcelId: parcel2.id,
    },
  ];

  for (const t of treeData) {
    await prisma.tree.upsert({
      where: { externalId: t.externalId },
      update: {},
      create: { ...t, healthStatus: 'pending' },
    });
  }

  console.log('✅ Trees (QR pre-attributed) created');
  console.log('\n🎉 Seed complete!');
  console.log('   Admin:        admin@mnp.mg     / MNP@2026');
  console.log('   Agent:        agent@mnp.mg     / MNP@2026');
  console.log('   Receptionist: accueil@mnp.mg   / MNP@2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
