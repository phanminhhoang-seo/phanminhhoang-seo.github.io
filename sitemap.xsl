<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="s xhtml">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html lang="vi">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>Sitemap – Phan Minh Hoàng SEO</title>
<style>
body{margin:0;font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1d2433;background:#f5f6f8}
main{max-width:1100px;margin:0 auto;padding:32px 16px}
h1{font-size:24px;margin:0 0 4px}
p{margin:0 0 20px;color:#5a6272}
.wrap{overflow-x:auto;background:#fff;border:1px solid #e3e6eb;border-radius:14px}
table{border-collapse:collapse;width:100%;min-width:640px}
th,td{text-align:left;padding:10px 14px;border-bottom:1px solid #eef0f3;vertical-align:top}
th{font-size:13px;color:#5a6272;font-weight:600;background:#fafbfc}
tr:last-child td{border-bottom:0}
a{color:#2446c8;text-decoration:none;word-break:break-all}
a:hover{text-decoration:underline}
.alt{font-size:13px;color:#5a6272}
.alt span{display:inline-block;margin-right:10px}
.d{white-space:nowrap;color:#5a6272}
</style>
</head>
<body><main>
<h1>Sitemap</h1>
<p>File dành cho công cụ tìm kiếm, gồm <xsl:value-of select="count(s:urlset/s:url)"/> URL tiếng Việt và tiếng Anh của phanminhhoang-seo.github.io.</p>
<div class="wrap"><table>
<thead><tr><th>URL</th><th>Phiên bản ngôn ngữ</th><th>Cập nhật</th></tr></thead>
<tbody>
<xsl:for-each select="s:urlset/s:url">
<tr>
<td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
<td class="alt"><xsl:for-each select="xhtml:link"><span><a href="{@href}"><xsl:value-of select="@hreflang"/></a></span></xsl:for-each></td>
<td class="d"><xsl:value-of select="s:lastmod"/></td>
</tr>
</xsl:for-each>
</tbody>
</table></div>
</main></body>
</html>
</xsl:template>
</xsl:stylesheet>
