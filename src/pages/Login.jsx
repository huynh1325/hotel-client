import React, { useState } from "react";
import { Form, Input, Button, Card } from "antd";
import { toast } from "react-toastify";
import { loginApi } from "../utils/api";
import { useNavigate } from "react-router-dom";

const Login = () => {

  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await loginApi(values.name, values.password);

      if (res?.access_token && res?.user) {
        localStorage.setItem("access_token", res.access_token);
        sessionStorage.setItem("user", JSON.stringify(res.user));

        toast.success("Đăng nhập thành công");
        navigate("/", { replace: true });
      } else {
        throw new Error("Thiếu access_token hoặc user trong phản hồi");
      }
    } catch (err) {
      console.error(err);
    }
  };
  
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <Card title="Login" style={{ width: 400 }}>
                <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: "Please input your name!" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Please input your password!" }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                    Login
                    </Button>
                </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
