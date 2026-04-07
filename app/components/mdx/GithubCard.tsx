"use client";

import React, { useEffect, useState } from "react";

interface RepoData {
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks: number;
  license: { spdx_id: string } | null;
  owner: { avatar_url: string };
}

interface GithubCardProps {
  repo?: string;
  children?: React.ReactNode;
}

export function GithubCard({ repo }: GithubCardProps) {
  const [data, setData] = useState<RepoData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!repo || !repo.includes("/")) return;
    fetch(`https://api.github.com/repos/${repo}`, {
      referrerPolicy: "no-referrer",
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [repo]);

  if (!repo || !repo.includes("/")) {
    return null;
  }

  const [owner, repoName] = repo.split("/");
  const fmt = (n: number) =>
    Intl.NumberFormat("en-us", {
      notation: "compact",
      maximumFractionDigits: 1,
    })
      .format(n)
      .replace(/\u202f/g, "");

  return (
    <a
      className={`card-github${loading ? " fetch-waiting" : ""}${error ? " fetch-error" : ""}`}
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="gc-titlebar">
        <div className="gc-titlebar-left">
          <div className="gc-owner">
            <div
              className="gc-avatar"
              style={
                data
                  ? {
                      backgroundImage: `url(${data.owner.avatar_url})`,
                      backgroundColor: "transparent",
                    }
                  : undefined
              }
            />
            <div className="gc-user">{owner}</div>
          </div>
          <div className="gc-divider">/</div>
          <div className="gc-repo">{repoName}</div>
        </div>
        <div className="github-logo" />
      </div>
      <div className="gc-description">
        {loading
          ? "Loading..."
          : data?.description?.replace(/:[a-zA-Z0-9_]+:/g, "") ||
            "No description"}
      </div>
      <div className="gc-infobar">
        <div className="gc-stars">
          {data ? fmt(data.stargazers_count) : "—"}
        </div>
        <div className="gc-forks">{data ? fmt(data.forks) : "—"}</div>
        <div className="gc-license">
          {data?.license?.spdx_id || "no-license"}
        </div>
      </div>
    </a>
  );
}
