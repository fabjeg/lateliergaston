import { Helmet } from 'react-helmet-async'

const defaultSEO = {
  siteName: "L'Atelier Gaston",
  siteUrl: 'https://www.lateliergaston.fr',
  defaultTitle: "L'Atelier Gaston | Broderie Artisanale",
  defaultDescription: "Artisan brodeur spécialisé dans l'implantation de cheveux sur photo. Portraits personnalisés, créations uniques et sur-mesure à Crach, Bretagne.",
  defaultImage: 'https://www.lateliergaston.fr/og-image.jpg',
}

export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  noindex = false,
  schema = null,
  product = null,
}) {
  const pageTitle = title
    ? `${title} | ${defaultSEO.siteName}`
    : defaultSEO.defaultTitle
  const pageDescription = description || defaultSEO.defaultDescription
  const pageImage = image || defaultSEO.defaultImage
  const pageUrl = url ? `${defaultSEO.siteUrl}${url}` : defaultSEO.siteUrl

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: "L'Atelier Gaston",
    description: defaultSEO.defaultDescription,
    url: defaultSEO.siteUrl,
    telephone: '+33 6 18 01 42 57',
    email: 'contact@lateliergaston.fr',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Crach',
      postalCode: '56950',
      addressCountry: 'FR',
    },
    sameAs: [
      'https://www.instagram.com/lateliergaston/',
      'https://www.facebook.com/profile.php?id=61578722411636',
    ],
    image: pageImage,
    priceRange: '€€',
  }

  const productSchema = product
    ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: pageUrl,
      },
    }
    : null

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:site_name" content={defaultSEO.siteName} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schema || organizationSchema)}
      </script>

      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
    </Helmet>
  )
}
