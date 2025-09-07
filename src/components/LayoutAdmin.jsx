import React, { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
} from "antd";
import {
  HomeOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BarChartOutlined,
  HistoryOutlined
} from "@ant-design/icons";
import { Outlet, Link } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const LayoutAdmin = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            color: "white",
            fontSize: 16,
            textAlign: "center",
            padding: 20,
            fontWeight: "bold",
          }}
        >
          Hotel Admin
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/">Phòng</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<BarChartOutlined />}>
            <Link to="/statistics">Thống kê</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<HistoryOutlined />}>
            <Link to="/bookinghistory">Lịch sử đặt phòng</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar icon={<UserOutlined />} />
            <span>Admin</span>
          </div>
        </Header>

        <Content style={{ margin: "16px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutAdmin;
