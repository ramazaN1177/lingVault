'use client'
import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Form,
  Select,
  Space,
  Typography,
  Result,
  Alert,
  Radio,
  Progress,
  Divider,
  Empty,
  Spin
} from 'antd';
import { SoundOutlined, CheckOutlined, CloseOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useGetCurrentUser, useListWords } from '@/react-query/queriessAndMutations';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const PracticePage = () => {
  const [form] = Form.useForm();
  const [currentWord, setCurrentWord] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedLanguagePair, setSelectedLanguagePair] = useState('all');
  const [practiceMode, setPracticeMode] = useState('word-to-meaning');
  const [practicing, setPracticing] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0, incorrect: 0 });
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
      
      // Set a default language pair if available
      if (pairs.size > 0 && selectedLanguagePair === 'all') {
        setSelectedLanguagePair(Array.from(pairs)[0]);
      }
    }
  }, [wordsData]);

  // Start practice session
  const startPractice = () => {
    if (!wordsData?.documents || wordsData.documents.length === 0) {
      return;
    }
    
    setPracticing(true);
    setStats({ total: 0, correct: 0, incorrect: 0 });
    pickRandomWord();
  };

  // Pick a random word from the available words
  const pickRandomWord = () => {
    if (!wordsData?.documents || wordsData.documents.length === 0) {
      setPracticing(false);
      return;
    }
    
    // Filter words by selected language pair
    const wordsToChooseFrom = selectedLanguagePair === 'all' 
      ? wordsData.documents
      : wordsData.documents.filter((word: any) => {
          return `${word.languageFrom}-${word.languageTo}` === selectedLanguagePair;
        });
    
    if (wordsToChooseFrom.length === 0) {
      setPracticing(false);
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * wordsToChooseFrom.length);
    setCurrentWord(wordsToChooseFrom[randomIndex]);
    setUserAnswer('');
    setShowAnswer(false);
    setIsCorrect(null);
  };

  // Check user's answer
  const checkAnswer = () => {
    if (!userAnswer.trim() || !currentWord) return;
    
    // Get the correct answer based on practice mode
    const correctAnswer = practiceMode === 'word-to-meaning' 
      ? currentWord.translatedWord.toLowerCase() 
      : currentWord.originalWord.toLowerCase();
    
    const isAnswerCorrect = userAnswer.toLowerCase().trim() === correctAnswer.trim();
    setIsCorrect(isAnswerCorrect);
    
    // Update stats
    setStats(prev => ({
      total: prev.total + 1,
      correct: isAnswerCorrect ? prev.correct + 1 : prev.correct,
      incorrect: isAnswerCorrect ? prev.incorrect : prev.incorrect + 1
    }));
  };

  // Reveal the answer
  const revealAnswer = () => {
    setShowAnswer(true);
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      incorrect: prev.incorrect + 1
    }));
  };

  // Move to next word
  const nextWord = () => {
    pickRandomWord();
  };

  // Format the word or meaning to display based on practice mode
  const getDisplayText = () => {
    if (!currentWord) return '';
    return practiceMode === 'word-to-meaning' 
      ? currentWord.originalWord 
      : currentWord.translatedWord;
  };

  // Get the answer to display when revealed
  const getAnswerText = () => {
    if (!currentWord) return '';
    return practiceMode === 'word-to-meaning' 
      ? currentWord.translatedWord 
      : currentWord.originalWord;
  };

  // Display language direction
  const getLanguageDirection = () => {
    if (!currentWord) return '';
    
    // Capitalize first letter of language names
    const fromCapitalized = currentWord.languageFrom.charAt(0).toUpperCase() + 
                           currentWord.languageFrom.slice(1);
    const toCapitalized = currentWord.languageTo.charAt(0).toUpperCase() + 
                         currentWord.languageTo.slice(1);
                         
    return practiceMode === 'word-to-meaning'
      ? `${fromCapitalized} → ${toCapitalized}`
      : `${toCapitalized} → ${fromCapitalized}`;
  };
  
  // Format language pair for display
  const formatLanguagePair = (pair: string) => {
    const [from, to] = pair.split('-');
    const fromCapitalized = from.charAt(0).toUpperCase() + from.slice(1);
    const toCapitalized = to.charAt(0).toUpperCase() + to.slice(1);
    return `${fromCapitalized} - ${toCapitalized}`;
  };

  if (isLoadingUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Title level={3}>Please log in to practice vocabulary</Title>
        <Text type="secondary">You need to be logged in to access your vocabulary words.</Text>
      </div>
    );
  }

  if (isLoadingWords) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const hasWords = wordsData?.documents && wordsData.documents.length > 0;
  const hasFilteredWords = selectedLanguagePair === 'all' || availableLanguagePairs.includes(selectedLanguagePair);

  return (
    <div>
      <ProCard>
        <Title level={4}>Practice Vocabulary</Title>
        <Text type="secondary">Test your vocabulary knowledge.</Text>
        
        <Divider />
        
        {!practicing ? (
          <div style={{ marginBottom: 20 }}>
            <Form layout="vertical">
              <Form.Item label="Select Language Pair">
                <Select 
                  value={selectedLanguagePair}
                  style={{ width: 200 }} 
                  onChange={value => setSelectedLanguagePair(value)}
                >
                  {availableLanguagePairs.length > 1 && 
                    <Option value="all">All Language Pairs</Option>
                  }
                  {availableLanguagePairs.map(pair => (
                    <Option key={pair} value={pair}>
                      {formatLanguagePair(pair)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item label="Practice Mode">
                <Radio.Group 
                  value={practiceMode}
                  onChange={e => setPracticeMode(e.target.value)}
                >
                  <Radio.Button value="word-to-meaning">Word → Meaning</Radio.Button>
                  <Radio.Button value="meaning-to-word">Meaning → Word</Radio.Button>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  onClick={startPractice}
                  disabled={!hasWords || !hasFilteredWords}
                >
                  Start Practice
                </Button>
              </Form.Item>
            </Form>
            
            {(!hasWords || !hasFilteredWords) && (
              <Empty 
                description="No words available for this language pair. Please add some words first."
                style={{ marginTop: 40 }}
              />
            )}
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Space>
                <Text strong>Mode:</Text>
                <Text>{getLanguageDirection()}</Text>
              </Space>
              
              <div style={{ float: 'right' }}>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={() => setPracticing(false)}
                >
                  Restart
                </Button>
              </div>
            </div>
            
            <Card 
              style={{ 
                marginBottom: 20,
                background: '#f9f9f9',
                textAlign: 'center',
                padding: '20px 0'
              }}
            >
              <Title level={3}>{getDisplayText()}</Title>
              <Button 
                icon={<SoundOutlined />}
                style={{ marginTop: 10 }}
                onClick={() => {
                  // Text-to-speech functionality
                  const speech = new SpeechSynthesisUtterance(getDisplayText());
                  // Set language for speech based on current word's language
                  if (currentWord) {
                    const lang = practiceMode === 'word-to-meaning' 
                      ? currentWord.languageFrom
                      : currentWord.languageTo;
                      
                    // Map language to BCP 47 language tags
                    const langMap: {[key: string]: string} = {
                      english: 'en-US',
                      turkish: 'tr-TR',
                      spanish: 'es-ES',
                      french: 'fr-FR',
                      german: 'de-DE'
                    };
                    
                    if (langMap[lang]) {
                      speech.lang = langMap[lang];
                    }
                  }
                  window.speechSynthesis.speak(speech);
                }}
              >
                Pronounce
              </Button>
            </Card>
            
            {isCorrect === null && !showAnswer ? (
              <Form form={form}>
                <Form.Item>
                  <Input 
                    placeholder="Enter your answer" 
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    size="large"
                    onPressEnter={checkAnswer}
                  />
                </Form.Item>
                
                <Form.Item>
                  <Space>
                    <Button type="primary" onClick={checkAnswer}>
                      Check Answer
                    </Button>
                    <Button icon={<EyeOutlined />} onClick={revealAnswer}>
                      Reveal Answer
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <div>
                {isCorrect !== null && (
                  <Alert
                    message={isCorrect ? "Correct!" : "Incorrect!"}
                    description={
                      <div>
                        <div>The correct answer is: <Text strong>{getAnswerText()}</Text></div>
                        {!isCorrect && <div>Your answer was: <Text delete>{userAnswer}</Text></div>}
                      </div>
                    }
                    type={isCorrect ? "success" : "error"}
                    showIcon
                    icon={isCorrect ? <CheckOutlined /> : <CloseOutlined />}
                    style={{ marginBottom: 20 }}
                  />
                )}
                
                {showAnswer && (
                  <Alert
                    message="Answer Revealed"
                    description={
                      <div>
                        The correct answer is: <Text strong>{getAnswerText()}</Text>
                      </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 20 }}
                  />
                )}
                
                <Button type="primary" onClick={nextWord}>
                  Next Word
                </Button>
              </div>
            )}
            
            <Divider />
            
            <div>
              <Title level={5}>Session Statistics</Title>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text>Total: {stats.total}</Text>
                </div>
                <div>
                  <Text type="success">Correct: {stats.correct}</Text>
                </div>
                <div>
                  <Text type="danger">Incorrect: {stats.incorrect}</Text>
                </div>
                <div>
                  <Text>Accuracy: {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</Text>
                </div>
              </div>
              
              {stats.total > 0 && (
                <Progress 
                  percent={Math.round((stats.correct / stats.total) * 100)}
                  status={Math.round((stats.correct / stats.total) * 100) >= 70 ? "success" : "active"}
                  style={{ marginTop: 10 }}
                />
              )}
            </div>
          </div>
        )}
      </ProCard>
    </div>
  );
};

export default PracticePage;