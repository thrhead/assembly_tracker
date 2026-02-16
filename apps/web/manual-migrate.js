const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Veritabanına bağlanıldı...');

    // JobStep tablosuna stepNo ekle
    try {
      await client.query('ALTER TABLE "job_steps" ADD COLUMN IF NOT EXISTS "stepNo" TEXT');
      await client.query('CREATE UNIQUE INDEX IF NOT EXISTS "job_steps_stepNo_key" ON "job_steps"("stepNo")');
      console.log('✅ JobStep: stepNo sütunu eklendi.');
    } catch (e) {
      console.log('ℹ️ JobStep güncellemesi (muhtemelen zaten var):', e.message);
    }

    // JobSubStep tablosuna subStepNo ekle
    try {
      await client.query('ALTER TABLE "job_sub_steps" ADD COLUMN IF NOT EXISTS "subStepNo" TEXT');
      await client.query('CREATE UNIQUE INDEX IF NOT EXISTS "job_sub_steps_subStepNo_key" ON "job_sub_steps"("subStepNo")');
      console.log('✅ JobSubStep: subStepNo sütunu eklendi.');
    } catch (e) {
      console.log('ℹ️ JobSubStep güncellemesi (muhtemelen zaten var):', e.message);
    }

    console.log('\n🚀 Veritabanı yapısı başarıyla güncellendi!');
  } catch (err) {
    console.error('❌ Hata:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
