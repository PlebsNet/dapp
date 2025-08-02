'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import Image from 'next/image';

const DAO_QUERY = gql`
  query GetDaoById($id: numeric!) {
    atoms(where: { id: { _eq: $id } }) {
      id
      label
      image
    }
  }
`;

export default function DaosLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMainPage = pathname === '/daos';

  const match = pathname.match(/^\/daos\/([^/]+)/);
  const daoId = match?.[1];

  const isMemberProfile = /^\/daos\/[^/]+\/members\/[^/]+$/.test(pathname);

  const { data } = useQuery(DAO_QUERY, {
    skip: isMainPage || !daoId,
    variables: { id: Number(daoId) },
  });

  const dao = data?.atoms?.[0];

  return (
    <div className="flex min-h-screen">
      {!isMainPage && (
        <aside className="w-64 bg-gray-100 p-4 border-r">
          <nav className="space-y-4">
            <Link
              href="/daos"
              className="inline-flex items-center gap-2 text-sm text-gray-700 font-medium hover:text-black hover:bg-gray-200 transition rounded px-2 py-1 mb-4"
            >
              <span className="text-lg">←</span> Back to DAO&apos;s list
            </Link>

            <div className="ml-4">
              {isMemberProfile ? (
                <div className="ml-4 pl-4 border-l border-gray-300 space-y-2">
                  <Link
                    href={`/daos/${daoId}/members`}
                    className="block text-sm text-gray-700 hover:text-black"
                  >
                    Back to members list
                  </Link>
                </div>
              ) : (
                dao && (
                  <>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      {dao.image ? (
                        <Image
                          src={dao.image}
                          alt={dao.label}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-300 rounded-full" />
                      )}
                      <span>{dao.label}</span>
                    </div>
                    <div className="ml-4 pl-4 border-l border-gray-300 space-y-2">
                      <Link
                        href={`/daos/${dao.id}/description`}
                        className="block text-sm text-gray-700 hover:text-black"
                      >
                        Description
                      </Link>
                      <Link
                        href={`/daos/${dao.id}/members`}
                        className="block text-sm text-gray-700 hover:text-black"
                      >
                        Members
                      </Link>
                    </div>
                  </>
                )
              )}
            </div>
          </nav>
        </aside>
      )}

      <main className={isMainPage ? 'w-full pl-20 pr-6 py-8' : 'flex-1 p-6'}>
        <div className={isMainPage ? 'max-w-7xl w-full mx-auto' : ''}>
          {children}
        </div>
      </main>
    </div>
  );
}
