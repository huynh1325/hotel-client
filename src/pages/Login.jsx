import React, { useState } from "react";
import { Form, Input, Button, Card } from "antd";
import { toast } from "react-toastify";
import { loginApi } from "../utils/api";

const Login = () => {

    const onFinish = async (values) => {
        const res = await loginApi(values.name, values.password);

        console.log("Login response:", res);

        if (res.statusCode) {
            if (res.statusCode === 401) {
            toast.error("Sai tài khoản hoặc mật khẩu");
            } else {
            toast.error(res.message || "Đăng nhập thất bại");
            }
            return;
        }

        localStorage.setItem("access_token", res.access_token);
        sessionStorage.setItem("user", JSON.stringify(res.user));

        toast.success("Đăng nhập thành công");
        window.location.href = "/";
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
