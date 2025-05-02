'use client'
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Form, 
  Select, 
  Modal, 
  Space, 
  message,
  Typography,
  Divider,
  Spin,
  Empty 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useGetCurrentUser, useListWords, useAddWord, useUpdateWord, useDeleteWord } from '@/react-query/queriessAndMutations';

const { Option } = Select;
const { Title, Text } = Typography;

const Main = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWord, setEditingWord] = useState<{ $id: string; originalWord: string; translatedWord: string; languageFrom: string; languageTo: string } | null>(null);
  const [selectedLanguagePair, setSelectedLanguagePair] = useState('all');
  const [availableLanguagePairs, setAvailableLanguagePairs] = useState<string[]>([]);

  // Get current user 
  const { data: currentUser, isLoading: isLoadingUser } = useGetCurrentUser();
  
  // Get words for the current user
  const { data: wordsData, isLoading: isLoadingWords } = useListWords(currentUser?.$id || '');
  
  // Extract unique language pairs from words data
  useEffect(() => {
    if (wordsData?.documents) {
      const pairs = new Set<string>();
      wordsData.documents.forEach((word: any) => {
        pairs.add(`${word.languageFrom}-${word.languageTo}`);
      });
      setAvailableLanguagePairs(Array.from(pairs));
    }
  }, [wordsData]);

  // Mutations for word operations
  const { mutate: addWordMutation, isPending: isAddingWord } = useAddWord();
  const { mutate: updateWordMutation, isPending: isUpdatingWord } = useUpdateWord();
  const { mutate: deleteWordMutation, isPending: isDeletingWord } = useDeleteWord();

  const showAddModal = () => {
    setEditingWord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record: any) => {
    setEditingWord(record);
    form.setFieldsValue({
      originalWord: record.originalWord,
      translatedWord: record.translatedWord,
      languageFrom: record.languageFrom,
      languageTo: record.languageTo
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingWord) {
        // Update existing word
        updateWordMutation({
          wordId: editingWord.$id,
          word: {
            originalWord: values.originalWord,
            translatedWord: values.translatedWord,
            languageFrom: values.languageFrom,
            languageTo: values.languageTo
          }
        }, {
          onSuccess: () => {
            message.success('Word updated successfully');
            setIsModalVisible(false);
          },
          onError: (error) => {
            console.error("Update error:", error);
            message.error('Failed to update word');
          }
        });
      } else {
        // Add new word
        if (!currentUser?.$id) {
          message.error('You must be logged in to add words');
          return;
        }
        
        addWordMutation({
          originalWord: values.originalWord,
          translatedWord: values.translatedWord,
          languageFrom: values.languageFrom,
          languageTo: values.languageTo,
          userId: currentUser.$id
        }, {
          onSuccess: () => {
            message.success('Word added successfully');
            setIsModalVisible(false);
            form.resetFields();
          },
          onError: (error) => {
            console.error("Add error:", error);
            message.error('Failed to add word');
          }
        });
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this word?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteWordMutation(id, {
          onSuccess: () => {
            message.success('Word deleted successfully');
          },
          onError: (error) => {
            console.error("Delete error:", error);
            message.error('Failed to delete word');
          }
        });
      },
    });
  };

  const getLanguagePairDisplay = (from: string, to: string) => {
    // Capitalize first letter of language names
    const fromCapitalized = from.charAt(0).toUpperCase() + from.slice(1);
    const toCapitalized = to.charAt(0).toUpperCase() + to.slice(1);
    return `${fromCapitalized} → ${toCapitalized}`;
  };

  const columns = [
    {
      title: 'Original Word',
      dataIndex: 'originalWord',
      key: 'originalWord',
      sorter: (a: any, b: any) => a.originalWord.localeCompare(b.originalWord),
    },
    {
      title: 'Translation',
      dataIndex: 'translatedWord',
      key: 'translatedWord',
    },
    {
      title: 'Language Pair',
      key: 'languagePair',
      render: (_: any, record: any) => getLanguagePairDisplay(record.languageFrom, record.languageTo),
      filters: availableLanguagePairs.map(pair => {
        const [from, to] = pair.split('-');
        return {
          text: getLanguagePairDisplay(from, to),
          value: pair,
        };
      }),
      onFilter: (value: any, record: any) => `${record.languageFrom}-${record.languageTo}` === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
            type="text"
          />
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.$id)}
            type="text"
            danger
          />
        </Space>
      ),
    },
  ];

  // Filter words based on selected language pair
  const filteredWords = wordsData?.documents?.filter((word: any) => {
    if (selectedLanguagePair === 'all') return true;
    return `${word.languageFrom}-${word.languageTo}` === selectedLanguagePair;
  }) || [];

  if (isLoadingUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading user data..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Title level={3}>Please log in to manage your vocabulary</Title>
        <Text type="secondary">You need to be logged in to view and manage your vocabulary words.</Text>
      </div>
    );
  }

  return (
    <div>
      <ProCard>
        <Title level={4}>Vocabulary Management</Title>
        <Text type="secondary">Add, edit, and manage your vocabulary words here.</Text>
        
        <Divider />
        
        <Space style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
            loading={isAddingWord}
          >
            Add Word
          </Button>
          <Button icon={<ImportOutlined />}>Import</Button>
          <Button icon={<ExportOutlined />}>Export</Button>
          
          <Select 
            defaultValue="all" 
            style={{ width: 180 }} 
            onChange={setSelectedLanguagePair}
          >
            <Option value="all">All Languages</Option>
            {availableLanguagePairs.map(pair => {
              const [from, to] = pair.split('-');
              return (
                <Option key={pair} value={pair}>
                  {getLanguagePairDisplay(from, to)}
                </Option>
              );
            })}
          </Select>
        </Space>
        
        <Table 
          columns={columns} 
          dataSource={filteredWords} 
          rowKey="$id"
          pagination={{ pageSize: 10 }}
          loading={isLoadingWords}
          locale={{
            emptyText: <Empty description="No vocabulary words found. Add some words to get started!" />
          }}
        />
      </ProCard>

      <Modal
        title={editingWord ? 'Edit Word' : 'Add New Word'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSave}
        okText={editingWord ? 'Update' : 'Add'}
        confirmLoading={isAddingWord || isUpdatingWord}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="originalWord"
            label="Original Word"
            rules={[{ required: true, message: 'Please enter the original word' }]}
          >
            <Input placeholder="Enter original word" />
          </Form.Item>
          
          <Form.Item
            name="translatedWord"
            label="Translation"
            rules={[{ required: true, message: 'Please enter the translation' }]}
          >
            <Input placeholder="Enter translation" />
          </Form.Item>
          
          <Form.Item
            name="languageFrom"
            label="From Language"
            rules={[{ required: true, message: 'Please select source language' }]}
          >
            <Select placeholder="Select source language">
              <Option value="turkish">Turkish</Option>
              <Option value="english">English</Option>
              <Option value="spanish">Spanish</Option>
              <Option value="french">French</Option>
              <Option value="german">German</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="languageTo"
            label="To Language"
            rules={[{ required: true, message: 'Please select target language' }]}
          >
            <Select placeholder="Select target language">
              <Option value="turkish">Turkish</Option>
              <Option value="english">English</Option>
              <Option value="spanish">Spanish</Option>
              <Option value="french">French</Option>
              <Option value="german">German</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Main;