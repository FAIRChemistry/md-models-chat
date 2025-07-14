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
  uploadFilesToOpenAI,
  OpenAIFileReference,
} from "@/utils/requests";
import { RepositoryForm } from "@/components/RepositoryForm";
import { UploadForm } from "@/components/UploadForm";
import { InstructionCard } from "@/components/InstructionCard";
import { FileInputCard } from "@/components/FileInputCard";
import { ResponseModal } from "@/components/ResponseModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UploadedFile } from "@/components/ui/file-chip";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "github";
  });

  const [githubUrl, setGithubUrl] = useState(() => {
    return localStorage.getItem("githubUrl") || "https://github.com/Strenda-biocatalysis/Strenda-biocatalysis";
  });

  const [path, setPath] = useState(() => {
    return localStorage.getItem("selectedPath") || "";
  });

  const [fileName, setFileName] = useState(() => {
    return localStorage.getItem("uploadedFileName") || "";
  });

  const [_, setUploadedContent] = useState(() => {
    return localStorage.getItem("uploadedContent") || "";
  });

  const [selectedModel, setSelectedOption] = useState<string | null>(() => {
    return localStorage.getItem("selectedOption") || null;
  });

  const [uploadedSelectedModel, setUploadedSelectedOption] = useState<string | null>(() => {
    return localStorage.getItem("uploadedSelectedOption") || null;
  });

  const [mainText, setMainText] = useState(() => {
    return localStorage.getItem("mainText") || "";
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [markdownContent, setMarkdownContent] = useState("");
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [options, setOptions] = useState([]);
  const [uploadedOptions, setUploadedOptions] = useState([]);
  const [openAIKey, setOpenAIKey] = useState("");
  const [jsonData, setJsonData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [graph, setGraph] = useState<KnowledgeGraphType>({ triplets: [] });
  const [evaluation, setEvaluation] = useState<EvaluateSchemaPromptResponse>({
    fits: false,
    reason: "",
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

  // Response settings
  const [responseSettings, setResponseSettings] = useState(() => {
    const stored = localStorage.getItem("responseSettings");
    return stored ? JSON.parse(stored) : {
      enableSchemaEvaluation: true,
      enableKnowledgeGraph: true,
      enableJsonExtraction: true,
      enableMultipleOutputs: false,
      selectedModel: "",
    };
  });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "github" && githubUrl.includes("github.com")) {
      const [user, repo] = convertGitHubURLToUserRepo(githubUrl);
      setGithubUrl(`${user}/${repo}`);
      const combinedUserRepo = `${user}/${repo}`;
      listMdFiles(combinedUserRepo).then((data) => {
        setAvailableFiles(
          data.filter((file) => isMdModel(combinedUserRepo, file))
        );
      });
    } else if (activeTab === "github") {
      listMdFiles(githubUrl).then(async (data) => {
        const filteredFiles = await Promise.all(
          data.map((file) => isMdModel(githubUrl, file))
        ).then((results) => data.filter((_, index) => results[index]));
        setAvailableFiles(filteredFiles);
      });
    }
    localStorage.setItem("githubUrl", githubUrl);
  }, [githubUrl, activeTab]);

  useEffect(() => {
    if (activeTab === "github" && githubUrl && path) {
      fetchFromGitHub(githubUrl, path).then((data) => {
        const objects = getMdModelObjects(data);
        // @ts-ignore
        setOptions(objects);
        setMarkdownContent(data);
      });
      localStorage.setItem("selectedPath", path);
    }
  }, [path, githubUrl, activeTab]);

  useEffect(() => {
    if (activeTab === "github" && selectedModel) {
      localStorage.setItem("selectedOption", selectedModel);
    } else if (activeTab === "upload" && uploadedSelectedModel) {
      localStorage.setItem("uploadedSelectedOption", uploadedSelectedModel);
    }
  }, [selectedModel, uploadedSelectedModel, activeTab]);

  useEffect(() => {
    if (mainText) {
      localStorage.setItem("mainText", mainText);
    }
  }, [mainText]);

  useEffect(() => {
    localStorage.setItem("responseSettings", JSON.stringify(responseSettings));
  }, [responseSettings]);

  const handleFileUpload = (content: string, name: string) => {
    setUploadedContent(content);
    setFileName(name);

    const objects = getMdModelObjects(content);
    // @ts-ignore
    setUploadedOptions(objects);
    setMarkdownContent(content);

    localStorage.setItem("uploadedContent", content);
    localStorage.setItem("uploadedFileName", name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentModel = activeTab === "github" ? selectedModel : uploadedSelectedModel;

    if (currentModel && mainText) {
      setIsLoading(true);
      setIsEvaluating(true);
      setIsResponseModalOpen(true);
      const schema = await getJSONSchema(markdownContent, currentModel);

      try {
        // Step 1: Upload files to OpenAI if any
        let fileReferences: OpenAIFileReference[] = [];
        if (uploadedFiles.length > 0) {
          fileReferences = await uploadFilesToOpenAI(uploadedFiles);
        }

        // Step 2: Run operations based on settings
        const operations = [];
        const selectedModelForApi = responseSettings.selectedModel;

        if (responseSettings.enableSchemaEvaluation) {
          operations.push(
            evaluateSchemaPrompt(mainText, schema, "", fileReferences, selectedModelForApi)
          );
        } else {
          operations.push(Promise.resolve({ fits: false, reason: "" } as EvaluateSchemaPromptResponse));
        }

        if (responseSettings.enableKnowledgeGraph) {
          operations.push(
            createKnowledgeGraph(mainText, "", fileReferences, selectedModelForApi)
          );
        } else {
          operations.push(Promise.resolve({ triplets: [] } as KnowledgeGraphType));
        }

        if (responseSettings.enableJsonExtraction) {
          operations.push(
            extractToSchema(mainText, schema, responseSettings.enableMultipleOutputs, "", fileReferences, selectedModelForApi)
          );
        } else {
          operations.push(Promise.resolve({}));
        }

        const [evaluation, graph, jsonData] = await Promise.all(operations);

        setEvaluation(evaluation as EvaluateSchemaPromptResponse);
        setGraph(graph as KnowledgeGraphType);
        setJsonData(jsonData);
      } catch (error) {
        console.error("Error during processing:", error);
        setJsonData({});
      } finally {
        setIsEvaluating(false);
        setIsLoading(false);
      }
    }
  };

  const handleFileInputUpload = (newFiles: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileInputRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleResponseSettingsChange = (key: string, value: boolean | string) => {
    setResponseSettings((prev: typeof responseSettings) => ({ ...prev, [key]: value }));
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

  const handleModalClose = () => {
    setIsResponseModalOpen(false);
    // Clear response data when modal is closed
    setJsonData({});
    setEvaluation({ fits: false, reason: "" });
    setGraph({ triplets: [] });
    setIsEvaluating(false);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#0d1117] text-white">
        <main className="relative">
          <div className="overflow-hidden absolute inset-0 pointer-events-none">
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="w-full md:w-1/4 py-6 px-2 shadow-lg rounded-xl bg-[#161b22] border border-gray-700">
                <TabsTrigger value="github" className="flex-1">GitHub Repository</TabsTrigger>
                <TabsTrigger value="upload" className="flex-1">Upload File</TabsTrigger>
              </TabsList>
              <TabsContent value="github">
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
              </TabsContent>
              <TabsContent value="upload">
                <UploadForm
                  fileName={fileName}
                  selectedModel={uploadedSelectedModel}
                  openAIKey={openAIKey}
                  options={uploadedOptions}
                  isLoading={isLoading}
                  onFileUpload={handleFileUpload}
                  onModelChange={setUploadedSelectedOption}
                  onOpenAIKeyChange={setOpenAIKey}
                  onSubmit={handleSubmit}
                />
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <InstructionCard
                  text={mainText}
                  onChange={setMainText}
                  onExtract={handleSubmit}
                  isLoading={isLoading}
                  settings={responseSettings}
                  onSettingsChange={handleResponseSettingsChange}
                />
              </div>
              <div className="lg:col-span-1">
                <FileInputCard
                  uploadedFiles={uploadedFiles}
                  onFileUpload={handleFileInputUpload}
                  onFileRemove={handleFileInputRemove}
                />
              </div>
            </div>
          </div>
        </main>

        <ResponseModal
          isOpen={isResponseModalOpen}
          onClose={handleModalClose}
          isEvaluating={isEvaluating}
          jsonData={jsonData}
          evaluation={evaluation}
          graph={graph}
          settings={responseSettings}
          onDownload={handleDownload}
          onSettingsChange={handleResponseSettingsChange}
        />
      </div>
    </TooltipProvider>
  );
}
