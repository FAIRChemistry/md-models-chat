import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { Spinner } from "@/components/SpinnerElement";
import { KnowledgeGraph as KnowledgeGraphType } from "@/utils/requests";

interface KnowledgeGraphViewProps {
    knowledgeGraph: KnowledgeGraphType;
    evaluation: {
        fits: boolean;
        reason: string;
    };
}

export function KnowledgeGraphView({ knowledgeGraph, evaluation }: KnowledgeGraphViewProps) {
    if (evaluation.reason || knowledgeGraph.triplets?.length > 0) {
        if (knowledgeGraph.triplets?.length > 0) {
            return <KnowledgeGraph knowledgeGraph={knowledgeGraph} />;
        } else {
            return (
                <div className="flex justify-center items-center h-40">
                    <Spinner color="secondary" />
                </div>
            );
        }
    } else {
        return (
            <div className="flex justify-center items-center h-40 text-sm text-gray-500">
                <p>No Data</p>
            </div>
        );
    }
} 