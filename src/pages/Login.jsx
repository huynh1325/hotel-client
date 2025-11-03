import React from "react";
import { Form, Input, Button, Card } from "antd";
import { toast } from "react-toastify";
import { loginApi } from "../utils/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await loginApi(values.name, values.password);

      if (res.data?.access_token && res.data?.user) {
        localStorage.setItem("access_token", res.data.access_token);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));

        toast.success("Đăng nhập thành công");
        navigate("/", { replace: true });
      } else {
        toast.error("Sai tài khoản hoặc mật khẩu");
      }
    } catch (err) {
      toast.error("Lỗi đăng nhập");
      console.error(err);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        title="Đăng nhập"
        style={{
          width: 400,
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên đăng nhập"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
