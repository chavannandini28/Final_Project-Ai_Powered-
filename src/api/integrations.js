// AI and Email integrations - calling backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-power-tours-production.up.railway.app/api';

const getAuthToken = () => localStorage.getItem('authToken');

export const Core = {
  InvokeLLM: async (params) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/invoke-llm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'AI request failed');
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('InvokeLLM error:', error);
      throw error;
    }
  },

  SendEmail: async (params) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Email send failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SendEmail error:', error);
      throw error;
    }
  },

  UploadFile: (params) => {
    console.warn('UploadFile not implemented');
    return Promise.reject(new Error('UploadFile not implemented'));
  },
  
  GenerateImage: (params) => {
    console.warn('GenerateImage not implemented');
    return Promise.reject(new Error('GenerateImage not implemented'));
  },
  
  ExtractDataFromUploadedFile: (params) => {
    console.warn('ExtractDataFromUploadedFile not implemented');
    return Promise.reject(new Error('ExtractDataFromUploadedFile not implemented'));
  },
  
  CreateFileSignedUrl: (params) => {
    console.warn('CreateFileSignedUrl not implemented');
    return Promise.reject(new Error('CreateFileSignedUrl not implemented'));
  },
  
  UploadPrivateFile: (params) => {
    console.warn('UploadPrivateFile not implemented');
    return Promise.reject(new Error('UploadPrivateFile not implemented'));
  },
};

export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = Core.CreateFileSignedUrl;
export const UploadPrivateFile = Core.UploadPrivateFile;






