import { ChevronRight, GripVertical, Plus, Save } from "lucide-react";
import { Outlet, useNavigate, useOutletContext, useParams } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Item, ItemContent, ItemDescription, ItemTitle } from "~/components/ui/item";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { Agent, PromptStatus } from "../types";

interface AgentsOutletContext {
  agents: Agent[];
}

const getStatusVariant = (status: PromptStatus) => {
  switch (status) {
    case "production":
      return "success" as const;
    case "draft":
      return "warning" as const;
    case "pending":
      return "info" as const;
    default:
      return "secondary" as const;
  }
};

const getUserInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const estimateTokens = (text: string): number => {
  // Rough estimate: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
};

export const AgentDetailPage = () => {
  const { agentId, promptId } = useParams();
  const navigate = useNavigate();
  const { agents } = useOutletContext<AgentsOutletContext>();

  const agent = agents.find((a) => a._id === agentId);

  const handlePromptClick = (pId: string) => {
    navigate(`/agents/${agentId}/preview/${pId}`);
  };

  const totalTokens = agent?.prompts.reduce((sum, prompt) => sum + estimateTokens(prompt.systemPrompt), 0) || 0;

  if (!agent) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Agent not found</p>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Left Panel - Agent Details */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Agent Header */}
          <div className="sticky top-0 z-10 border-b bg-background p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="font-semibold text-2xl">{agent.name}</h2>
                <p className="text-muted-foreground text-sm">{agent.description}</p>
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          {/* Agent Info */}
          <div className="border-b px-6 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-5">
              <div>
                <dt className="text-muted-foreground text-xs">Prompts</dt>
                <dd className="mt-1 font-medium">{agent.prompts.length}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Total Tokens</dt>
                <dd className="mt-1 font-medium">~{totalTokens.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Last Updated</dt>
                <dd className="mt-1 font-medium">{new Date(agent.updatedAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Last Used</dt>
                <dd className="mt-1 font-medium">2 hours ago</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Created By</dt>
                <dd className="mt-1 flex items-center gap-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src="" alt={agent.createdBy} />
                    <AvatarFallback className="bg-blue-600 text-[10px] text-white">
                      {getUserInitials(agent.createdBy)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{agent.createdBy}</span>
                </dd>
              </div>
            </div>
          </div>

          {/* Prompts Section */}
          <div className="flex-1 overflow-hidden">
            <div className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-base">Prompts</h3>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-3.5 w-3.5" />
                  Add Prompt
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-73px)]">
              <div className="p-6">
                <div className="space-y-4">
                  {agent.prompts.length > 0 ? (
                    agent.prompts.map((prompt) => {
                      const isSelected = promptId === prompt._id;
                      return (
                        <Item
                          key={prompt._id}
                          variant="outline"
                          className={`group cursor-pointer transition-all ${
                            isSelected ? "border-primary shadow-sm" : ""
                          }`}
                          onClick={() => handlePromptClick(prompt._id)}
                          asChild
                        >
                          <button type="button" className="relative w-full text-left">
                            {/* Quick View Arrow - Top Right */}
                            <div className="absolute top-4 right-4">
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground text-xs opacity-0 transition-opacity group-hover:opacity-100">
                                  Quick View
                                </span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>

                            <div className="flex items-start gap-4">
                              <div className="mt-1 flex-shrink-0">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <ItemContent className="flex-1 gap-4 pr-24">
                                <div className="space-y-3">
                                  <div>
                                    <ItemTitle className="font-semibold text-base">{prompt.name}</ItemTitle>
                                    <div className="relative mt-2">
                                      <ItemDescription className="line-clamp-4 text-sm leading-relaxed">
                                        {prompt.systemPrompt}
                                      </ItemDescription>
                                      <div
                                        className={`pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-background to-transparent transition-all`}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant={getStatusVariant(prompt.status)} className="capitalize">
                                      {prompt.status}
                                    </Badge>
                                    <Badge variant="purple" className="font-mono">
                                      {prompt.version}
                                    </Badge>
                                    {prompt.tags.length > 0 && (
                                      <>
                                        <div className="mx-1 h-4 w-px bg-border" />
                                        {prompt.tags.map((tag) => (
                                          <Badge key={tag} variant="outline">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-muted-foreground text-xs">
                                    <span>Updated {new Date(prompt.updatedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </ItemContent>
                            </div>
                          </button>
                        </Item>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                      <p className="text-muted-foreground text-sm">No prompts yet</p>
                      <Button variant="outline" size="sm" className="mt-4 gap-2">
                        <Plus className="h-3.5 w-3.5" />
                        Add First Prompt
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right Panel - Prompt Details */}
      <ResizablePanel defaultSize={50} minSize={30}>
        {promptId ? (
          <Outlet context={{ agents }} />
        ) : (
          <div className="flex h-full items-center justify-center overflow-auto bg-muted/30">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Select a prompt for quick view</p>
            </div>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
