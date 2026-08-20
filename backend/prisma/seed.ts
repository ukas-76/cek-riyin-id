/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding phone_reports data for testing Number Checking...');

  // Clean existing reports for seed numbers
  await prisma.phoneReport.deleteMany({
    where: {
      phone_number: {
        in: ['628121111111', '628129999999', '081211111111', '081299999999']
      }
    }
  });

  // 1. Medium Risk Test Number: 628121111111 (1 report)
  await prisma.phoneReport.create({
    data: {
      phone_number: '628121111111',
      category: 'Penipuan jual beli',
      description: 'Mengaku menjual elektronik murah di sosmed tetapi barang tidak pernah dikirim setelah transfer.'
    }
  });

  // 2. High Risk Test Number: 628129999999 (5 reports)
  const highRiskReports = [
    {
      phone_number: '628129999999',
      category: 'Penipuan transfer',
      description: 'Mengaku CS Bank meminta korban melakukan transfer biaya adm tagihan palsu.'
    },
    {
      phone_number: '628129999999',
      category: 'Penipuan transfer',
      description: 'Modus pura-pura salah transfer uang ke rekening lalu memaksa pengembalian uang.'
    },
    {
      phone_number: '628129999999',
      category: 'Penipuan transfer',
      description: 'Meminta transfer saldo e-wallet dengan dalih pembaharuan akun terblokir.'
    },
    {
      phone_number: '628129999999',
      category: 'Hadiah palsu',
      description: 'SMS broadcast klaim pemenang undian berhadiah puluhan juta rupiah.'
    },
    {
      phone_number: '628129999999',
      category: 'Hadiah palsu',
      description: 'Telepon pengundian hadiah meminta pembayar pajak pemenang diawal.'
    }
  ];

  for (const report of highRiskReports) {
    await prisma.phoneReport.create({ data: report });
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
