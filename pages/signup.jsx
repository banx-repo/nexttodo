import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Typography,
  Avatar,
  message,
} from "antd";
import { UserOutlined, LockOutlined, HeartOutlined } from "@ant-design/icons";
import Router from "next/router";
import { useState } from "react";
import Link from "next/link";
import Head from "next/head";

export default function NormalLoginForm() {
  const [submit, _submit] = useState(false);

  const onFinish = async (data) => {
    _submit(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.status === 200) {
      const location = res.headers.get("Location");
      Router.push(location);
      return;
    }

    if (res.status === 400 || res.status === 401 || res.status === 405) {
      const json = await res.json();

      message.error(json.message);
      _submit(false);
      return;
    }

    message.error("Lỗi không xác định!");
    _submit(false);
    return;
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Head>
        <title>Đăng ký</title>
      </Head>

      <Col span={6}>
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Đăng ký tài khoản{" "}
          <Avatar src="logo.svg" shape="square" alt="Todolist" size="large" />
        </Typography.Title>

        <Form
          name="normal_login"
          className="login-form"
          onFinish={onFinish}
          layout="vertical"
          hideRequiredMark
        >
          <Form.Item
            name="fullname"
            label="Họ tên"
            hasFeedback
            rules={[{ required: true }]}
          >
            <Input
              prefix={<HeartOutlined className="site-form-item-icon" />}
              placeholder="Fullname"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="username"
            label="Tài khoản"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tài khoản!",
              },
              () => ({
                validator(rule, value) {
                  if (!value) {
                    return Promise.resolve();
                  }

                  if (!/^[a-zA-Z]/.test(value)) {
                    return Promise.reject(
                      "Tài khoản phải bắt đầu bằng chữ cái!"
                    );
                  }

                  if (!/^.{5,10}$/.test(value)) {
                    return Promise.reject("Tài khoản phải dài 5 - 10 ký tự!");
                  }

                  if (!/^[a-zA-Z0-9]{5,10}$/.test(value)) {
                    return Promise.reject(
                      "Tài khoản không được chứa ký tự đặc biệt!"
                    );
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
              () => ({
                validator(rule, value) {
                  if (!value) {
                    return Promise.resolve();
                  }

                  if (!/^.{6,20}$/.test(value)) {
                    return Promise.reject("Tài khoản phải dài 6 - 20 ký tự!");
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="rePassword"
            hasFeedback
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận mật khẩu!",
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject("Mật khẩu xác nhận không đúng!");
                },
              }),
            ]}
            label="Xác nhận mật khẩu"
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Re-Password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              style={{ display: "block", width: "100%", marginBottom: "10px" }}
              loading={submit}
              disabled={submit}
              size="large"
            >
              Đăng ký
            </Button>
            <Link href="/login">
              <a>Đăng nhập</a>
            </Link>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
}
