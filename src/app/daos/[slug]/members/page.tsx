"use client";
import Image from "next/image";
import Link from "next/link";


// --- MOCK DATA for local testing ---
// Remove this block when switching to real data
const members = [
  {
    id: "mock-1",
    name: "Alice Mock",
    image: "https://i.pravatar.cc/150?img=11",
    ethAddress: "0x1234...abcd",
    answers: { Q1: 2, Q2: 1, Q3: 3, Q4: 0, Q5: 2 },
  },
  {
    id: "mock-2",
    name: "Bob Mock",
    image: "https://i.pravatar.cc/150?img=12",
    ethAddress: "0x5678...efgh",
    answers: { Q1: 1, Q2: 2, Q3: 2, Q4: 1, Q5: 3 },
  },
  {
    id: "mock-3",
    name: "Charlie Mock",
    image: "https://i.pravatar.cc/150?img=13",
    ethAddress: "0x9abc...ijkl",
    answers: { Q1: 3, Q2: 0, Q3: 1, Q4: 2, Q5: 2 },
  },
  {
    id: "mock-4",
    name: "Diana Mock",
    image: "https://i.pravatar.cc/150?img=14",
    ethAddress: "0xmnop...qrst",
    answers: { Q1: 2, Q2: 2, Q3: 2, Q4: 2, Q5: 2 },
  },
  {
    id: "mock-5",
    name: "Eve Mock",
    image: "https://i.pravatar.cc/150?img=15",
    ethAddress: "0xuvwx...yzab",
    answers: { Q1: 0, Q2: 3, Q3: 1, Q4: 3, Q5: 0 },
  },
];
export default function MembersPage() {
  // MOCK: Use mock data for local visualization



  // --- REAL DATA: Uncomment this block and remove the mock above---
  /*
  import { gql, useQuery } from "@apollo/client";
  import { useParams } from "next/navigation";

  const MEMBER_PROFILE_QUERY = gql`
    query GetMemberProfile($memberId: String!) {
      users(where: { id: { _eq: $memberId } }) {
        id
        name
        image
        ethAddress
        answers
      }
    }
  `;

  export default function MemberProfilePage() {
    const { memberId } = useParams();
    const { data, loading, error } = useQuery(MEMBER_PROFILE_QUERY, {
      variables: { memberId },
    });
    const member = data?.users?.[0];

    if (loading) return <div>Loading…</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;
    if (!member) return <div>No member found.</div>;

    const { profile } = useAssessmentScores(member.answers);
    const primaryArchetype = profile?.[0];
    // ...the rest of the render is identical
  */
  // --- END REAL DATA ---

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {members.map((member) => (
        <Link
          key={member.id}
          href={`/daos/slug/members/${member.id}`}
          className="block"
        >
          <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg border border-amber-400/30 shadow-lg shadow-amber-400/10 hover:shadow-amber-400/20 transition-all cursor-pointer">
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name || member.ethAddress}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-white">
                ?
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{member.name || "Anonymous"}</h2>
              <p className="text-gray-400">{member.ethAddress}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}