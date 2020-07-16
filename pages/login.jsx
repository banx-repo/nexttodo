import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Avatar,
  message,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Router from "next/router";
import { useState } from "react";
import Link from "next/link";
import Head from "next/head";

export default function NormalLoginForm() {
  const [submit, _submit] = useState(false);

  const onFinish = async (data) => {
    _submit(true);

    if (data.remember) {
      localStorage.setItem("username", data.username);
    } else {
      localStorage.removeItem("username");
    }

    const res = await fetch("/api/login", {
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
    <Row
      justify="center"
      align="middle"
      style={{ padding: "50px 0", minHeight: "100vh" }}
    >
      <Head>
        <title>Đăng nhập</title>
      </Head>
      <Col xs={22} sm={14} md={10} lg={8} xl={6}>
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Đăng nhập{" "}
          <Avatar src="logo.svg" shape="square" alt="Todolist" size="large" />
        </Typography.Title>

        <Form
          name="normal_login"
          className="login-form"
          onFinish={onFinish}
          layout="vertical"
          initialValues={{
            remember: true,
            username:
              typeof window !== "undefined"
                ? localStorage.getItem("username")
                : "",
          }}
          hideRequiredMark
        >
          <Form.Item
            name="username"
            label="Tài khoản"
            hasFeedback
            valuePropName="value"
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

          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox style={{ marginBottom: "10px" }}>
              Ghi nhớ tài khoản
            </Checkbox>
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
              Đăng nhập
            </Button>
            <Link href="/signup">
              <a>Đăng ký</a>
            </Link>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
}
