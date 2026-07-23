"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Button, Card, ErrorBanner, Field, SuccessBanner, TextInput } from "@/components/ui";
import { apiGet, apiPost, getSession } from "@/lib/apiClient";
import { corporateNavLinks } from "@/lib/navLinks";

interface Employee {
  userId: string;
  email?: string;
  phone?: string;
}

export default function CorporateEmployeesPage() {
  const router = useRouter();
  const [accountId, setAccountId] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ account: { id: string } }>("/corporate/me", session.accessToken).then(async ({ status, data }) => {
      if (status !== 200) return;
      setAccountId(data.account.id);
      const emp = await apiGet<{ employees: Employee[] }>(`/corporate/${data.account.id}/employees`, session.accessToken);
      if (emp.status === 200) setEmployees(emp.data.employees);
    });
  }

  useEffect(load, [router]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const session = getSession()!;
    const { status, data } = await apiPost<{ error?: string }>(
      `/corporate/${accountId}/employees`,
      { email, phone, password },
      session.accessToken
    );
    setLoading(false);
    if (status !== 201) {
      setError(
        data.error === "validation_error"
          ? "Please check the email, phone, and password fields."
          : "Couldn't add this employee."
      );
      return;
    }
    setSuccess("Employee added.");
    setEmail("");
    setPhone("");
    setPassword("");
    load();
  }

  return (
    <AppShell navLinks={corporateNavLinks} activeHref="/corporate/employees" roleLabel="Corporate Admin">
      <h1 className="text-xl font-semibold text-paper mb-6">Employees</h1>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <Card className="mb-6">
        <h2 className="font-medium text-paper mb-3">Add an employee</h2>
        <form onSubmit={onAdd}>
          <Field label="Email">
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Phone">
            <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080XXXXXXXX" required />
          </Field>
          <Field label="Temporary password" hint="They can change this after logging in">
            <TextInput type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            Add employee
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        {employees.map((e) => (
          <Card key={e.userId} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-paper">{e.email}</p>
              <p className="text-sm text-paper-dim">{e.phone}</p>
            </div>
          </Card>
        ))}
        {employees.length === 0 && <p className="text-sm text-paper-faint">No employees added yet.</p>}
      </div>
    </AppShell>
  );
}
