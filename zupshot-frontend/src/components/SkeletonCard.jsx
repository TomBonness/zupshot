import ContentLoader from 'react-content-loader';

export default function SkeletonCard() {
  return (
    <div className="border border-light-gray rounded-lg p-4 bg-white shadow-sm">
      <ContentLoader
        speed={2}
        width={320}
        height={280}
        viewBox="0 0 320 280"
        backgroundColor="#F5F5F5"
        foregroundColor="#E5E5E5"
      >
        <rect x="0" y="0" rx="8" ry="8" width="320" height="192" />
        <rect x="0" y="208" rx="4" ry="4" width="200" height="20" />
        <rect x="0" y="236" rx="4" ry="4" width="150" height="16" />
        <rect x="0" y="260" rx="4" ry="4" width="100" height="16" />
      </ContentLoader>
    </div>
  );
}