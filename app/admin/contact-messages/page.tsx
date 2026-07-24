"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card, TextArea } from "@/components/ui";
import { apiGet, apiPut, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  adminNotes?: string;
  createdAt: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  general: "General",
  support: "Support",
  press: "Press",
  partnership: "Partnership",
  safety_concern: "Safety concern",
};

export default function AdminContactMessagesPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<{ messages: ContactMessage[] }>("/admin/contact-messages", session.accessToken).then(
      ({ status, data }) => {
        if (status === 200) setMessages(data.messages);
      }
    );
  }

  useEffect(load, [router]);

  async function updateStatus(id: string, status: "in_progress" | "resolved") {
    const session = getSession()!;
    await apiPut(`/admin/contact-messages/${id}`, { status, adminNotes: notesDraft[id] }, session.accessToken);
    load();
  }

  const sorted = messages
    ? [...messages].sort((a, b) => (a.status === "resolved" ? 1 : 0) - (b.status === "resolved" ? 1 : 0))
    : [];

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/contact-messages" roleLabel="Admin">
      <h1 className="text-xl font-semibold text-paper mb-2">Contact inbox</h1>
      <p className="text-sm text-paper-dim mb-6">
        Inbound messages from the public Contact page and the logged-in Support form.
      </p>

      <div className="space-y-4">
        {sorted.map((m) => (
          <Card key={m.id} className={m.status === "new" ? "border-amber/30" : ""}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-paper">{m.name}</span>
                <Badge tone={m.category === "safety_concern" ? "danger" : "neutral"}>
                  {CATEGORY_LABEL[m.category] ?? m.category}
                </Badge>
                <Badge tone={m.status === "resolved" ? "success" : m.status === "in_progress" ? "warning" : "info"}>
                  {m.status.replace("_", " ")}
                </Badge>
              </div>
              <span className="text-xs text-paper-faint">
                {new Date(m.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
            <p className="text-xs text-paper-faint mb-2">
              {m.email}
              {m.phone ? ` · ${m.phone}` : ""}
            </p>
            <p className="text-sm text-paper-dim mb-3">{m.message}</p>
            {m.adminNotes && <p className="text-sm text-paper-faint bg-ink-850 rounded-lg p-2 mb-3">{m.adminNotes}</p>}

            {m.status !== "resolved" && (
              <div className="border-t border-ink-border pt-3 space-y-2">
                <TextArea
                  placeholder="Internal notes (optional)"
                  rows={2}
                  value={notesDraft[m.id] ?? ""}
                  onChange={(e) => setNotesDraft({ ...notesDraft, [m.id]: e.target.value })}
                />
                <div className="flex gap-2">
                  {m.status === "new" && (
                    <Button onClick={() => updateStatus(m.id, "in_progress")}>Mark in progress</Button>
                  )}
                  <Button variant="secondary" onClick={() => updateStatus(m.id, "resolved")}>
                    Mark resolved
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
        {messages && messages.length === 0 && <p className="text-sm text-paper-faint">No messages yet.</p>}
      </div>
    </AppShell>
  );
}
