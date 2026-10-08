import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`seo_title\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`seo_description\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`other_names\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`service_area\` text;`)
  // Isi awal untuk database yang sudah berjalan (database baru diisi oleh seed).
  await db.run(sql`UPDATE \`site_settings\` SET \`other_names\` = 'Klinik Bintang Usada Bhakti' || char(10) || 'Klinik Bintang Usada Bakti' WHERE \`other_names\` IS NULL;`)
  await db.run(sql`UPDATE \`site_settings\` SET \`service_area\` = 'Desa Lembean' || char(10) || 'Kecamatan Kintamani' || char(10) || 'Kabupaten Bangli' WHERE \`service_area\` IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`seo_title\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`seo_description\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`other_names\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`service_area\`;`)
}
