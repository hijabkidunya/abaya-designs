/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["res.cloudinary.com"],
    },
    experimental: {
        serverComponentsExternalPackages: ['sharp'],
    },
    api: {
        bodyParser: {
            sizeLimit: '50mb',
        },
        responseLimit: '50mb',
    },
};

export default nextConfig;
