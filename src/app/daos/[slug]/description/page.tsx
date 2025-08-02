'use client';

import { gql, useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import Image from 'next/image';

const DAO_DETAILS_QUERY = gql`
  query GetDaoDetailsById($id: numeric!) {
    atoms(where: { id: { _eq: $id } }) {
      id
      label
      image
      value {
        thing {
          description
          url
        }
      }
      vault {
        position_count
      }
    }
  }
`;

export default function DaoDescriptionPage() {
  const { slug } = useParams();
  const numericId = Number(slug);

  // Use skip to avoid running the query if id is invalid
  const { data, loading, error } = useQuery(DAO_DETAILS_QUERY, {
    variables: { id: numericId },
    skip: isNaN(numericId),
  });

  if (isNaN(numericId)) {
    return <p className="p-6 text-red-600">Invalid DAO ID</p>;
  }
  if (loading) return <p className="p-6">Loading DAO details...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>;

  const dao = data?.atoms?.[0];
  if (!dao) return <p className="p-6">No DAO found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        {dao.image ? (
          <Image
            src={dao.image}
            alt={dao.label}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
        )}
        <h1 className="text-2xl font-bold">{dao.label}</h1>
      </div>

      <p className="text-gray-700 whitespace-pre-line mb-6">
        {dao.value?.thing?.description || 'No description provided.'}
      </p>

      {dao.value?.thing?.url && (
        <a
          href={dao.value.thing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
        >
          Visit official website
        </a>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Total votes:{' '}
        <span className="font-medium text-white">{dao.vault?.position_count ?? 0}</span>
      </div>
    </div>
  );
}
