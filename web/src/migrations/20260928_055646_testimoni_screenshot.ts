import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_testimonials\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`format\` text DEFAULT 'screenshot' NOT NULL,
  	\`screenshot_id\` integer,
  	\`author_name\` text NOT NULL,
  	\`rating\` numeric,
  	\`text\` text,
  	\`source\` text DEFAULT 'google' NOT NULL,
  	\`review_url\` text,
  	\`google_review_id\` text,
  	\`consent\` integer,
  	\`service\` text,
  	\`review_date\` text,
  	\`show\` integer DEFAULT false,
  	\`order\` numeric DEFAULT 10,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`screenshot_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  // Diperbaiki manual: generator menyalin kolom "format" & "screenshot_id" yang belum ada
  // di tabel lama. Ulasan lama diberi format 'teks'; screenshot_id dibiarkan NULL.
  await db.run(sql`INSERT INTO \`__new_testimonials\`("id", "format", "author_name", "rating", "text", "source", "review_url", "google_review_id", "consent", "service", "review_date", "show", "order", "updated_at", "created_at") SELECT "id", 'teks', "author_name", "rating", "text", "source", "review_url", "google_review_id", "consent", "service", "review_date", "show", "order", "updated_at", "created_at" FROM \`testimonials\`;`)
  await db.run(sql`DROP TABLE \`testimonials\`;`)
  await db.run(sql`ALTER TABLE \`__new_testimonials\` RENAME TO \`testimonials\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`testimonials_screenshot_idx\` ON \`testimonials\` (\`screenshot_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`testimonials_google_review_id_idx\` ON \`testimonials\` (\`google_review_id\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_updated_at_idx\` ON \`testimonials\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_created_at_idx\` ON \`testimonials\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_review_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_review_width\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_review_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_review_mime_type\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_review_filesize\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_review_filename\` text;`)
  await db.run(sql`CREATE INDEX \`media_sizes_review_sizes_review_filename_idx\` ON \`media\` (\`sizes_review_filename\`);`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`team_dentists\` numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_testimonials\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`author_name\` text NOT NULL,
  	\`rating\` numeric DEFAULT 5 NOT NULL,
  	\`text\` text NOT NULL,
  	\`source\` text DEFAULT 'google' NOT NULL,
  	\`review_url\` text,
  	\`google_review_id\` text,
  	\`consent\` integer,
  	\`service\` text,
  	\`review_date\` text,
  	\`show\` integer DEFAULT false,
  	\`order\` numeric DEFAULT 10,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_testimonials\`("id", "author_name", "rating", "text", "source", "review_url", "google_review_id", "consent", "service", "review_date", "show", "order", "updated_at", "created_at") SELECT "id", "author_name", "rating", "text", "source", "review_url", "google_review_id", "consent", "service", "review_date", "show", "order", "updated_at", "created_at" FROM \`testimonials\`;`)
  await db.run(sql`DROP TABLE \`testimonials\`;`)
  await db.run(sql`ALTER TABLE \`__new_testimonials\` RENAME TO \`testimonials\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`testimonials_google_review_id_idx\` ON \`testimonials\` (\`google_review_id\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_updated_at_idx\` ON \`testimonials\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_created_at_idx\` ON \`testimonials\` (\`created_at\`);`)
  await db.run(sql`DROP INDEX \`media_sizes_review_sizes_review_filename_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_review_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_review_width\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_review_height\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_review_mime_type\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_review_filesize\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_review_filename\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`team_dentists\`;`)
}
