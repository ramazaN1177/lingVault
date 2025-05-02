"use client";
import { useState } from "react";
import { Tabs, Form, Input, Button, Typography, Card, Row, Col, Divider, Space } from "antd";
import { useRouter } from "next/navigation";
import { toast,ToastContainer } from "react-toastify";
import { useUserContext } from "@/context/AuthContext";
import { useCreateUserAccount, useLoginAccount } from "@/react-query/queriessAndMutations";
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from "@ant-design/icons";
import Loader from "./components/loader"; // Loader bileşenini içe aktarıyoruz

const { Title, Text } = Typography;

export default function Auth() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: loginAccount } = useLoginAccount();
  const { isLoading: isUserLoading } = useUserContext();
  const { checkAuthUser } = useUserContext();
  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } = useCreateUserAccount();

  const handleLogin = async (values:any) => {
    setIsSubmitting(true);
    try {
      const session = await loginAccount({
        email: values.email,
        password: values.password,
      });

      if (session) {
        const isUserExist = await checkAuthUser();
        if (isUserExist) {
          toast.success("Login successful!");
          router.push("/main");
        } else {
          toast.error("User not found. Please register.");
        }
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      toast.error("There was an error logging in.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (values:any) => {
    setIsSubmitting(true);
    try {
      const newUser = await createUserAccount(values);
      if (!newUser) {
        toast.error("User creation failed!");
        return;
      }
      toast.success("User creted succesfully!");
      setActiveTab("login");
      form.resetFields();
    } catch (error) {
      toast.error("There was an error creating the user.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading) {
    return <Loader />;
  }

  const tabItems = [
    {
      key: "login",
      label: (
        <span>
          <UserOutlined /> Login
        </span>
      ),
      children: (
        <Form 
          form={form} 
          onFinish={handleLogin} 
          layout="vertical"
          size="large"
        >
          <Space direction="vertical" style={{ width: '100%', textAlign: 'center', marginBottom: 24 }}>
            <Title level={3}>Hoş Geldiniz</Title>
            <Text type="secondary">Enter your details to log in to your account</Text>
          </Space>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email address!" },
              { type: 'email', message: "Please enter a valid email address!" }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="E-posta"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Lütfen şifrenizi girin!" }]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Şifre"
            />
          </Form.Item>
          
          <Form.Item>
            <Row justify="end">
              <Col>
                <a >Forgot Password</a>
              </Col>
            </Row>
          </Form.Item>
          
          <Form.Item>
            {isSubmitting ? (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <Loader />
              </div>
            ) : (
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
              >
                Login
              </Button>
            )}
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "register",
      label: (
        <span>
          <UserAddOutlined /> Register
        </span>
      ),
      children: (
        <Form 
          form={form} 
          onFinish={handleRegister} 
          layout="vertical"
          size="large"
        >
          <Space direction="vertical" style={{ width: '100%', textAlign: 'center', marginBottom: 24 }}>
            <Title level={3}>Creat an account</Title>
          </Space>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email address!" },
              { type: 'email', message: "Please enter a valid email address!" }
            ]}
          >
            <Input 
              prefix={<MailOutlined />}
              placeholder="E-posta"
            />
          </Form.Item>
          
          <Form.Item
            name="fullname"
            rules={[{ required: true, message: "Please enter your full name!" }]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="FullName"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please enter your password!" },
              { min: 6, message: "Password must be at least 6 characters!" }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Şifre"
            />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password !" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords are not equal!"));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Password Confirmation"
            />
          </Form.Item>
          
          <Form.Item>
            {isSubmitting ? (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <Loader />
              </div>
            ) : (
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
              >
                Register
              </Button>
            )}
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5', padding: '20px' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card
          bordered={false}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
              LingoVault
            </Title>
            <Divider style={{ marginTop: 12, marginBottom: 24 }} />
          </div>
          
          <Tabs 
            activeKey={activeTab} 
            onChange={(key) => {
              setActiveTab(key);
              form.resetFields();
            }}
            items={tabItems}
            centered
            size="large"
          />
        </Card>
      </Col>
    </Row>
    
  );
}