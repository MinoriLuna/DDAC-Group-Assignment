/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true, // MANDATORY: This creates /patient/index.html
  images: { unoptimized: true },
};
export default nextConfig;