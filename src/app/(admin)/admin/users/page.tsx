"use client";

import { getUsers } from "@/app/actions";
import Link from "next/link";
import { Eye, User, Plus } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const { dict } = useLanguage();

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto animate-entry">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{dict.common.users}</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-textMuted bg-surface px-3 py-1 rounded-full border border-border">
            {dict.common.total}: {users.length}
          </div>
          <Link
            href="/admin/users/create"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryHover transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {dict.common.add}
          </Link>
        </div>
      </div>

      <div className="glass rounded-3xl border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-white/5 border-b border-white/5 backdrop-blur-md">
            <tr>
              <th className="p-4 font-medium text-textMuted">ID</th>
              <th className="p-4 font-medium text-textMuted">{dict.common.name}</th>
              <th className="p-4 font-medium text-textMuted">Email</th>
              <th className="p-4 font-medium text-textMuted">{dict.common.releases}</th>
              <th className="p-4 font-medium text-textMuted">{dict.common.registered}</th>
              <th className="p-4 font-medium text-textMuted">{dict.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-textMuted">
                  {dict.common.noUsers}
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <td className="p-6 font-mono text-primary">#{user.publicId}</td>
                  <td className="p-6 font-medium flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center border border-white/10">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-textMuted" />
                      )}
                    </div>
                    {user.name}
                  </td>
                  <td className="p-6 text-textMuted">{user.email}</td>
                  <td className="p-6">{user._count.releases}</td>
                  <td className="p-6 text-sm text-textMuted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-6">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-white/5 hover:bg-primary hover:text-white px-4 py-2 text-sm font-medium transition-all transform hover:scale-105 active:scale-95"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {dict.common.profile}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}