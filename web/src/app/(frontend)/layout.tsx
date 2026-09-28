import type { Metadata, Viewport } from 'next'
import { DM_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { AnnouncementBar } from '@/components/AnnouncementBar'
import { TodayHours } from '@/components/ClinicStatus'
import { Icon } from '@/components/Icon'
import { RegistrationDialog } from '@/components/RegistrationDialog'
import { SiteHeader } from '@/components/SiteHeader'
import { themeInitScript } from '@/components/ThemeToggle'
import type { HoursRow } from '@/components/types'
import { fmtPhone, waLink } from '@/lib/format'
import { activeAnnouncements, getHomeData } from '@/lib/site'
import { toStaffLite } from '@/lib/view'
import './globals.css'

export const dynamic = 'force-dynamic'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dm-mono', display: 'swap' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getHomeData()
  const description = `${settings.clinicName} di ${settings.address.split('\n')[0]}. ${settings.intro}`.slice(0, 300)
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${settings.clinicName} · Kintamani, Bangli`, template: `%s · ${settings.clinicName}` },
    description,
    openGraph: { type: 'website', locale: 'id_ID', siteName: settings.clinicName, images: ['/og.png'] },
    icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#722975' },
    { media: '(prefers-color-scheme: dark)', color: '#120A1A' },
  ],
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const { settings, services, staff, posts, gallery } = await getHomeData()
  const hours = (settings.hours ?? []) as HoursRow[]
  const doctors = staff.filter((s) => s.category === 'dokter' || s.category === 'dokter-gigi').map(toStaffLite)
  const serviceNames = services.map((s) => s.name)
  const announcements = activeAnnouncements(posts).map((p) => ({ title: p.title, slug: p.slug ?? String(p.id) }))

  return (
    <html lang="id" className={`${jakarta.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a className="skip" href="#main">
          Lewati ke konten utama
        </a>
        <AnnouncementBar items={announcements} />
        <div className="utility">
          <div className="wrap">
            <span>
              <Icon name="clock" />
              <TodayHours hours={hours} />
            </span>
            <span className="hide-sm">
              <Icon name="chat" />
              WhatsApp {fmtPhone(settings.whatsapp)}
            </span>
            <span className="hide-sm">
              <Icon name="pin" />
              {settings.address.split('\n')[0]}
            </span>
            <span className="emg">
              <Icon name="ambulance" />
              Gawat darurat: hubungi 119
            </span>
          </div>
        </div>
        <SiteHeader services={serviceNames} hasGallery={gallery.length > 0} />
        <main id="main">{children}</main>
        <footer>
          <div className="wrap">
            <div className="f-grid">
              <div>
                <Link className="brand" href="/">
                  <img src="/brand/logo-mark.svg" alt="" width={98} height={46} />
                  <span>
                    <small style={{ marginTop: 0, marginBottom: 3 }}>Klinik</small>
                    <b style={{ color: '#5CC1FF' }}>Mustika Sekar Taji</b>
                  </span>
                </Link>
                <p style={{ marginTop: 16, maxWidth: '38ch', whiteSpace: 'pre-line' }}>{settings.address}</p>
                {settings.licenseNumber && <p style={{ marginTop: 8, fontSize: 13, color: '#B9AEC2' }}>Izin operasional: {settings.licenseNumber}</p>}
                {settings.accreditation && <p style={{ marginTop: 4, fontSize: 13, color: '#B9AEC2' }}>Terakreditasi {settings.accreditation}</p>}
                {settings.socials && settings.socials.length > 0 && (
                  <div className="socials">
                    {settings.socials.map((s) => (
                      <a key={s.url} href={s.url} target="_blank" rel="noopener" aria-label={s.platform}>
                        <Icon name={s.platform === 'youtube' ? 'play' : s.platform === 'tiktok' ? 'music' : s.platform === 'instagram' ? 'camera' : 'globe'} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3>Layanan</h3>
                <ul>
                  {serviceNames.map((s) => (
                    <li key={s}>
                      <Link href="/#layanan">{s}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Info pasien</h3>
                <ul>
                  <li><Link href="/#daftar">Cara mendaftar</Link></li>
                  <li><Link href="/#dokter">Jadwal dokter</Link></li>
                  <li><Link href="/#faq">BPJS Kesehatan</Link></li>
                  <li><Link href="/kabar">Kabar & artikel</Link></li>
                  <li><Link href="/kebijakan-privasi">Kebijakan privasi</Link></li>
                </ul>
              </div>
              <div>
                <h3>Kontak</h3>
                <ul>
                  <li><a href={waLink(settings.whatsapp)} target="_blank" rel="noopener">WhatsApp {fmtPhone(settings.whatsapp)}</a></li>
                  {settings.phone && <li>Telepon {settings.phone}</li>}
                  {settings.email && <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>}
                  <li><a href={settings.mapsUrl} target="_blank" rel="noopener">Buka di Google Maps</a></li>
                  <li><Link href="/admin">Masuk admin</Link></li>
                </ul>
              </div>
            </div>
            <div className="legal">
              <span>© {new Date().getFullYear()} {settings.clinicName}. Informasi di situs ini tidak menggantikan pemeriksaan langsung oleh tenaga kesehatan.</span>
              <span><Link href="/kebijakan-privasi">Kebijakan privasi</Link></span>
            </div>
          </div>
        </footer>
        <a className="fab" href={waLink(settings.whatsapp, 'Halo Klinik Mustika Sekar Taji, saya ingin bertanya.')} target="_blank" rel="noopener" aria-label="Chat WhatsApp klinik">
          <Icon name="chat" />
          <span>Chat WhatsApp</span>
        </a>
        <RegistrationDialog services={serviceNames} doctors={doctors} whatsapp={settings.whatsapp} />
      </body>
    </html>
  )
}
