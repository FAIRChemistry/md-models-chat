import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { KnowledgeGraph as KnowledgeGraphType } from "@/utils/requests";
interface Triplet {
  predicate: string;
  object: string;
}

interface GroupedTriplets {
  [subject: string]: Triplet[];
}

export function groupTriplets(
  knowledgeGraph: KnowledgeGraphType
): GroupedTriplets {
  return knowledgeGraph.triplets.reduce(
    (acc, { subject, predicate, object }) => {
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push({ predicate, object });
      return acc;
    },
    {} as GroupedTriplets
  );
}

interface KnowledgeGraphProps {
  knowledgeGraph: KnowledgeGraphType;
}

export function KnowledgeGraph({ knowledgeGraph }: KnowledgeGraphProps) {
  const groupedTriplets = groupTriplets(knowledgeGraph);

  return (
    <div className="bg-[#0d1117] p-4 space-y-6">
      {Object.entries(groupedTriplets).map(([subject, triplets]) => (
        <div key={subject} className="space-y-2">
          <Badge
            variant="secondary"
            className="bg-[#388bfd1a] text-[#58a6ff] border border-[#388bfd1a] hover:bg-[#388bfd1a] text-sm mb-2"
          >
            {subject}
          </Badge>
          <div className="pl-4 space-y-2">
            {triplets.map((triplet, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="flex items-center text-[#8b949e]">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  <span className="font-medium">{triplet.predicate}</span>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-[#2ea0431a] text-[#3fb950] border border-[#2ea0431a] hover:bg-[#2ea0431a]"
                >
                  {triplet.object}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
