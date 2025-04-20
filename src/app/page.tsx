import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RiStackLine } from "react-icons/ri";
import fetchFromGitHub, {
  convertGitHubURLToUserRepo,
  listMdFiles,
} from "@/utils/github";
import getMdModelObjects, { getJSONSchema, isMdModel } from "@/utils/mdmodels";
import {
  createKnowledgeGraph,
  evaluateSchemaPrompt,
  EvaluateSchemaPromptResponse,
  extractToSchema,
  KnowledgeGraph as KnowledgeGraphType,
} from "@/utils/requests";
import { RepositoryForm } from "@/components/RepositoryForm";
import { PrepromptCard } from "@/components/PrepromptCard";
import { TextInputCard } from "@/components/TextInputCard";
import { ResponseCard } from "@/components/ResponseCard";

export default function Dashboard() {
  const [githubUrl, setGithubUrl] = useState(() => {
    return localStorage.getItem("githubUrl") || "";
  });

  const [path, setPath] = useState(() => {
    return localStorage.getItem("selectedPath") || "";
  });

  const [selectedModel, setSelectedOption] = useState<string | null>(() => {
    return localStorage.getItem("selectedOption") || null;
  });

  const [preprompt, setPreprompt] = useState(() => {
    return localStorage.getItem("preprompt") || "";
  });

  const [leftPanelText, setLeftPanelText] = useState(() => {
    return localStorage.getItem("leftPanelText") || "";
  });

  const [markdownContent, setMarkdownContent] = useState("");
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [options, setOptions] = useState([]);
  const [openAIKey, setOpenAIKey] = useState("");
  const [jsonData, setJsonData] = useState({});
  const [isMultiple, setIsMultiple] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [graph, setGraph] = useState<KnowledgeGraphType>({ triplets: [] });
  const [evaluation, setEvaluation] = useState<EvaluateSchemaPromptResponse>({
    fits: false,
    reason: "",
  });
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    if (githubUrl.includes("github.com")) {
      const [user, repo] = convertGitHubURLToUserRepo(githubUrl);
      setGithubUrl(`${user}/${repo}`);
      const combinedUserRepo = `${user}/${repo}`;
      listMdFiles(combinedUserRepo).then((data) => {
        setAvailableFiles(
          data.filter((file) => isMdModel(combinedUserRepo, file))
        );
      });
    } else {
      listMdFiles(githubUrl).then(async (data) => {
        const filteredFiles = await Promise.all(
          data.map((file) => isMdModel(githubUrl, file))
        ).then((results) => data.filter((_, index) => results[index]));
        setAvailableFiles(filteredFiles);
      });
    }
    localStorage.setItem("githubUrl", githubUrl);
  }, [githubUrl]);

  useEffect(() => {
    fetchFromGitHub(githubUrl, path).then((data) => {
      const objects = getMdModelObjects(data);
      // @ts-ignore
      setOptions(objects);
      setMarkdownContent(data);
    });
    localStorage.setItem("selectedPath", path);
  }, [path]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem("selectedOption", selectedModel);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (leftPanelText) {
      localStorage.setItem("leftPanelText", leftPanelText);
    }
  }, [leftPanelText]);

  useEffect(() => {
    if (preprompt) {
      localStorage.setItem("preprompt", preprompt);
    }
  }, [preprompt]);

  useEffect(() => {
    localStorage.setItem("preprompt", preprompt);
  }, [preprompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModel) {
      setIsLoading(true);
      setIsEvaluating(true);
      const schema = await getJSONSchema(markdownContent, selectedModel);

      // Run all three operations in parallel
      try {
        const [evaluation, graph, jsonData] = await Promise.all([
          evaluateSchemaPrompt(leftPanelText, schema, openAIKey, preprompt),
          createKnowledgeGraph(leftPanelText, preprompt, openAIKey),
          extractToSchema(leftPanelText, schema, openAIKey, isMultiple, preprompt)
        ]);

        setEvaluation(evaluation);
        setGraph(graph);
        setJsonData(jsonData);
      } catch (error) {
        setJsonData({});
      } finally {
        setIsEvaluating(false);
        setIsLoading(false);
      }
    }
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "data.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#0d1117] text-white">
        <main className="relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-purple-500/30 rounded-full blur-3xl" />
            <div className="absolute top-40 right-40 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-[1400px] mx-auto px-4 pt-20 pb-16">
            <h1 className="mb-6 text-4xl font-semibold text-center text-white md:text-5xl">
              <RiStackLine className="inline-block mr-2" /> MD-Models Chat
            </h1>
            <p className="mb-8 text-xl text-center text-gray-400">
              Turn your unstructured data into structured data
            </p>

            <RepositoryForm
              githubUrl={githubUrl}
              path={path}
              selectedModel={selectedModel}
              openAIKey={openAIKey}
              availableFiles={availableFiles}
              options={options}
              isLoading={isLoading}
              onGithubUrlChange={setGithubUrl}
              onPathChange={setPath}
              onModelChange={setSelectedOption}
              onOpenAIKeyChange={setOpenAIKey}
              onSubmit={handleSubmit}
            />

            <PrepromptCard
              preprompt={preprompt}
              onChange={setPreprompt}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 [&>*]:h-full">
              <TextInputCard
                text={leftPanelText}
                isMultiple={isMultiple}
                onTextChange={setLeftPanelText}
                onMultipleChange={setIsMultiple}
              />

              <ResponseCard
                isEvaluating={isEvaluating}
                jsonData={jsonData}
                evaluation={evaluation}
                graph={graph}
                onDownload={handleDownload}
              />
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
