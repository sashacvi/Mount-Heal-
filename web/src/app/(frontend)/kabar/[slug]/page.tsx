import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@/components/Icon'
import { PostCard, TYPE_LABEL } from '@/components/NewsSection'
import { RegisterButton } from '@/components/RegisterButton'
import { fmtDate, waLink } from '@/lib/format'
import { getPostBySlug, getPosts, getSettings, imgUrl, media } from '@/lib/site'
import { toPostLite } from '@/lib/view'

type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug)
  if (!post) return { title: 'Tidak ditemukan' }
  const cover = imgUrl(media(post.cover), 'large')
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: 'article', title: post.title, description: post.excerpt, images: cover ? [cover] : ['/og.png'], publishedTime: post.publishedAt },
  }
}

export default async function PostPage({ params }: Args) {
  const post = await getPostBySlug((await params).slug)
  if (!post) notFound()
  const [settings, recent] = await Promise.all([getSettings(), getPosts(4)])
  const cover = media(post.cover)
  const author = post.author && typeof post.author === 'object' ? post.author.name : null
  const reviewer = post.medicalReviewer && typeof post.medicalReviewer === 'object' ? post.medicalReviewer.name : null
  const others = recent.filter((p) => p.id !== post.id).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': post.type === 'artikel' ? 'MedicalWebPage' : 'NewsArticle',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: author ? { '@type': 'Person', name: author } : { '@type': 'Organization', name: settings.clinicName },
    reviewedBy: reviewer ? { '@type': 'Person', name: reviewer } : undefined,
    publisher: { '@type': 'MedicalClinic', name: settings.clinicName },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Beranda</Link>
            <span aria-hidden="true">/</span>
            <Link href="/kabar">Kabar Klinik</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/kabar?jenis=${post.type}`}>{TYPE_LABEL[post.type]}</Link>
          </nav>
          <h1 style={{ maxWidth: '24ch' }}>{post.title}</h1>
          <p>
            {fmtDate(post.publishedAt)}
            {author ? ` · Oleh ${author}` : ''}
            {reviewer ? ` · Ditinjau medis oleh ${reviewer}` : ''}
          </p>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="wrap article-layout">
          <article>
            {cover?.url && (
              <img
                src={imgUrl(cover, 'large') ?? imgUrl(cover) ?? ''}
                alt={cover.alt}
                width={cover.width ?? undefined}
                height={cover.height ?? undefined}
                style={{ borderRadius: 'var(--radius-lg)', marginBottom: 28, width: '100%', height: 'auto' }}
              />
            )}
            <div className="prose">
              <p style={{ fontSize: 19, color: 'var(--muted)' }}>{post.excerpt}</p>
              {post.content && <RichText data={post.content as never} />}
              {post.type === 'artikel' && (
                <p className="notice">
                  Artikel ini bersifat edukasi dan tidak menggantikan pemeriksaan langsung oleh dokter. Bila keluhan berlanjut, silakan
                  berkonsultasi di klinik.
                </p>
              )}
            </div>
          </article>
          <aside className="article-aside">
            <div className="info-card">
              <h3>Butuh pemeriksaan?</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14.5 }}>Daftar berobat lewat WhatsApp atau tanyakan jadwal dokter.</p>
              <RegisterButton className="btn btn-primary">
                <Icon name="calendar" />
                Daftar Berobat
              </RegisterButton>
              <a className="btn btn-ghost" href={waLink(settings.whatsapp)} target="_blank" rel="noopener">
                <Icon name="chat" />
                Tanya via WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>
      {others.length > 0 && (
        <section className="sec alt">
          <div className="wrap">
            <div className="sec-head">
              <h2 className="h2" style={{ marginTop: 0 }}>Kabar lainnya</h2>
              <Link className="btn btn-ghost" href="/kabar">
                Semua kabar <Icon name="arrow" />
              </Link>
            </div>
            <div className="news-list">
              {others.map((p) => (
                <PostCard key={p.id} p={toPostLite(p)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
