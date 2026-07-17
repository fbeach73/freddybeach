"use client";

import { useChat } from "@ai-sdk/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const H1: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = (props) => (
  <h1 className="mt-2 mb-3 text-2xl font-bold" {...props} />
);
const H2: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = (props) => (
  <h2 className="mt-2 mb-2 text-xl font-semibold" {...props} />
);
const H3: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = (props) => (
  <h3 className="mt-2 mb-2 text-lg font-semibold" {...props} />
);
const Paragraph: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = (
  props
) => <p className="mb-3 leading-7 text-sm" {...props} />;
const UL: React.FC<React.HTMLAttributes<HTMLUListElement>> = (props) => (
  <ul className="mb-3 ml-5 list-disc space-y-1 text-sm" {...props} />
);
const OL: React.FC<React.OlHTMLAttributes<HTMLOListElement>> = (props) => (
  <ol className="mb-3 ml-5 list-decimal space-y-1 text-sm" {...props} />
);
const LI: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = (props) => (
  <li className="leading-6" {...props} />
);
const Anchor: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = (
  props
) => (
  <a
    className="underline underline-offset-2 text-primary hover:opacity-90"
    target="_blank"
    rel="noreferrer noopener"
    {...props}
  />
);
const Blockquote: React.FC<React.BlockquoteHTMLAttributes<HTMLElement>> = (
  props
) => (
  <blockquote
    className="mb-3 border-l-2 border-border pl-3 text-muted-foreground"
    {...props}
  />
);
const Code: Components["code"] = ({ children, className, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  const isInline = !match;

  if (isInline) {
    return (
      <code className="rounded bg-muted px-1 py-0.5 text-xs" {...props}>
        {children}
      </code>
    );
  }
  return (
    <pre className="mb-3 w-full overflow-x-auto rounded-md bg-muted p-3">
      <code className="text-xs leading-5" {...props}>
        {children}
      </code>
    </pre>
  );
};
const HR: React.FC<React.HTMLAttributes<HTMLHRElement>> = (props) => (
  <hr className="my-4 border-border" {...props} />
);
const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = (
  props
) => (
  <div className="mb-3 overflow-x-auto">
    <table className="w-full border-collapse text-sm" {...props} />
  </div>
);
const TH: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = (props) => (
  <th
    className="border border-border bg-muted px-2 py-1 text-left"
    {...props}
  />
);
const TD: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = (props) => (
  <td className="border border-border px-2 py-1" {...props} />
);

const markdownComponents: Components = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: Paragraph,
  ul: UL,
  ol: OL,
  li: LI,
  a: Anchor,
  blockquote: Blockquote,
  code: Code,
  hr: HR,
  table: Table,
  th: TH,
  td: TD,
};

type TextPart = { type?: string; text?: string };
type MaybePartsMessage = {
  display?: ReactNode;
  parts?: TextPart[];
  content?: TextPart[] | string;
};

/**
 * Type guard to check if a message has the expected structure
 */
function isValidMessage(message: unknown): message is MaybePartsMessage {
  if (typeof message !== "object" || message === null) {
    return false;
  }
  return true;
}

function renderMessageContent(message: unknown): ReactNode {
  // Validate message structure
  if (!isValidMessage(message)) {
    return null;
  }

  // Handle display property
  if (message.display) return message.display;

  // Handle parts array
  if (Array.isArray(message.parts)) {
    return message.parts.map((p, idx) =>
      p?.type === "text" && p.text ? (
        <ReactMarkdown key={idx} components={markdownComponents}>
          {p.text}
        </ReactMarkdown>
      ) : null
    );
  }

  // Handle content as array
  if (Array.isArray(message.content)) {
    return message.content.map((p, idx) =>
      p?.type === "text" && p.text ? (
        <ReactMarkdown key={idx} components={markdownComponents}>
          {p.text}
        </ReactMarkdown>
      ) : null
    );
  }

  // Handle content as string (common format)
  if (typeof message.content === "string") {
    return (
      <ReactMarkdown components={markdownComponents}>
        {message.content}
      </ReactMarkdown>
    );
  }

  return null;
}

interface ChatClientProps {
  user: {
    name: string;
  };
}

export function ChatClient({ user }: ChatClientProps) {
  const [outOfCredits, setOutOfCredits] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const { messages, sendMessage, status } = useChat({
    onError: (error) => {
      // The default transport rethrows the response body as the error message
      try {
        const body = JSON.parse(error.message);
        if (body?.error === "Insufficient credits") {
          setOutOfCredits(true);
          return;
        }
      } catch {
        // not JSON, fall through to generic handling
      }
      setChatError("Something went wrong. Please try again.");
    },
  });
  const [input, setInput] = useState("");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h1 className="text-2xl font-bold">AI Chat</h1>
          <span className="text-sm text-muted-foreground">
            Welcome, {user.name}!
          </span>
        </div>

        <div className="min-h-[50vh] overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              Start a conversation with AI
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                  : "bg-muted max-w-[80%]"
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {message.role === "user" ? "You" : "AI"}
              </div>
              <div>{renderMessageContent(message)}</div>
            </div>
          ))}
        </div>

        {outOfCredits && (
          <div className="mb-4 border-2 border-nb-border bg-nb-yellow p-4 text-black">
            <p className="font-bold">You&apos;re out of credits.</p>
            <p className="text-sm">
              Free credits top back up every month, or{" "}
              <Link href="/pricing" className="underline underline-offset-2 hover:no-underline">
                see plans and credit packs
              </Link>{" "}
              to keep chatting today.
            </p>
          </div>
        )}
        {chatError && !outOfCredits && (
          <div className="mb-4 border-2 border-nb-border bg-destructive/10 p-4 text-sm">
            {chatError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const text = input.trim();
            if (!text) return;
            setChatError(null);
            sendMessage({ role: "user", parts: [{ type: "text", text }] });
            setInput("");
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            type="submit"
            disabled={!input.trim() || status === "streaming"}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
