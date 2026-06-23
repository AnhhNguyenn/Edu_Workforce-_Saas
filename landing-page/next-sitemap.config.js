/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://eduops.vn',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ['/server-sitemap-index.xml', '/api/*'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://eduops.vn/sitemap-blog.xml',
      'https://eduops.vn/sitemap-feature.xml',
      'https://eduops.vn/sitemap-audience.xml',
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
}
