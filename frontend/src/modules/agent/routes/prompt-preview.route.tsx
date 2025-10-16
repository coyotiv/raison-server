import { Copy, ExternalLink } from "lucide-react";
import { useOutletContext, useParams } from "react-router";
import { Response } from "~/components/ai-elements/response";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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

export const PromptPreviewPage = () => {
  const { agentId, promptId } = useParams();
  const { agents } = useOutletContext<AgentsOutletContext>();

  const agent = agents.find((a) => a._id === agentId);
  const prompt = agent?.prompts.find((p) => p._id === promptId);

  const handleCopyPrompt = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt.systemPrompt);
    }
  };

  if (!prompt || !agent) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Prompt not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-2xl leading-[30px]">{prompt.name}</h2>
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
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Open in Editor
          </Button>
        </div>
      </div>

      {/* Prompt Info */}
      <div className="border-b px-6 py-4">
        <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
          <div>
            <dt className="text-muted-foreground text-xs">Character Count</dt>
            <dd className="mt-1 font-medium">{prompt.systemPrompt.length.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Token Size</dt>
            <dd className="mt-1 font-medium">~{estimateTokens(prompt.systemPrompt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Last Updated</dt>
            <dd className="mt-1 font-medium">{new Date(prompt.updatedAt).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Created By</dt>
            <dd className="mt-1 flex items-center gap-1">
              <Avatar className="h-5 w-5">
                <AvatarImage src="" alt={prompt.createdBy} />
                <AvatarFallback className="bg-blue-600 text-[10px] text-white">
                  {getUserInitials(prompt.createdBy)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{prompt.createdBy}</span>
            </dd>
          </div>
        </div>
      </div>

      {/* System Prompt Content */}
      <div className="flex-1 overflow-hidden">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base">System Prompt</h3>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyPrompt}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[calc(100%-57px)]">
          <div className="p-6">
            <Response className="prose prose-sm dark:prose-invert max-w-none">{prompt.systemPrompt}</Response>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
