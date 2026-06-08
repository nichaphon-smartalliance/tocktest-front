"use client";

import { useState } from "react";
import { Button, Input, Spin, Empty, Row, Col, Tooltip } from "antd";
import { message } from "@/lib/antd-static";
import { PlusOutlined, ReloadOutlined, GithubOutlined, SearchOutlined } from "@ant-design/icons";
import { useRepositoryList } from "@/hooks/repository";
import { useGithubTokens } from "@/hooks/repository";
import RepoCard from "./RepoCard";
import { AddTokenModal } from "./Modal";

export default function DashboardContent() {
  const [search, setSearch] = useState("");
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const { repositories, isLoading, refetch } = useRepositoryList({ search: search || undefined });
  const { syncRepositories, isSyncing } = useGithubTokens();

  const handleSync = async () => {
    try {
      const result = await syncRepositories();
      message.success(`ซิงค์สำเร็จ: ${result.synced} repositories`);
      refetch();
    } catch {
      message.error("ซิงค์ไม่สำเร็จ กรุณาตรวจสอบ GitHub Token");
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>แดชบอร์ด</h1>
          <p style={{ margin: 0, opacity: 0.5, fontSize: 13 }}>
            {repositories.length} repositories
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Input
            placeholder="ค้นหา repository..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Button icon={<GithubOutlined />} onClick={() => setTokenModalOpen(true)}>
            GitHub Token
          </Button>
          <Tooltip title="ซิงค์ repositories จาก GitHub">
            <Button
              type="primary"
              icon={<ReloadOutlined spin={isSyncing} />}
              loading={isSyncing}
              onClick={handleSync}
            >
              ซิงค์
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <Spin spinning={isLoading}>
        {!isLoading && repositories.length === 0 ? (
          <Empty
            image={<GithubOutlined style={{ fontSize: 64, opacity: 0.2 }} />}
            description={
              <span>
                ยังไม่มี repository
                <br />
                <span style={{ opacity: 0.5, fontSize: 13 }}>
                  เพิ่ม GitHub Token แล้วกด ซิงค์ เพื่อดึงข้อมูล
                </span>
              </span>
            }
            style={{ padding: "80px 0" }}
          >
            <Button icon={<PlusOutlined />} onClick={() => setTokenModalOpen(true)}>
              เพิ่ม GitHub Token
            </Button>
          </Empty>
        ) : (
          <Row gutter={[16, 16]}>
            {repositories.map((repo) => (
              <Col key={repo.id} xs={24} sm={12} md={8} xl={6}>
                <RepoCard repo={repo} />
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      <AddTokenModal open={tokenModalOpen} onClose={() => setTokenModalOpen(false)} />
    </div>
  );
}
