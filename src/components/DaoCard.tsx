import Image from 'next/image';
import Link from 'next/link';

interface Dao {
  id: string;
  label: string;
  image?: string;
  value?: {
    thing?: {
      description?: string;
    };
  };
  vault?: {
    position_count?: number;
  };
}

export default function DaoCard({ dao }: { dao: Dao }) {
  const description = dao.value?.thing?.description || 'No description available';
  const votes = dao.vault?.position_count ?? 0;

  return (
    <Link href={`/daos/${dao.id}/description`} className="block group">
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white group-hover:shadow-lg transition-shadow duration-200">
        <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-200" />

        <div className="px-4 pb-4 -mt-8 relative z-10">
          <div className="w-12 h-12 rounded-full bg-white shadow-md border-2 border-white overflow-hidden">
            {dao.image ? (
              <Image
                src={dao.image}
                alt={dao.label}
                width={48}
                height={48}
                className="rounded-full w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                No Img
              </div>
            )}
          </div>

          <h3 className="mt-2 text-base font-semibold text-gray-900">{dao.label}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

          <div className="mt-3 text-xs text-gray-500 flex gap-2">
            <span>
              <span className="font-medium text-black">{votes}</span> votes
            </span>
            <span>·</span>
            <span className="text-green-600 font-semibold">DAO</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
