import { useState } from "react";
import { Upload, Form, Input, message } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import Router from "next/router";

export default function UploadAvatar(props) {
  const [url, _url] = useState(props.user.avatar);
  const [loading, _loading] = useState(false);
  const [ok, _ok] = useState(false);

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ chấp nhận file .JPG hoặc .PNG!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Kích thước file không vượt quá 2MB!");
    }
    _ok(isJpgOrPng && isLt2M);
  };

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      _loading(true);
      return;
    }

    if ((info.file.status = "done")) {
      ok && _url(URL.createObjectURL(info.file.originFileObj));
      _loading(false);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  const handleSubmit = async (values) => {
    const data = new FormData();
    data.append("avatar", values.upload.originFileObj);
    data.append("fullname", values.fullname);

    await fetch("/api/user", {
      method: "POST",
      body: data,
    })
      .then((_) => console.log(_))
      .catch((_) => console.log(_));

    props._modal(false);
    Router.reload();
  };

  const getFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }

    return e && e.file;
  };

  return (
    <Form
      onFinish={handleSubmit}
      initialValues={{ fullname: props.user.fullname }}
      layout="vertical"
      form={props.formRef}
      hideRequiredMark
    >
      <Form.Item
        label="Ảnh đại diện"
        name="upload"
        getValueFromEvent={getFile}
        valuePropName=""
      >
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          {url ? (
            <img src={url} alt="avatar" style={{ width: "100%" }} />
          ) : (
            uploadButton
          )}
        </Upload>
      </Form.Item>
      <Form.Item
        label="Tên hiển thị"
        name="fullname"
        rules={[{ required: true, message: "Làm người phải có tên chứ?" }]}
      >
        <Input />
      </Form.Item>
    </Form>
  );
}
