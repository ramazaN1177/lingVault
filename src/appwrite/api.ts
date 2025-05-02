import { ID, Models, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases } from "./config";

// Define types for user input and database user
interface UserInput {
    email: string;
    password: string;
    fullname: string;
}

interface UserDB {
    accountId: string;
    fullname: string;
    email: string;
    imageUrl: string;
}

// Create a new user account
export async function createUserAccount(user: UserInput): Promise<Models.Document | Error> {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.fullname
        );

        if (!newAccount) throw new Error("Failed to create account");

        const avatarUrl = avatars.getInitials(user.fullname);

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            fullname: user.fullname,
            email: newAccount.email,
            imageUrl: avatarUrl,
        });

        return newUser;
    } catch (error) {
        console.error("Error creating user account:", error);
        throw error;
    }
}

// Save user to the database
export async function saveUserToDB(user: UserDB): Promise<Models.Document> {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user
        );

        return newUser;
    } catch (error) {
        console.error("Error saving user to DB:", error);
        throw error;
    }
}

// Log in to an account
export async function LoginAccount(user: { email: string; password: string }): Promise<Models.Session> {
    try {
        const session = await account.createEmailPasswordSession(user.email, user.password);
        return session;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

// Get the current account
export async function getAccount(){
    try {
        const currentAccount = await account.get();
        return currentAccount;
    } catch (error) {
        console.error("Error fetching account:", error);
        return null;
    }
}

// Get the current user from the database
export async function getCurrentUser(): Promise<Models.Document | null> {
    try {
        const currentAccount = await getAccount();

        if (!currentAccount) throw new Error("No current account found");

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        if (!currentUser.documents.length) throw new Error("User not found in database");

        return currentUser.documents[0];
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
}

// Log out of the current account
export async function logOutAccount(): Promise<void> {
    try {
        await account.deleteSession("current");
    } catch (error) {
        console.error("Error logging out:", error);
    }
}
// Define Word interface for TypeScript type safety
interface Word {
    originalWord: string;
    translatedWord: string;
    languageFrom: string;
    languageTo: string;
    userId: string;
  }
  
  interface WordUpdate {
    originalWord?: string;
    translatedWord?: string;
    languageFrom?: string;
    languageTo?: string;
  }
  
  // Add a new word
  export async function addWord(word: Word): Promise<Models.Document> {
    try {
      const newWord = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.documentCollectionId, // You'll need to add this to your appwriteConfig
        ID.unique(),
        {
          originalWord: word.originalWord,
          translatedWord: word.translatedWord,
          languageFrom: word.languageFrom,
          languageTo: word.languageTo,
          userId: word.userId,
        }
      );
      return newWord;
    } catch (error) {
      console.error("Error adding word:", error);
      throw error;
    }
  }
  
  // List words for a user
 // List words for a user
export async function listWords(userId: string, limit: number = 100, random: boolean = false) {
    try {
      let queries = [Query.equal('userId', userId)];
      
      // Fetch documents from database
      // Remove the orderDesc('createdAt') since the field doesn't exist in schema
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.documentCollectionId,
        [
          ...queries,
          Query.limit(limit)
        ]
      );
      
      if (random && response.documents.length > 0) {
        // Shuffle the array for random selection
        const shuffled = [...response.documents];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return {
          ...response,
          documents: shuffled.slice(0, limit)
        };
      }
      
      return response;
    } catch (error) {
      console.error("Error listing words:", error);
      throw error;
    }
  }
  
  // Delete a word
  export async function deleteWord(wordId: string) {
    try {
      return await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.documentCollectionId,
        wordId
      );
    } catch (error) {
      console.error("Error deleting word:", error);
      throw error;
    }
  }
  
  // Update a word
  export async function updateWord(wordId: string, wordUpdate: WordUpdate) {
    try {
      const updatedData: WordUpdate = {};
      
      if (wordUpdate.originalWord !== undefined) updatedData.originalWord = wordUpdate.originalWord;
      if (wordUpdate.translatedWord !== undefined) updatedData.translatedWord = wordUpdate.translatedWord;
      if (wordUpdate.languageFrom !== undefined) updatedData.languageFrom = wordUpdate.languageFrom;
      if (wordUpdate.languageTo !== undefined) updatedData.languageTo = wordUpdate.languageTo;
      
      return await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.documentCollectionId,
        wordId,
        updatedData
      );
    } catch (error) {
      console.error("Error updating word:", error);
      throw error;
    }
  }