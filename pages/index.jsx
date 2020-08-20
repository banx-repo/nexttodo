import Head from "next/head";
import cookies from "next-cookies";
import {
    Row,
    Col,
    Form,
    Input,
    Avatar,
    Menu,
    Dropdown,
    Modal,
    Space,
    Typography,
    Tabs,
    List,
    Checkbox,
    Spin,
    Button,
    Popconfirm,
    message,
} from "antd";
const { Title } = Typography;
const { TabPane } = Tabs;
import {
    LogoutOutlined,
    EditOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import query from "../lib/mysql";
import UploadAvatar from "../components/UploadAvatar";
import { useState, useRef, useEffect } from "react";
import jwt from "jsonwebtoken";
import Router from "next/router";
import useSWR, { mutate } from "swr";
import QueueAnim from "rc-queue-anim";

export default function Home({ user, list }) {
    const [modal, _modal] = useState(false);
    const [formRef] = Form.useForm();

    const [addForm] = Form.useForm();
    const [add, _add] = useState(false);
    const [checkField, _checkField] = useState();
    const [edit, _edit] = useState({});
    const [editContent, _editContent] = useState();
    const [editModal, _editModal] = useState(false);
    const modalInputRef = useRef();

    const [search, _search] = useState("");
    const reg = new RegExp(`(${search.trim().replace(/[ .,-]/g, "|")})`, "gi");

    useEffect(() => {
        editModal && modalInputRef.current && modalInputRef.current.focus();
    }, [editModal]);

    const { error, data } = useSWR(
        "/api/todo",
        (uri) =>
            fetch(uri)
                .then((_) => _.json())
                .catch((_) => {
                    throw _;
                }),
        {
            initialData: list,
        }
    );

    const handleLogout = () => {
        fetch("/api/logout")
            .then((_) => Router.push("/login"))
            .catch((_) => message.error("Lỗi không xác định!"));
    };

    const addNewTodo = async (data) => {
        _add(true);

        await fetch("/api/todo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then(async (_) => {
                if (_.status === 200) {
                    message.success(await _.json().then((_) => _.message));
                    await mutate("/api/todo");
                } else {
                    const json = await _.json();
                    message.error(json.message);
                }
            })
            .catch((_) => console.log(_));

        addForm.resetFields();
        _add(false);
    };

    const updateTodo = async (data) => {
        await fetch("/api/todo", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then(async (_) => {
                if (_.status === 200) {
                    message.success(await _.json().then((_) => _.message));
                    await mutate("/api/todo");
                } else {
                    const json = await _.json();
                    message.error(json.message);
                }
            })
            .catch((_) => console.log(_));

        _checkField();
    };

    const deleteTodo = async (id) => {
        console.log("Del");
        await fetch("/api/todo", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        })
            .then(async (_) => {
                if (_.status === 200) {
                    message.success(await _.json().then((_) => _.message));
                    await mutate("/api/todo");
                } else {
                    const json = await _.json();
                    message.error(json.message);
                }
            })
            .catch((_) => console.log(_));
    };

    const menu = (
        <Menu>
            <Menu.Item
                key="1"
                icon={<EditOutlined />}
                onClick={() => _modal(true)}
            >
                Edit Profile
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    if (error) {
        return (
            <h1
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                Lỗi tùm lum! 😵
            </h1>
        );
    }

    return (
        <Row justify="center" style={{ padding: "30px 0", minHeight: "100vh" }}>
            <Head>
                <title>Todolist</title>
            </Head>

            <Col xs={22} sm={18} md={14} lg={10} xl={8}>
                <Space direction="vertical" size={30} style={{ width: "100%" }}>
                    <Dropdown
                        overlay={menu}
                        placement="bottomCenter"
                        arrow
                        overlayStyle={{ width: "fit-content", minWidth: "" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "fit-content",
                                margin: "0 auto",
                            }}
                        >
                            <Avatar
                                size={100}
                                src={user.avatar ? user.avatar : "users/default.png"}
                                style={{
                                    boxShadow:
                                        "0 0 10px rgba(50, 130, 184, 0.5)",
                                    marginBottom: "10px",
                                }}
                            >
                                USER
                            </Avatar>
                            <Title level={3} style={{ marginBottom: "0" }}>
                                {user.fullname}
                            </Title>
                        </div>
                    </Dropdown>

                    <Form onFinish={addNewTodo} form={addForm}>
                        <Form.Item
                            name="todo"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Nhập nội dung công việc trước bẹn ei!",
                                },
                            ]}
                            style={{ marginBottom: "0" }}
                        >
                            <Input
                                placeholder={`Xin chào ${user.fullname}!`}
                                size="large"
                                autoComplete="off"
                                suffix={add ? <Spin size="small" /> : <span />}
                                disabled={add ? true : false}
                            />
                        </Form.Item>
                    </Form>

                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Danh sách công việc" key="1">
                            <QueueAnim type={["right", "left"]}>
                                <List
                                    pagination={{
                                        pageSize: 5,
                                        hideOnSinglePage: true,
                                        size: "small",
                                    }}
                                    dataSource={data.filter(
                                        (i) => !i.completed
                                    )}
                                    renderItem={(item) => (
                                        <List.Item
                                            onClick={() => {
                                                _edit(item);
                                                _editContent(item.content);
                                                _editModal(true);
                                            }}
                                        >
                                            <Checkbox
                                                disabled={
                                                    item.id === checkField
                                                }
                                                checked={item.completed}
                                                onChange={(e) => {
                                                    _checkField(item.id);
                                                    updateTodo({
                                                        ...item,
                                                        completed: !item.completed,
                                                    });
                                                }}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                style={{ marginRight: "10px" }}
                                            />
                                            {item.content}
                                        </List.Item>
                                    )}
                                />
                            </QueueAnim>
                        </TabPane>

                        <TabPane tab="Đã hoàn thành" key="2">
                            <List
                                pagination={{
                                    pageSize: 5,
                                    hideOnSinglePage: true,
                                    size: "small",
                                }}
                                dataSource={data.filter((i) => i.completed)}
                                renderItem={(item) => (
                                    <List.Item
                                        onClick={() => {
                                            _edit(item);
                                            _editContent(item.content);
                                            _editModal(true);
                                        }}
                                    >
                                        <Checkbox
                                            disabled={item.id === checkField}
                                            checked={item.completed}
                                            onChange={(e) => {
                                                _checkField(item.id);
                                                updateTodo({
                                                    ...item,
                                                    completed: !item.completed,
                                                });
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ marginRight: "10px" }}
                                        />
                                        {item.content}
                                    </List.Item>
                                )}
                            />
                        </TabPane>

                        <TabPane tab="Tìm kiếm" key="3">
                            <Input
                                type="search"
                                placeholder="Thử tìm xem"
                                size="large"
                                allowClear
                                autoComplete="off"
                                autoFocus={true}
                                onChange={(e) => _search(e.target.value)}
                            />

                            <List
                                pagination={{
                                    pageSize: 5,
                                    hideOnSinglePage: true,
                                    size: "small",
                                }}
                                dataSource={
                                    search
                                        ? data
                                              .filter((i) =>
                                                  reg.test(i.content)
                                              )
                                              .sort(
                                                  (a, b) =>
                                                      b.content.match(reg)
                                                          .length -
                                                      a.content.match(reg)
                                                          .length
                                              )
                                        : []
                                }
                                renderItem={(item) => (
                                    <List.Item
                                        onClick={() => {
                                            _edit(item);
                                            _editContent(item.content);
                                            _editModal(true);
                                        }}
                                        style={{
                                            justifyContent: "flex-start",
                                        }}
                                    >
                                        <Checkbox
                                            disabled={item.id === checkField}
                                            checked={item.completed}
                                            onChange={(e) => {
                                                _checkField(item.id);
                                                updateTodo({
                                                    ...item,
                                                    completed: !item.completed,
                                                });
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ marginRight: "10px" }}
                                        />
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: item.content.replace(
                                                    reg,
                                                    "<mark style='background-color: #32e0c4; font-weight: bold'>$1</mark>"
                                                ),
                                            }}
                                        />
                                    </List.Item>
                                )}
                            />
                        </TabPane>
                    </Tabs>
                </Space>
            </Col>

            <Modal
                title="Profile"
                visible={modal}
                onCancel={() => _modal(false)}
                onOk={formRef.submit}
                cancelText="Hủy"
                okText="Lưu"
            >
                <UploadAvatar formRef={formRef} _modal={_modal} user={user} />
            </Modal>

            <Modal
                title="Sửa, xóa Công việc"
                visible={editModal}
                onCancel={() => _editModal(false)}
                footer={[
                    <Button
                        key="1"
                        onClick={() => _editModal(false)}
                        icon={<ArrowLeftOutlined />}
                    >
                        Hủy
                    </Button>,
                    <Button
                        key="2"
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={async () => {
                            if (
                                editContent.trim().length > 0 &&
                                editContent !== edit.content
                            ) {
                                await updateTodo({
                                    ...edit,
                                    content: editContent,
                                });
                                _editModal(false);
                            }
                        }}
                    >
                        Lưu
                    </Button>,
                    <Popconfirm
                        title="Xóa thật nhé? 😤😤😤"
                        okButtonProps={{ danger: true }}
                        okType="primary"
                        onConfirm={async () => {
                            await deleteTodo(edit.id);
                            _editModal(false);
                        }}
                    >
                        <Button
                            key="3"
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            style={{ float: "left" }}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>,
                ]}
            >
                <Input
                    value={editContent}
                    placeholder="Nhập công việc bẹn ei!"
                    onChange={(e) => _editContent(e.target.value)}
                    autoFocus={true}
                    size="large"
                    ref={modalInputRef}
                    onPressEnter={async () => {
                        if (
                            editContent.trim().length > 0 &&
                            editContent !== edit.content
                        ) {
                            await updateTodo({ ...edit, content: editContent });
                            _editModal(false);
                        }
                    }}
                />
            </Modal>
        </Row>
    );
}

export async function getServerSideProps(ctx) {
    const token = cookies(ctx).token;

    const { req, res } = ctx;

    if (!token) {
        res.writeHead(302, { Location: "/login" });
        res.end();

        return { props: {} };
    }

    const tkData = jwt.verify(token, process.env.SECRET_KEY);

    if (!tkData) {
        res.writeHead(302, {
            Location: "/login",
            "Set-Cookie": "token=; Path=/; HttpOnly;",
        });
        res.end();

        return { props: {} };
    }

    const user = await query(
        "SELECT fullname, username, avatar FROM user WHERE id = ?",
        tkData.id
    );

    if (!user || user.length === 0) {
        res.writeHead(302, {
            Location: "/login",
            "Set-Cookie": "token=; Path=/; HttpOnly;",
        });
        res.end();

        return { props: {} };
    }

    const list = await query(
        "SELECT id, content, created, modified, completed FROM todo WHERE user_id = ? ORDER BY modified DESC",
        tkData.id
    );

    return {
        props: {
            user: JSON.parse(JSON.stringify(user[0])),
            list: JSON.parse(JSON.stringify(list)),
        },
    };
}
