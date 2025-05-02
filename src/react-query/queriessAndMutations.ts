import{
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,

}from '@tanstack/react-query'
import { getCurrentUser, createUserAccount, logOutAccount } from '../appwrite/api'
import { LoginAccount } from '../appwrite/api'
import { QUERY_KEYS } from './queryKeys';

import { INewUser } from '@/types';
// Import the word-related functions that we'll create in the API file
import { 
addWord, 
listWords, 
deleteWord, 
updateWord 
} from '../appwrite/api';


export const useCreateUserAccount = () => {
  return useMutation({
      mutationFn: async (user:INewUser) => createUserAccount(user)
  });
};

export const useLoginAccount = () => {
  return useMutation({
      mutationFn: (user: { email: string; password: string }) =>
        LoginAccount(user),
    });
};

export const useLogOut = () => {
  return useMutation({
    mutationFn: logOutAccount,
  });
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

// New function to add words to the database
export const useAddWord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (word: { 
      originalWord: string; 
      translatedWord: string; 
      languageFrom: string; 
      languageTo: string;
      userId: string;
    }) => addWord(word),
    onSuccess: () => {
      // Invalidate the words list query to refresh data after adding a new word
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_WORDS]
      });
    }
  });
};

// Function to get all words for a user
export const useListWords = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_WORDS, userId],
    queryFn: () => listWords(userId),
    enabled: !!userId, // Only run the query if we have a userId
  });
};

// Function to delete a word
export const useDeleteWord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (wordId: string) => deleteWord(wordId),
    onSuccess: () => {
      // Invalidate the words list query to refresh data after deletion
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_WORDS]
      });
    }
  });
};

// Function to update a word
export const useUpdateWord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { 
      wordId: string;
      word: { 
        originalWord?: string; 
        translatedWord?: string; 
        languageFrom?: string; 
        languageTo?: string;
      }
    }) => updateWord(params.wordId, params.word),
    onSuccess: () => {
      // Invalidate the words list query to refresh data after update
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_WORDS]
      });
    }
  });
};

// Function to get random words for practice
export const useGetRandomWord = (userId: string, count: number = 1) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RANDOM_WORD, userId, count],
    queryFn: () => listWords(userId, count, true),
    enabled: !!userId, // Only run the query if we have a userId
  });
};