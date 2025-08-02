"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useAssessmentScores } from "@/hooks/useAssessmentScores";
import AssessmentResults from "@/components/AssessmentResults";


// --- MOCK DATA for local testing ---
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

export default function MemberProfilePage() {
  const { memberId } = useParams();
  const member = members.find((m) => m.id === memberId);


  const { profile } = useAssessmentScores(member?.answers);
  const primaryArchetype = profile?.[0];

  if (!member) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <p className="text-red-600">Member not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
  

{/* Member info */}
<div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg border border-amber-400/30 shadow-lg">
      {member.image ? (
        <Image
          src={member.image}
          alt={member.name || member.ethAddress}
          width={80}
          height={80}
          className="rounded-full"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl text-white">
          ?
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold text-white">{member.name || "Anonymous"}</h1>
        <p className="text-gray-400">{member.ethAddress}</p>
      </div>
    </div>

    {/* Assessment Results */}
    {member.answers && <AssessmentResults answers={member.answers} />}

    {/* Archetype card */}
    {primaryArchetype && (
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
     
          <div className="space-y-4">
            {/* Strengths */}
            {primaryArchetype.strengths && primaryArchetype.strengths.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-amber-300 mb-2">Strengths</h3>
                <ul className="list-disc list-inside text-gray-100 space-y-1">
                  {primaryArchetype.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Challenges */}
            {primaryArchetype.challenges && primaryArchetype.challenges.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-amber-300 mb-2">Challenges</h3>
                <ul className="list-disc list-inside text-gray-100 space-y-1">
                  {primaryArchetype.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Recommendations */}
            {primaryArchetype.recommendations && primaryArchetype.recommendations.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-amber-300 mb-2">Recommendations</h3>
                <ul className="list-disc list-inside text-gray-100 space-y-1">
                  {primaryArchetype.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}